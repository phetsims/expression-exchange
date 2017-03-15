// Copyright 2016, University of Colorado Boulder

/**
 * A model that allows users to move coin terms around, combine them into expressions, edit the expressions, change the
 * values of the underlying variables, and track different view modes.  This is the main model type used in all of the
 * explore screens and for each of the game challenges.  Options are used to support the different restrictions for
 * each screen.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AllowedRepresentationsEnum = require( 'EXPRESSION_EXCHANGE/common/enum/AllowedRepresentationsEnum' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var CoinTermFactory = require( 'EXPRESSION_EXCHANGE/common/model/CoinTermFactory' );
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var Expression = require( 'EXPRESSION_EXCHANGE/common/model/Expression' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionHint = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionHint' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );

  // constants
  var BREAK_APART_SPACING = 10;
  var RETRIEVED_COIN_TERMS_X_SPACING = 100;
  var RETRIEVED_COIN_TERMS_Y_SPACING = 60;
  var RETRIEVED_COIN_TERM_FIRST_POSITION = new Vector2( 250, 50 ); // upper left, doesn't overlap with control panels
  var NUM_RETRIEVED_COIN_TERM_COLUMNS = 6;
  var MIN_RETRIEVAL_PLACEMENT_DISTANCE = 30; // empirically determined

  /**
   * @constructor
   * {Object} options
   */
  function ExpressionManipulationModel( options ) {

    options = _.extend( {

      // TODO: As I write this on 4/15/2016, it occurs to me that maybe the view, rather than the model, is where these
      // TODO: options need to be, and there would be a single model type and variations of the view type.  Revisit this
      // TODO: once the screen behaviors are fully established and refactor if it makes sense to do so.

      // defines whether to present just coins, just variables, or both to the user
      allowedRepresentations: AllowedRepresentationsEnum.COINS_AND_VARIABLES,

      // flag that controls how cancellation is handled in cases where coin terms don't completely cancel each other out
      partialCancellationEnabled: true,

      // flag that controls whether the 'simplify negatives' setting is on or off by default
      simplifyNegativesDefault: false

    }, options );

    var initialViewMode = options.allowedRepresentations === AllowedRepresentationsEnum.VARIABLES_ONLY ?
                          ViewMode.VARIABLES : ViewMode.COINS;

    this.viewModeProperty = new Property( initialViewMode ); // @public
    this.showCoinValuesProperty = new Property( false ); // @public
    this.showVariableValuesProperty = new Property( false ); // @public
    this.showAllCoefficientsProperty = new Property( false ); // @public
    this.xTermValueProperty = new Property( 2 ); // @public
    this.yTermValueProperty = new Property( 5 ); // @public
    this.zTermValueProperty = new Property( 10 ); // @public
    this.totalValueProperty = new Property( 0 ); // @public, read-only
    this.expressionBeingEditedProperty = new Property( null ); // @public, read-only, null when no expression is in edit mode
    this.simplifyNegativesProperty = new Property( options.simplifyNegativesDefault ); // @public

    var self = this;

    // @public, read only, factory used to create coin terms
    this.coinTermFactory = new CoinTermFactory( this.xTermValueProperty, this.yTermValueProperty, this.zTermValueProperty );

    // @public, read only, options that control what is available to the user to manipulate
    this.allowedRepresentations = options.allowedRepresentations;

    // @public, read and listen only, list of all coin terms in the model
    this.coinTerms = new ObservableArray();

    // @public, read and listen only, list of expressions in the model
    this.expressions = new ObservableArray();

    // @public, read and listen only, list of expression hints in the model
    this.expressionHints = new ObservableArray();

    // @public (read-only) - coin terms that end up outside these bounds are moved back inside the bounds
    this.coinTermRetrievalBounds = Bounds2.EVERYTHING;

    // @public, read only - areas where expressions or coin terms can be collected, used only in game
    this.collectionAreas = [];

    /*
     * @private, with some elements accessible via methods define below - This is a populated data structure that
     * contains counts for the various possible combinations of coin term types and minimum decomposition.  For
     * instance, it keeps track of the number of 2X values that can't be further decomposed.
     *
     * This is structured as an object with each of the possible coin term types as the keys.  Each of the values is
     * an array that is indexed by the minimum decomposibility, but is offset to account for the fact that the values
     * can be negative, such as for the number of instances of -2x.  Each element of the array is an object that has
     * a count value and a count property.  The counts are updated any time a coin term is added or removed.  The count
     * properties are created lazily when requested via methods defined below, and are updated at the same time as the
     * counts if they exist.
     */
    this.coinTermCounts = {};
    var countObjectsPerCoinTermType = EESharedConstants.MAX_NON_DECOMPOSABLE_AMOUNT * 2 + 1;
    _.keys( CoinTermTypeID ).forEach( function( coinTermType ) {
      self.coinTermCounts[ coinTermType ] = new Array( countObjectsPerCoinTermType );
      _.times( countObjectsPerCoinTermType, function( index ) {
        self.coinTermCounts[ coinTermType ][ index ] = { count: 0, countProperty: null };
      } );
    } );

    // add a listener that resets the coin term values when the view mode switches from variables to coins
    this.viewModeProperty.link( function( newViewMode, oldViewMode ) {
      if ( newViewMode === ViewMode.COINS && oldViewMode === ViewMode.VARIABLES ) {
        self.xTermValueProperty.reset();
        self.yTermValueProperty.reset();
        self.zTermValueProperty.reset();
      }
    } );

    // function to update the total value of the coin terms
    function updateTotal() {
      var total = 0;
      self.coinTerms.forEach( function( coinTerm ) {
        total += coinTerm.valueProperty.value * coinTerm.totalCountProperty.get();
      } );
      self.totalValueProperty.set( total );
    }

    // add a listener that updates the total whenever one of the term value properties change
    Property.multilink( [ this.xTermValueProperty, this.yTermValueProperty, this.zTermValueProperty ], updateTotal );

    // add a listener that updates the total whenever a coin term is added or removed
    this.coinTerms.lengthProperty.link( updateTotal );

    // when a coin term is added, add listeners to handle the things about it that are dynamic and can affect the model
    this.coinTerms.addItemAddedListener( function( addedCoinTerm ) {
      // TODO: Once this is pretty much fully functional, revisit this and verify that it doesn't leak memory, making
      // TODO: sure that all added listeners are removed.  Also, work through this and see if it can be made more
      // TODO: compact and readable (it's evolving a lot as it's being written)

      // Add a listener that will potentially combine this coin term with expressions or other coin terms based on
      // where it is released.
      function coinTermUserControlledListener( userControlled ) {

        if ( userControlled === false ) {

          var expressionBeingEdited = self.expressionBeingEditedProperty.get();

          if ( !expressionBeingEdited ) {

            // check first for overlap with expressions
            var mostOverlappingExpression = self.getExpressionMostOverlappingWithCoinTerm( addedCoinTerm );
            if ( mostOverlappingExpression ) {
              mostOverlappingExpression.addCoinTerm( addedCoinTerm );
              expressionExchange.log && expressionExchange.log( 'added ' + addedCoinTerm.id + ' to ' +
                                                                mostOverlappingExpression.id );
            }
            else {

              // there was no overlap with expressions, check for overlap with coin terms
              var mostOverlappingLikeCoinTerm = self.getMostOverlappingLikeCoinTerm( addedCoinTerm );

              if ( mostOverlappingLikeCoinTerm ) {

                // combine the two coin terms into a single coin term
                addedCoinTerm.travelToDestination( mostOverlappingLikeCoinTerm.positionProperty.get() );
                addedCoinTerm.destinationReachedEmitter.addListener( function destinationReachedListener() {
                  mostOverlappingLikeCoinTerm.absorb( addedCoinTerm, options.partialCancellationEnabled );
                  expressionExchange.log && expressionExchange.log(
                    mostOverlappingLikeCoinTerm.id + ' absorbed ' + addedCoinTerm.id + ', ' +
                    mostOverlappingLikeCoinTerm.id + ' composition = ' + '[' +
                    mostOverlappingLikeCoinTerm.composition + ']' );
                  self.removeCoinTerm( addedCoinTerm, false );
                  addedCoinTerm.destinationReachedEmitter.removeListener( destinationReachedListener );
                } );
              }
              else {

                // There were no overlapping like coin terms, so check if there are coin terms that could combine into
                // an expression.
                var joinableFreeCoinTerm = self.checkForJoinableFreeCoinTerm( addedCoinTerm );
                if ( joinableFreeCoinTerm ) {

                  // remove any expression hints associated with these coin terms
                  var expressionHintToRemove;
                  self.expressionHints.forEach( function( expressionHint ) {
                    if ( expressionHint.containsCoinTerm( addedCoinTerm ) && expressionHint.containsCoinTerm( joinableFreeCoinTerm ) ) {
                      expressionHintToRemove = expressionHint;
                    }
                  } );
                  if ( expressionHintToRemove ) {
                    self.removeExpressionHint( expressionHintToRemove );
                  }

                  // create the next expression with these coin terms
                  self.expressions.push( new Expression(
                    joinableFreeCoinTerm,
                    addedCoinTerm,
                    self.simplifyNegativesProperty
                  ) );
                }
              }
            }
          }
          else {

            // An expression is being edited, so a released coin term could be either moved to a new location within an
            // expression or combined with another coin term in the expression.

            // state checking
            assert && assert(
              expressionBeingEdited.coinTerms.contains( addedCoinTerm ),
              'coin term being released is not in expression being edited, this should not occur'
            );

            // determine if the coin term was dropped while overlapping a coin term of the same type
            var overlappingLikeCoinTerm = self.getOverlappingLikeCoinTermWithinExpression(
              addedCoinTerm,
              expressionBeingEdited
            );

            if ( overlappingLikeCoinTerm ) {

              // combine the dropped coin term with the one with which it overlaps
              overlappingLikeCoinTerm.absorb( addedCoinTerm, options.partialCancellationEnabled );
              expressionExchange.log && expressionExchange.log(
                overlappingLikeCoinTerm.id + ' absorbed ' + addedCoinTerm.id + ', ' + overlappingLikeCoinTerm.id +
                ' composition = ' + '[' + overlappingLikeCoinTerm.composition + ']' );
              self.removeCoinTerm( addedCoinTerm, false );
            }
            else {

              // the coin term has been dropped at some potentially new location withing the expression
              expressionBeingEdited.reintegrateCoinTerm( addedCoinTerm );
            }
          }
        }
      }

      addedCoinTerm.userControlledProperty.lazyLink( coinTermUserControlledListener );

      // add a listener that will handle requests to break apart the coin term
      function coinTermBreakApartListener() {

        if ( addedCoinTerm.composition.length < 2 ) {
          // bail if the coin term can't be decomposed
          return;
        }
        var extractedCoinTerms = addedCoinTerm.extractConstituentCoinTerms();
        var relativeViewBounds = addedCoinTerm.relativeViewBoundsProperty.get();

        // If the total combined coin count was even, shift the 'parent coin' a bit so that the coins end up being
        // distributed around the centerX position.
        if ( extractedCoinTerms.length % 2 === 1 ) {
          addedCoinTerm.travelToDestination(
            new Vector2(
              addedCoinTerm.positionProperty.get().x - relativeViewBounds.width / 2 - BREAK_APART_SPACING / 2,
              addedCoinTerm.positionProperty.get().y
            )
          );
        }

        // add the extracted coin terms to the model
        var interCoinTermDistance = relativeViewBounds.width + BREAK_APART_SPACING;
        var nextLeftX = addedCoinTerm.destinationProperty.get().x - interCoinTermDistance;
        var nextRightX = addedCoinTerm.destinationProperty.get().x + interCoinTermDistance;
        extractedCoinTerms.forEach( function( extractedCoinTerm, index ) {
          var destination;
          self.addCoinTerm( extractedCoinTerm );
          if ( index % 2 === 0 ) {
            destination = new Vector2( nextRightX, addedCoinTerm.positionProperty.get().y );
            nextRightX += interCoinTermDistance;
          }
          else {
            destination = new Vector2( nextLeftX, addedCoinTerm.positionProperty.get().y );
            nextLeftX -= interCoinTermDistance;
          }

          // if the destination is outside of the allowed bounds, change it to be in bounds
          if ( !self.coinTermRetrievalBounds.containsPoint( destination ) ) {
            destination = self.getNextOpenRetrievalSpot();
          }

          // initiate the animation
          extractedCoinTerm.travelToDestination( destination );
        } );
      }

      addedCoinTerm.breakApartEmitter.addListener( coinTermBreakApartListener );

      // add a listener that will remove this coin if and when it returns to its original position
      function coinTermReturnedToOriginListener() {
        self.removeCoinTerm( addedCoinTerm, false );
      }

      addedCoinTerm.returnedToOriginEmitter.addListener( coinTermReturnedToOriginListener );

      // monitor the existence strength of this coin term
      function coinTermExistenceStrengthListener( existenceStrength ) {

        if ( existenceStrength <= 0 ) {

          // the existence strength has gone to zero, remove this from the model
          self.removeCoinTerm( addedCoinTerm, false );

          if ( self.expressionBeingEditedProperty.get() ) {
            if ( self.expressionBeingEditedProperty.get().coinTerms.length === 0 ) {

              // the removal of the coin term caused the expression being edited to be empty, so drop out of edit mode
              self.stopEditingExpression();
            }
          }
        }
      }

      addedCoinTerm.existenceStrengthProperty.link( coinTermExistenceStrengthListener );

      // clean up the listeners added above if and when this coin term is removed from the model
      self.coinTerms.addItemRemovedListener( function coinTermRemovalListener( removedCoinTerm ) {
        if ( removedCoinTerm === addedCoinTerm ) {
          addedCoinTerm.userControlledProperty.unlink( coinTermUserControlledListener );
          addedCoinTerm.breakApartEmitter.removeListener( coinTermBreakApartListener );
          addedCoinTerm.returnedToOriginEmitter.removeListener( coinTermReturnedToOriginListener );
          addedCoinTerm.existenceStrengthProperty.unlink( coinTermExistenceStrengthListener );
          self.coinTerms.removeItemRemovedListener( coinTermRemovalListener );
        }
      } );
    } );

    this.expressions.addItemAddedListener( function( addedExpression ) {
      // TODO: Revisit this and verify that this doesn't leak memory

      // add a listener for when the expression is released, which may cause it to be combined with another expression
      function expressionUserControlledListener( userControlled ) {

        if ( !userControlled ) {

          // test if this expression was dropped over a collection area (collection areas are only used in the game)
          var mostOverlappingCollectionArea = self.getMostOverlappingCollectionAreaForExpression( addedExpression );

          if ( mostOverlappingCollectionArea ) {

            // Attempt to put this expression into the collection area.  The collection area will take care of either
            // moving the expression inside or pushing it to the side.
            mostOverlappingCollectionArea.collectOrRejectExpression( addedExpression );
          }
          else {

            // check for overlap with other expressions, if there is one or more, combine with the one with the most overlap
            var mostOverlappingExpression = self.getExpressionMostOverlappingWithExpression( addedExpression );

            if ( mostOverlappingExpression ) {

              // remove the expression from the list of those hovering
              mostOverlappingExpression.removeHoveringExpression( addedExpression );

              // send the combining expression to the right side of receiving expression
              addedExpression.travelToDestination(
                mostOverlappingExpression.upperLeftCornerProperty.get().plusXY(
                  mostOverlappingExpression.widthProperty.get(), 0
                )
              );

              // Listen for when the expression is in place and, when it is, transfer its coin terms to the receiving expression.
              addedExpression.destinationReachedEmitter.addListener( function destinationReachedListener() {
                var coinTermsToBeMoved = addedExpression.removeAllCoinTerms();
                self.expressions.remove( addedExpression );
                coinTermsToBeMoved.forEach( function( coinTerm ) {
                  expressionExchange.log && expressionExchange.log( 'moving ' + coinTerm.id + ' from ' +
                                                                    addedExpression.id + ' to ' +
                                                                    mostOverlappingExpression.id );
                  mostOverlappingExpression.addCoinTerm( coinTerm );
                } );
                addedExpression.destinationReachedEmitter.removeListener( destinationReachedListener );
                // TODO: I haven't thought through and added handling for the case where a reset occurs during the course
                // TODO: of this animation.  How does the listener get removed in that case, or does it even have to?  I'll
                // TODO: need to do that at some point.
              } );
            }
            else {

              // check for free coin terms that overlap with this expression and thus should be combined with it
              var numOverlappingCoinTerms = addedExpression.hoveringCoinTerms.length;

              assert && assert(
                numOverlappingCoinTerms === 0 || numOverlappingCoinTerms === 1,
                'max of one overlapping free coin term when expression is released, seeing ' + numOverlappingCoinTerms
              );

              if ( numOverlappingCoinTerms === 1 ) {
                var coinTermToAddToExpression = addedExpression.hoveringCoinTerms[ 0 ];
                if ( addedExpression.rightHintActiveProperty.get() ) {

                  // move to the left side of the coin term
                  addedExpression.travelToDestination(
                    coinTermToAddToExpression.positionProperty.get().plusXY(
                      -addedExpression.widthProperty.get() - addedExpression.rightHintWidthProperty.get() / 2,
                      -addedExpression.heightProperty.get() / 2
                    )
                  );
                }
                else {

                  assert && assert(
                    addedExpression.leftHintActiveProperty.get(),
                    'at least one hint should be active if there is a hovering coin term'
                  );

                  // move to the right side of the coin term
                  addedExpression.travelToDestination(
                    coinTermToAddToExpression.positionProperty.get().plusXY(
                      addedExpression.leftHintWidthProperty.get() / 2,
                      -addedExpression.heightProperty.get() / 2
                    )
                  );
                }

                addedExpression.destinationReachedEmitter.addListener( function addCoinTermAfterAnimation() {
                  addedExpression.addCoinTerm( coinTermToAddToExpression );
                  addedExpression.destinationReachedEmitter.removeListener( addCoinTermAfterAnimation );
                } );

              }
            }
          }
        }
      }

      addedExpression.userControlledProperty.lazyLink( expressionUserControlledListener );

      // add a listener that will handle requests to break apart this expression
      function expressionBreakApartListener() {

        // keep a reference to the center for when we spread out the coin terms
        var expressionCenterX = addedExpression.getBounds().centerX;

        // remove the coin terms from the expression and the expression from the model
        var newlyFreedCoinTerms = addedExpression.removeAllCoinTerms();
        self.expressions.remove( addedExpression );

        // spread the released coin terms out horizontally
        //var numRetrievedCoinTerms = 0;
        newlyFreedCoinTerms.forEach( function( newlyFreedCoinTerm ) {

          // calculate a destination that will cause the coin terms to spread out from the expression center
          var horizontalDistanceFromExpressionCenter = newlyFreedCoinTerm.positionProperty.get().x - expressionCenterX;
          var coinTermDestination = new Vector2(
            newlyFreedCoinTerm.positionProperty.get().x + horizontalDistanceFromExpressionCenter * 0.15, // spread factor empirically determined
            newlyFreedCoinTerm.positionProperty.get().y
          );

          // if the destination is outside of the allowed bounds, change it to be in bounds
          if ( !self.coinTermRetrievalBounds.containsPoint( coinTermDestination ) ) {
            coinTermDestination = self.getNextOpenRetrievalSpot();
          }

          // initiate the animation
          newlyFreedCoinTerm.travelToDestination( coinTermDestination );
        } );
      }

      addedExpression.breakApartEmitter.addListener( expressionBreakApartListener );

      // add a listener that will handle requests to edit this expression
      function editExpressionListener() {
        self.expressionBeingEditedProperty.set( addedExpression );
      }

      addedExpression.selectedForEditEmitter.addListener( editExpressionListener );

      // remove the listeners when this expression is removed
      self.expressions.addItemRemovedListener( function expressionRemovedListener( removedExpression ) {
        if ( removedExpression === addedExpression ) {
          addedExpression.dispose();
          addedExpression.userControlledProperty.unlink( expressionUserControlledListener );
          addedExpression.breakApartEmitter.removeListener( expressionBreakApartListener );
          addedExpression.selectedForEditEmitter.removeListener( editExpressionListener );
          self.expressions.removeItemRemovedListener( expressionRemovedListener );
        }
      } );
    } );
  }

  expressionExchange.register( 'ExpressionManipulationModel', ExpressionManipulationModel );

  return inherit( Object, ExpressionManipulationModel, {

    /**
     * main step function for this model, should only be called by the framework
     * @param {number} dt
     * @public
     */
    step: function( dt ) {

      var self = this;
      var userControlledCoinTerms;
      var coinTermsWithHalos = [];

      // TODO: Part of the state control for expressions, hints, halos, etc, is done where while part of it is done
      // with event handlers on the userControlled property for the coin terms and expressions.  At some point, when the
      // functionality is fairly mature, I (jbphet) should look at consolidating these in order to make the code more
      // understandable and maintainable.

      if ( !this.expressionBeingEditedProperty.get() ) {

        // get a list of user controlled expressions, max of one on mouse based systems, any number on touch devices
        var userControlledExpressions = _.filter( this.expressions.getArray(), function( expression ) {
          return expression.userControlledProperty.get();
        } );

        // Check each user controlled expression to see if it is in a position to combine with another expression and,
        // if it is, add the appropriate hints
        userControlledExpressions.forEach( function( userControlledExpression ) {
          var mostOverlappingExpression = self.getExpressionMostOverlappingWithExpression( userControlledExpression );

          // update hover info for each expression with respect to this expression, which in turn activates halos
          self.expressions.forEach( function( expression ) {
            if ( expression === mostOverlappingExpression ) {
              expression.addHoveringExpression( userControlledExpression );
            }
            else {
              //
              expression.removeHoveringExpression( userControlledExpression );
            }
          } );

          // update overlap info with respect to free coin terms
          var mostOverlappingCoinTerm = self.getFreeCoinTermMostOverlappingWithExpression( userControlledExpression );
          userControlledExpression.clearHoveringCoinTerms();
          if ( mostOverlappingCoinTerm ) {

            // there can only be one most overlapping coin term, so out with the old, in with the new
            userControlledExpression.addHoveringCoinTerm( mostOverlappingCoinTerm );
          }
        } );

        // get a list of all user controlled coin terms, max of one coin on mouse-based systems, any number on touch devices
        userControlledCoinTerms = _.filter( this.coinTerms.getArray(), function( coin ) {
          return coin.userControlledProperty.get();
        } );

        // check each user-controlled coin term to see if it's in a position to combine with an expression or another coin term
        var neededExpressionHints = [];
        userControlledCoinTerms.forEach( function( userControlledCoinTerm ) {

          var mostOverlappingExpression = self.getExpressionMostOverlappingWithCoinTerm( userControlledCoinTerm );

          // update hover info for each expression with respect to this coin term
          self.expressions.forEach( function( expression ) {
            if ( expression === mostOverlappingExpression ) {
              expression.addHoveringCoinTerm( userControlledCoinTerm );
            }
            else {

              // The remove function is called for any coin term that doesn't overlap.  This will remove the coin term
              // from the expression's 'hovering coin terms' list if the coin term was previously hovering, and is a
              // no-op if not.
              expression.removeHoveringCoinTerm( userControlledCoinTerm );
            }
          } );

          if ( !mostOverlappingExpression ) {

            // The coin term is not overlapping any expressions, so next check overlap with other coin terms.
            var mostOverlappingLikeCoinTerm = self.getMostOverlappingLikeCoinTerm( userControlledCoinTerm );

            if ( mostOverlappingLikeCoinTerm ) {

              // these coin terms can be combined, so they should have their halos activated
              coinTermsWithHalos.push( userControlledCoinTerm );
              coinTermsWithHalos.push( mostOverlappingLikeCoinTerm );
            }

            if ( !mostOverlappingLikeCoinTerm ) {

              // This user-controlled coin term is not overlapping any like coin terms, so now check if it is in the
              // 'expression combine zone' of any other single coins.
              var joinableFreeCoinTerm = self.checkForJoinableFreeCoinTerm( userControlledCoinTerm );
              if ( joinableFreeCoinTerm ) {

                // there is such a coin term, add the pair to the list
                neededExpressionHints.push( new ExpressionHint( joinableFreeCoinTerm, userControlledCoinTerm ) );
              }
            }
          }

        } );

        // update the expression hints for single coins that could combine into expressions
        if ( neededExpressionHints.length > 0 ) {

          // remove any expression hints that are no longer needed
          this.expressionHints.forEach( function( existingExpressionHint ) {
            var matchFound = false;
            neededExpressionHints.forEach( function( neededExpressionHint ) {
              if ( neededExpressionHint.equals( existingExpressionHint ) ) {
                matchFound = true;
              }
            } );
            if ( !matchFound ) {
              self.removeExpressionHint( existingExpressionHint );
            }
          } );

          // add any needed expression hints that are not yet on the list
          neededExpressionHints.forEach( function( neededExpressionHint ) {
            var matchFound = false;
            self.expressionHints.forEach( function( existingExpressionHint ) {
              if ( existingExpressionHint.equals( neededExpressionHint ) ) {
                matchFound = true;
              }
            } );
            if ( !matchFound ) {
              self.expressionHints.add( neededExpressionHint );
            }
          } );
        }
        else {
          self.expressionHints.forEach( function( existingExpressionHint ) {
            self.removeExpressionHint( existingExpressionHint );
          } );
        }

        // step the expressions
        this.expressions.forEach( function( expression ) {
          expression.step( dt );
        } );
      }
      else {
        // The stepping behavior is significantly different - basically much simpler - when an expression is being
        // edited.  The individual expressions are not stepped at all to avoid activating halos, updating layouts, and
        // so forth.  Interaction between coin terms and expressions is not tested.  Only overlap between two like
        // coins is tested so that their halos can be activated.

        // get a list of all user controlled coins, max of one coin on mouse-based systems, any number on touch devices
        userControlledCoinTerms = _.filter( this.coinTerms.getArray(), function( coinTerm ) {
          return coinTerm.userControlledProperty.get();
        } );

        // check for overlap between coins that can combine
        userControlledCoinTerms.forEach( function( userControlledCoinTerm ) {

          var overlappingCoinTerm = self.getOverlappingLikeCoinTermWithinExpression(
            userControlledCoinTerm,
            self.expressionBeingEditedProperty.get()
          );

          if ( overlappingCoinTerm ) {

            // these coin terms can be combined, so they should have their halos activated
            coinTermsWithHalos.push( userControlledCoinTerm );
            coinTermsWithHalos.push( overlappingCoinTerm );
          }
        } );
      }

      // go through all coin terms and update the state of their combine halos
      this.coinTerms.forEach( function( coinTerm ) {
        coinTerm.combineHaloActiveProperty.set( coinTermsWithHalos.indexOf( coinTerm ) !== -1 );
      } );
    },

    // @public
    addCoinTerm: function( coinTerm ) {
      this.coinTerms.add( coinTerm );
      this.updateCoinTermCounts( coinTerm.typeID );
      expressionExchange.log && expressionExchange.log(
        'added ' + coinTerm.id + ', composition = [' + coinTerm.composition + ']'
      );
    },

    // @public
    removeCoinTerm: function( coinTerm, animate ) {

      // TODO:   It is kind of weird that the animation flag prevents removal from expressions.  Maybe this should be
      // TODO:   broken into two methods, or maybe the expression removal should be checked every time.
      if ( animate ) {
        coinTerm.returnToOrigin();
      }
      else {
        expressionExchange.log && expressionExchange.log( 'removed ' + coinTerm.id );
        this.coinTerms.remove( coinTerm );
        this.expressions.forEach( function( expression ) {
          if ( expression.containsCoinTerm( coinTerm ) ) {
            expression.removeCoinTerm( coinTerm );
          }
        } );
        this.updateCoinTermCounts( coinTerm.typeID );
      }
    },

    /**
     * TODO: finish documenting if retained
     * @param coinTermTypeID
     * @param minimumDecomposition
     * @param createIfUndefined
     */
    getCoinTermCountProperty: function( coinTermTypeID, minimumDecomposition, createIfUndefined ) {
      assert && assert( this.coinTermCounts.hasOwnProperty( coinTermTypeID ), 'unrecognized coin term type ID' );
      assert && assert( minimumDecomposition !== 0, 'minimumDecomposition cannot be 0' );

      // Calculate the corresponding index into the data structure - this is necessary in order to support negative
      // minimum decomposition values, e.g. -3X.
      var countPropertyIndex = minimumDecomposition + EESharedConstants.MAX_NON_DECOMPOSABLE_AMOUNT;

      // get the property or, if specified, create it
      var coinTermCountProperty = this.coinTermCounts[ coinTermTypeID ][ countPropertyIndex ].countProperty;
      if ( coinTermCountProperty === null && createIfUndefined ) {

        // the requested count property does not yet exist - create and add it
        coinTermCountProperty = new Property( 0 );
        coinTermCountProperty.set( this.coinTermCounts[ coinTermTypeID ][ countPropertyIndex ].count );
        this.coinTermCounts[ coinTermTypeID ][ countPropertyIndex ].countProperty = coinTermCountProperty;
      }

      return coinTermCountProperty;
    },

    /**
     * stop editing the expression that is currently selected for edit, does nothing if no expression selected
     */
    stopEditingExpression: function() {

      var expressionBeingEdited = this.expressionBeingEditedProperty.get();
      expressionBeingEdited.exitEditMode();

      // Handle the special cases where one or zero coin terms remain after combining terms, which is no longer
      // considered an expression.
      if ( expressionBeingEdited.coinTerms.length <= 1 ) {
        expressionBeingEdited.breakApart();
      }

      this.expressionBeingEditedProperty.set( null );
    },

    // @private - update the count properties for the specified coin term type
    updateCoinTermCounts: function( coinTermTypeID ) {

      var self = this;

      // zero the non-property version of the counts
      this.coinTermCounts[ coinTermTypeID ].forEach( function( countObject ) {
        countObject.count = 0;
      } );

      // loop through the current set of coin terms and update counts for the specified coin term type
      this.coinTerms.forEach( function( coinTerm ) {
        if ( coinTerm.typeID === coinTermTypeID ) {
          coinTerm.composition.forEach( function( minDecomposition ) {
            self.coinTermCounts[ coinTermTypeID ][ minDecomposition + EESharedConstants.MAX_NON_DECOMPOSABLE_AMOUNT ].count++;
          } );
        }
      } );

      // update any count properties that exist
      this.coinTermCounts[ coinTermTypeID ].forEach( function( countObject ) {
        if ( countObject.countProperty ) {
          countObject.countProperty.set( countObject.count );
        }
      } );
    },

    // @public - remove the specified expression
    removeExpression: function( expression ) {
      var self = this;
      var coinTermsToRemove = expression.removeAllCoinTerms();
      coinTermsToRemove.forEach( function( coinTerm ) {
        self.removeCoinTerm( coinTerm, true );
      } );
      this.expressions.remove( expression );
      expressionExchange.log && expressionExchange.log( 'removed ' + expression.id );
    },

    // @private, add an expression hint, done in a method for symmetry with the remove funtion
    addExpressionHint: function( expressionHint ) {
      this.expressionHints.remove( expressionHint );
    },

    // @private, remove an expression hint
    removeExpressionHint: function( expressionHint ) {
      expressionHint.clear();
      this.expressionHints.remove( expressionHint );
    },

    /**
     * @param {Expression} expression
     * @returns {boolean}
     * @public
     */
    isExpressionOverCollectionArea: function( expression ) {
      var expressionOverCollectionArea = false;
      this.collectionAreas.forEach( function( collectionArea ) {
        if ( collectionArea.bounds.intersectsBounds( expression.getBounds() ) ) {
          expressionOverCollectionArea = true;
        }
      } );
      return expressionOverCollectionArea;
    },

    /**
     * get the expression that overlaps the most with the provided coin term, null if no overlap exists, user controlled
     * expressions are excluded
     * @param {CoinTerm} coinTerm
     * @private
     */
    getExpressionMostOverlappingWithCoinTerm: function( coinTerm ) {
      var maxOverlap = 0;
      var mostOverlappingExpression = null;
      this.expressions.forEach( function( expression ) {
        if ( !expression.userControlledProperty.get() && // exclude expressions that are being moved by a user
             !expression.inProgressAnimationProperty.get() && // exclude expressions that are animating to a destination
             !expression.collectedProperty.get() && // exclude expression that are in a collection area
             expression.getCoinTermJoinZoneOverlap( coinTerm ) > maxOverlap ) {
          mostOverlappingExpression = expression;
        }
      } );
      return mostOverlappingExpression;
    },

    /**
     * get the free coin term (i.e. one that is not in an expression) that overlaps the most with the provided
     * expression, null if no overlapping coin terms exist
     * @param {Expression} expression
     * @return {CoinTerm}
     * @private
     */
    getFreeCoinTermMostOverlappingWithExpression: function( expression ) {
      var self = this;
      var maxOverlap = 0;
      var mostOverlappingFreeCoinTerm = null;
      this.coinTerms.forEach( function( coinTerm ) {

        // make sure the coin term is eligible and then compare the amount of overlap to what was previously seen
        if ( !coinTerm.userControlledProperty.get() && !self.isCoinTermInExpression( coinTerm ) && !coinTerm.collectedProperty.get() &&
             coinTerm.existenceStrengthProperty.get() === 1 &&
             expression.getCoinTermJoinZoneOverlap( coinTerm ) > maxOverlap ) {
          maxOverlap = expression.getCoinTermJoinZoneOverlap( coinTerm );
          mostOverlappingFreeCoinTerm = coinTerm;
        }
      } );
      return mostOverlappingFreeCoinTerm;
    },

    /**
     * get the expression that overlaps the most with the provided expression, null if no overlap exists, user
     * controlled expressions are excluded
     * @param {Expression} expression
     * @private
     */
    getExpressionMostOverlappingWithExpression: function( expression ) {
      var self = this;
      var maxOverlap = 0;
      var mostOverlappingExpression = null;
      this.expressions.forEach( function( testExpression ) {

        // make sure the expression is eligible for consideration, then determine if it is the most overlapping
        if ( testExpression !== expression && !testExpression.userControlledProperty.get() && // exclude expressions that are being moved by a user
             !testExpression.inProgressAnimationProperty.get() && // exclude expressions that are moving somewhere
             !testExpression.collectedProperty.get() && // exclude expressions that are in a collection area
             !self.isExpressionOverCollectionArea( expression ) &&
             expression.getOverlap( testExpression ) > maxOverlap ) {
          mostOverlappingExpression = testExpression;
        }
      } );
      return mostOverlappingExpression;
    },

    /**
     * Get the next location where a retrieved coin term (i.e. one that ended up out of bounds) can be placed.
     * @returns {Vector2}
     * @private
     */
    getNextOpenRetrievalSpot: function() {
      var location = new Vector2();
      var row = 0;
      var column = 0;
      var openLocationFound = false;
      while ( !openLocationFound ) {
        location.x = RETRIEVED_COIN_TERM_FIRST_POSITION.x + column * RETRIEVED_COIN_TERMS_X_SPACING;
        location.y = RETRIEVED_COIN_TERM_FIRST_POSITION.y + row * RETRIEVED_COIN_TERMS_Y_SPACING;
        var closeCoinTerm = false;
        for ( var i = 0; i < this.coinTerms.length; i++ ) {
          if ( this.coinTerms.get( i ).destinationProperty.get().distance( location ) < MIN_RETRIEVAL_PLACEMENT_DISTANCE ) {
            closeCoinTerm = true;
            break;
          }
        }
        if ( closeCoinTerm ) {
          // move to next location
          column++;
          if ( column >= NUM_RETRIEVED_COIN_TERM_COLUMNS ) {
            row++;
            column = 0;
          }
        }
        else {
          openLocationFound = true;
        }
      }
      return location;
    },

    /**
     * get a reference to the collection area that most overlaps with the provided expression, null if no overlap exists
     * @param {Expression} expression
     * @private
     */
    getMostOverlappingCollectionAreaForExpression: function( expression ) {
      var maxOverlap = 0;
      var mostOverlappingCollectionArea = null;
      this.collectionAreas.forEach( function( collectionArea ) {
        if ( expression.getOverlap( collectionArea ) > maxOverlap ) {
          mostOverlappingCollectionArea = collectionArea;
          maxOverlap = expression.getOverlap( collectionArea );
        }
      } );
      return mostOverlappingCollectionArea;
    },

    // @public
    reset: function() {

      // reset any collection areas that have been created
      this.collectionAreas.forEach( function( collectionArea ) {
        collectionArea.reset();
      } );

      // TODO: Probably need to reset expressions here so that they can cancel any in-progress animations.
      this.expressions.clear();
      this.coinTerms.clear();
      this.viewModeProperty.reset();
      this.showCoinValuesProperty.reset();
      this.showVariableValuesProperty.reset();
      this.showAllCoefficientsProperty.reset();
      this.xTermValueProperty.reset();
      this.yTermValueProperty.reset();
      this.zTermValueProperty.reset();
      this.totalValueProperty.reset();
      this.expressionBeingEditedProperty.reset();
      this.simplifyNegativesProperty.reset();
      _.values( this.coinTermCounts ).forEach( function( coinTermCountArray ) {
        coinTermCountArray.forEach( function( coinTermCountObject ) {
          coinTermCountObject.count = 0;
          coinTermCountObject.countProperty && coinTermCountObject.countProperty.reset();
        } );
      } );
    },

    // @private - test if coinTermB is in the "expression combine zone" of coinTermA
    isCoinTermInExpressionCombineZone: function( coinTermA, coinTermB ) {

      // TODO: This could end up being a fair amount of allocations and may need some pre-allocated bounds for good performance
      // Make the combine zone wider, but vertically shorter, than the actual bounds, as this gives the most desirable
      // behavior.  The multiplier for the height was empirically determined.
      var extendedTargetCoinTermBounds = coinTermA.getViewBounds().dilatedXY(
        coinTermA.relativeViewBoundsProperty.get().width,
        -coinTermA.relativeViewBoundsProperty.get().height * 0.25
      );

      return extendedTargetCoinTermBounds.intersectsBounds( coinTermB.getViewBounds() );
    },

    /**
     * returns true if coin term is currently part of an expression
     * @param {CoinTerm} coinTerm
     * @public
     */
    isCoinTermInExpression: function( coinTerm ) {
      for ( var i = 0; i < this.expressions.length; i++ ) {
        if ( this.expressions.get( i ).containsCoinTerm( coinTerm ) ) {
          return true;
        }
      }
      return false;
    },

    /**
     * Check for coin terms that are not already in expressions that are positioned such that they could combine with
     * the provided coin into a new expression.  If more than one possibility exists, the closest is returned.  If none
     * are found, null is returned.
     * @param testCoinTerm
     * @private
     */
    checkForJoinableFreeCoinTerm: function( testCoinTerm ) {
      var joinableFreeCoinTerm = null;
      var self = this;
      this.coinTerms.forEach( function( ct ) {
        if ( ct !== testCoinTerm && !self.isCoinTermInExpression( ct ) && !ct.collectedProperty.get() && !ct.inProgressAnimationProperty.get() ) {
          // test if the provided coin term is in one of the compare coin term's "expression combine zones"
          if ( self.isCoinTermInExpressionCombineZone( ct, testCoinTerm ) ) {
            if ( !joinableFreeCoinTerm || ( joinableFreeCoinTerm.positionProperty.get().distance( ct ) < joinableFreeCoinTerm.positionProperty.get().distance( testCoinTerm ) ) ) {
              joinableFreeCoinTerm = ct;
            }
          }
        }
      } );
      return joinableFreeCoinTerm;
    },

    // @private, get the amount of overlap given two coin terms by comparing position and coin radius
    getCoinOverlapAmount: function( coinTerm1, coinTerm2 ) {
      var distanceBetweenCenters = coinTerm1.positionProperty.get().distance( coinTerm2.positionProperty.get() );
      return Math.max( ( coinTerm1.coinRadius + coinTerm2.coinRadius ) - distanceBetweenCenters, 0 );
    },

    // @private, get the amount of overlap between the view bounds for two coin terms
    getViewBoundsOverlapAmount: function( coinTerm1, coinTerm2 ) {
      var overlap = 0;

      if ( coinTerm1.getViewBounds().intersectsBounds( coinTerm2.getViewBounds() ) ) {
        var intersection = coinTerm1.getViewBounds().intersection( coinTerm2.getViewBounds() );
        overlap = intersection.width * intersection.height;
      }
      return overlap;
    },

    /**
     * get the coin term that overlaps the most with the provided coin term, is of the same type, is not user
     * controlled, and is not already in an expression
     * @param {CoinTerm} coinTerm
     * @returns {CoinTerm}
     * @private
     */
    getMostOverlappingLikeCoinTerm: function( coinTerm ) {
      assert && assert( this.coinTerms.contains( coinTerm ), 'overlap requested for something that is not in model' );
      var self = this;
      var mostOverlappingLikeCoinTerm = null;
      var maxOverlapAmount = 0;
      this.coinTerms.forEach( function( testCoinTerm ) {

        // test that the coin term is eligible for consideration before testing it
        if ( coinTerm !== testCoinTerm &&
             coinTerm.canCombineWith( testCoinTerm ) && !testCoinTerm.userControlledProperty.get() &&
             testCoinTerm.existenceStrengthProperty.get() === 1 && !testCoinTerm.collectedProperty.get() && !self.isCoinTermInExpression( testCoinTerm ) ) {

          // calculate and compare the relative overlap amounts, done a bit differently in the different view modes
          var overlapAmount;
          if ( self.viewModeProperty.get() === ViewMode.COINS ) {
            overlapAmount = self.getCoinOverlapAmount( coinTerm, testCoinTerm );
          }
          else {
            overlapAmount = self.getViewBoundsOverlapAmount( coinTerm, testCoinTerm );
          }

          if ( overlapAmount > maxOverlapAmount ) {
            maxOverlapAmount = overlapAmount;
            mostOverlappingLikeCoinTerm = testCoinTerm;
          }
        }
      } );
      return mostOverlappingLikeCoinTerm;
    },

    getOverlappingLikeCoinTermWithinExpression: function( coinTerm, expression ) {

      var self = this;
      var overlappingCoinTerm = null;

      for ( var i = 0; i < expression.coinTerms.length; i++ ) {
        var potentiallyOverlappingCoinTerm = expression.coinTerms.get( i );
        if ( potentiallyOverlappingCoinTerm !== coinTerm && !potentiallyOverlappingCoinTerm.userControlledProperty.get() &&
             potentiallyOverlappingCoinTerm.existenceStrengthProperty.get() === 1 &&
             potentiallyOverlappingCoinTerm.canCombineWith( coinTerm ) ) {
          var overlapAmount = 0;
          if ( self.viewModeProperty.get() === ViewMode.COINS ) {
            overlapAmount = self.getCoinOverlapAmount( coinTerm, potentiallyOverlappingCoinTerm );
          }
          else {
            overlapAmount = self.getViewBoundsOverlapAmount( coinTerm, potentiallyOverlappingCoinTerm );
          }
          if ( overlapAmount > 0 ) {
            overlappingCoinTerm = potentiallyOverlappingCoinTerm;
            // since this is an expression, there should be a max of one overlapping coin term, so we can bail here
            break;
          }
        }
      }
      return overlappingCoinTerm;
    },

    /**
     * @param {Bounds2} bounds
     */
    setCoinTermRetrievalBounds: function( bounds ) {
      assert && assert( this.coinTermRetrievalBounds === Bounds2.EVERYTHING, 'coin term bounds should only be set once' );
      this.coinTermRetrievalBounds = bounds;
    }

  } );
} );