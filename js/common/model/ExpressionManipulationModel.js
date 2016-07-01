// Copyright 2016, University of Colorado Boulder

/**
 * A model that allows users to move coin terms around, combine them into expressions, edit the expressions, change the
 * values of the underlying variables, and track different view modes.  This is the main model type used in all of the
 * non-game screens, and options are used to support the different restrictions for each screen.  It is intended to be
 * used as a base class.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AllowedRepresentationsEnum = require( 'EXPRESSION_EXCHANGE/common/model/AllowedRepresentationsEnum' );
  var CoinTermCreatorSet = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermCreatorSet' );
  var CoinTermFactory = require( 'EXPRESSION_EXCHANGE/common/model/CoinTermFactory' );
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var Expression = require( 'EXPRESSION_EXCHANGE/common/model/Expression' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionHint = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionHint' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );

  // constants
  var BREAK_APART_SPACING = 10;

  // convenience function used to convert a constant name to a camel-cased variable name
  function constantToCamelCase( str ) {

    var lowerCaseString = str.toLowerCase();

    // anything after an underscore should be a capital letter
    var previousChar = null;
    var stringWithCaps = '';
    for ( var i = 0; i < lowerCaseString.length; i++ ) {
      stringWithCaps += previousChar === '_' ? lowerCaseString[ i ].toUpperCase() : lowerCaseString[ i ];
      previousChar = lowerCaseString[ i ];
    }

    // remove the underscores
    return stringWithCaps.replace( /_/g, '' );
  }

  /**
   * @constructor
   */
  function ExpressionManipulationModel( options ) {

    options = _.extend( {

      // TODO: As I write this on 4/15/2016, it occurs to me that maybe the view, rather than the model, is where these
      // TODO: options need to be, and there would be a single model type and variations of the view type.  Revisit this
      // TODO: once the screen behaviors are fully established and refactor if it makes sense to do so.

      // defines the set of coin terms presented to the user in the carousel
      coinTermCollection: CoinTermCreatorSet.BASIC,

      // defines whether to present just coins, just variables, or both to the user
      allowedRepresentations: AllowedRepresentationsEnum.COINS_AND_VARIABLES

    }, options );

    var initialViewMode = options.allowedRepresentations === AllowedRepresentationsEnum.VARIABLES_ONLY ?
                          ViewMode.VARIABLES : ViewMode.COINS;

    PropertySet.call( this, {
      viewMode: initialViewMode, // @public
      showCoinValues: false, // @public
      showVariableValues: false, // @public
      showAllCoefficients: false, // @public
      xTermValue: 2, // @public
      yTermValue: 5, // @public
      zTermValue: 10, // @public
      totalValue: 0, // @public, read-only
      expressionBeingEdited: null, // @public, read-only, null when no expression is in edit mode
      simplifyNegatives: false // @public TODO: The terminology for this field is in flux, make sure its name and the view checkbox name match before publication
    } );

    var self = this;
    var key;

    // @public, read only, factory used to create coin terms
    this.coinTermFactory = new CoinTermFactory( this.xTermValueProperty, this.yTermValueProperty, this.zTermValueProperty );

    // @public, read and listen only, tracks the total positive instances and combined instances for each coin term type
    this.positiveCoinTermCountsByType = new PropertySet( {} );
    for ( key in CoinTermTypeID ) {
      if ( !CoinTermTypeID.hasOwnProperty( key ) ) {
        continue;
      }
      this.positiveCoinTermCountsByType.addProperty( constantToCamelCase( key ), 0 );
    }

    // @public, read and listen only, tracks the total negative instances and combined instances for each coin term type
    this.negativeCoinTermCountsByType = new PropertySet( {} );
    for ( key in CoinTermTypeID ) {
      if ( !CoinTermTypeID.hasOwnProperty( key ) ) {
        continue;
      }
      this.negativeCoinTermCountsByType.addProperty( constantToCamelCase( key ), 0 );
    }

    // @public, read only, options that control what is available to the user to manipulate
    this.coinTermCollection = options.coinTermCollection;
    this.allowedRepresentations = options.allowedRepresentations;

    // @public, read and listen only, list of all coin terms in the model
    this.coinTerms = new ObservableArray();

    // @public, read and listen only, list of expressions in the model
    this.expressions = new ObservableArray();

    // @public, read and listen only, list of expression hints in the model
    this.expressionHints = new ObservableArray();

    // function to update the total value of the coin terms
    function updateTotal() {
      var total = 0;
      self.coinTerms.forEach( function( coinTerm ) {
        total += coinTerm.valueProperty.value * coinTerm.combinedCount;
      } );
      self.totalValue = total;
    }

    // add a listener that resets the coin term values when the view mode switches from variables to coins
    this.viewModeProperty.link( function( newViewMode, oldViewMode ) {
      if ( newViewMode === ViewMode.COINS && oldViewMode === ViewMode.VARIABLES ) {
        self.xTermValueProperty.reset();
        self.yTermValueProperty.reset();
        self.zTermValueProperty.reset();
      }
    } );

    // when a coin term is added, add listeners to handle the things about it that are dynmaic and can affect the model
    this.coinTerms.addItemAddedListener( function( addedCoinTerm ) {
      // TODO: Once this is pretty much fully functional, revisit this and verify that it doesn't leak memory, making
      // TODO: sure that all added listeners are removed.  Also, work through this and see if it can be made more
      // TODO: compact and readable (it's evolving a lot as it's being written)

      // Add a listener that will potentially combine this coin term with expressions or other coin terms based on
      // where it is released.
      function coinTermUserControlledListener( userControlled ) {

        if ( userControlled === false ) {

          if ( !self.expressionBeingEdited ) {

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

                // combine the coin terms into a single coin term with a higher "combine count"
                addedCoinTerm.travelToDestination( mostOverlappingLikeCoinTerm.position );
                addedCoinTerm.destinationReachedEmitter.addListener( function destinationReachedListener() {
                  mostOverlappingLikeCoinTerm.combinedCount += addedCoinTerm.combinedCount;
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
              self.expressionBeingEdited.coinTerms.contains( addedCoinTerm ),
              'coin term being released is not in expression being edited, this should not occur'
            );

            // determine if the coin term was dropped while overlapping a coin term of the same type
            var overlappingLikeCoinTerm = self.getOverlappingLikeCoinTermWithinExpression(
              addedCoinTerm,
              self.expressionBeingEdited
            );

            if ( overlappingLikeCoinTerm ) {

              // combine the dropped coin term with the one with which it overlaps
              overlappingLikeCoinTerm.combinedCount = overlappingLikeCoinTerm.combinedCount + addedCoinTerm.combinedCount;
              self.removeCoinTerm( addedCoinTerm );
            }
            else {

              // the coin term has been dropped at some potentially new location withing the expression
              self.expressionBeingEdited.reintegrateCoinTerm( addedCoinTerm );
            }
          }
        }
      }

      addedCoinTerm.userControlledProperty.lazyLink( coinTermUserControlledListener );

      // add a listener that will handle requests to break apart the coin term
      function coinTermBreakApartListener() {

        if ( Math.abs( addedCoinTerm.combinedCount ) < 2 ) {
          // bail if the coin is a single
          return;
        }
        var numToCreate = Math.abs( addedCoinTerm.combinedCount ) - 1;

        // set this coin back to being a single, keeping the sign the same
        addedCoinTerm.combinedCount = addedCoinTerm.combinedCount > 0 ? 1 : -1;

        // If the total combined coin count was even, shift the 'parent coin' a bit so that the coins end up being
        // distributed around the centerX position.
        if ( numToCreate % 2 === 1 ) {
          addedCoinTerm.travelToDestination(
            new Vector2(
              addedCoinTerm.position.x - addedCoinTerm.relativeViewBounds.width / 2 - BREAK_APART_SPACING / 2,
              addedCoinTerm.position.y
            )
          );
        }

        // add new coin terms to represent those that were broken out from the initial one
        var interCoinTermDistance = addedCoinTerm.relativeViewBounds.width + BREAK_APART_SPACING;
        var nextLeftX = addedCoinTerm.destination.x - interCoinTermDistance;
        var nextRightX = addedCoinTerm.destination.x + interCoinTermDistance;
        _.times( numToCreate, function( index ) {
          var clonedCoinTerm = addedCoinTerm.cloneMostly();
          self.addCoinTerm( clonedCoinTerm );
          if ( index % 2 === 0 ) {
            clonedCoinTerm.travelToDestination( new Vector2( nextRightX, addedCoinTerm.position.y ) );
            nextRightX += interCoinTermDistance;
          }
          else {
            clonedCoinTerm.travelToDestination( new Vector2( nextLeftX, addedCoinTerm.position.y ) );
            nextLeftX -= interCoinTermDistance;
          }
        } );
      }

      addedCoinTerm.breakApartEmitter.addListener( coinTermBreakApartListener );

      // add a listener that will update the total value of the coin terms when this one's value changes
      addedCoinTerm.valueProperty.link( function() {
        updateTotal();
      } );

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

          if ( self.expressionBeingEdited ){
            if ( self.expressionBeingEdited.coinTerms.length === 0 ){

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
          addedCoinTerm.valueProperty.unlink( updateTotal );
          self.coinTerms.removeItemRemovedListener( coinTermRemovalListener );

          // update the total now that this coin term has been removed
          updateTotal();
        }
      } );
    } );

    this.expressions.addItemAddedListener( function( addedExpression ) {
      // TODO: Revisit this and verify that this doesn't leak memory

      // add a listener for when the expression is released, which may cause it to be combined with another expression
      function expressionUserControlledListener( userControlled ) {

        if ( !userControlled ) {

          // check for overlap with other expressions, if there is one or more, combine with the one with the most overlap
          var mostOverlappingExpression = self.getExpressionMostOverlappingWithExpression( addedExpression );
          if ( mostOverlappingExpression ) {

            // remove the expression from the list of those hovering
            mostOverlappingExpression.removeHoveringExpression( addedExpression );

            // send the combining expression to the right side of receiving expression
            addedExpression.travelToDestination( mostOverlappingExpression.upperLeftCorner.plusXY( mostOverlappingExpression.width, 0 ) );

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
              if ( addedExpression.rightHintActive ) {

                // move to the left side of the coin term
                addedExpression.travelToDestination(
                  coinTermToAddToExpression.position.plusXY(
                    -addedExpression.width - addedExpression.rightHintWidth / 2,
                    -addedExpression.height / 2
                  )
                );
              }
              else {

                assert && assert(
                  addedExpression.leftHintActive,
                  'at least one hint should be active if there is a hovering coin term'
                );

                // move to the right side of the coin term
                addedExpression.travelToDestination(
                  coinTermToAddToExpression.position.plusXY(
                    addedExpression.leftHintWidth / 2,
                    -addedExpression.height / 2
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

      addedExpression.userControlledProperty.lazyLink( expressionUserControlledListener );

      // add a listener that will handle requests to break apart this expression
      function expressionBreakApartListener() {

        // keep a reference to the center for when we spread out the coin terms
        var expressionCenterX = addedExpression.getBounds().centerX;

        // remove the coin terms from the expression and the expression from the model
        var newlyFreedCoinTerms = addedExpression.removeAllCoinTerms();
        self.expressions.remove( addedExpression );

        // spread the released coin terms out horizontally
        newlyFreedCoinTerms.forEach( function( newlyFreedCoinTerm ) {
          var horizontalDistanceFromExpressionCenter = newlyFreedCoinTerm.position.x - expressionCenterX;
          newlyFreedCoinTerm.travelToDestination( new Vector2(
            newlyFreedCoinTerm.position.x + horizontalDistanceFromExpressionCenter * 0.15, // spread factor empirically determined
            newlyFreedCoinTerm.position.y
          ) );
        } );
      }

      addedExpression.breakApartEmitter.addListener( expressionBreakApartListener );

      // add a listener that will handle requests to edit this expression
      function editExpressionListener() {
        self.expressionBeingEdited = addedExpression;
      }

      addedExpression.selectedForEditEmitter.addListener( editExpressionListener );

      // remove the listeners when this expression is removed
      self.expressions.addItemRemovedListener( function( removedExpression ) {
        if ( removedExpression === addedExpression ) {
          addedExpression.userControlledProperty.unlink( expressionUserControlledListener );
          addedExpression.breakApartEmitter.removeListener( expressionBreakApartListener );
          addedExpression.selectedForEditEmitter.removeListener( editExpressionListener );
        }
      } );
    } );
  }

  expressionExchange.register( 'ExpressionManipulationModel', ExpressionManipulationModel );

  return inherit( PropertySet, ExpressionManipulationModel, {

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
      // TODO: with event handlers on the userControlled property for the coin terms and expressions.  At some point,
      // TODO: when the functionality is fairly mature, I (jbphet) should look at consolidating these in order to make
      // TODO: the code more understandable and maintainable.

      if ( !this.expressionBeingEdited ) {

        // get a list of user controlled expressions, max of one on mouse based systems, any number on touch devices
        var userControlledExpressions = _.filter( this.expressions.getArray(), function( expression ) {
          return expression.userControlled;
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

        // get a list of all user controlled coins, max of one coin on mouse-based systems, any number on touch devices
        userControlledCoinTerms = _.filter( this.coinTerms.getArray(), function( coin ) { return coin.userControlled; } );

        // check each user-controlled coin to see if it's in a position to combine with an expression or another coin term
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
        userControlledCoinTerms = _.filter( this.coinTerms.getArray(), function( coin ) { return coin.userControlled; } );

        // check for overlap between coins that can combine
        userControlledCoinTerms.forEach( function( userControlledCoinTerm ) {

          var overlappingCoinTerm = self.getOverlappingLikeCoinTermWithinExpression(
            userControlledCoinTerm,
            self.expressionBeingEdited
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
        coinTerm.combineHaloActive = coinTermsWithHalos.indexOf( coinTerm ) !== -1;
      } );
    },

    // @public
    addCoinTerm: function( coinTerm ) {
      this.coinTerms.add( coinTerm );
      this.updateCoinTermCount( coinTerm.typeID );
      expressionExchange.log && expressionExchange.log( 'added ' + coinTerm.id );
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
        this.updateCoinTermCount( coinTerm.typeID );
      }
    },

    /**
     * stop editing the expression that is currently selected for edit, does nothing if no expression selected
     */
    stopEditingExpression: function() {

      this.expressionBeingEdited.exitEditMode();

      // Handle the special cases where one or zero coin terms remain after combining terms, which is no longer
      // considered an expression.
      if ( this.expressionBeingEdited.coinTerms.length <= 1 ) {
        this.expressionBeingEdited.breakApart();
      }

      this.expressionBeingEdited = null;
    },

    // @private - update the positive and negative counts for the specified coin term type
    updateCoinTermCount: function( coinTermTypeID ) {

      var positiveCountForThisType = 0;
      var negativeCountForThisType = 0;
      var convertedTypeID = constantToCamelCase( coinTermTypeID );

      // update the positive and negative count values
      this.coinTerms.forEach( function( coinTerm ) {
        if ( coinTerm.typeID === coinTermTypeID ) {
          if ( coinTerm.combinedCount > 0 ){
            positiveCountForThisType += coinTerm.combinedCount;
          }
          else{
            negativeCountForThisType += Math.abs( coinTerm.combinedCount );
          }
        }
      } );
      this.positiveCoinTermCountsByType[ convertedTypeID ] = positiveCountForThisType;
      this.negativeCoinTermCountsByType[ convertedTypeID ] = negativeCountForThisType;
    },

    /**
     * get the positive count property for the given coin term type
     * @param {CoinTermTypeID} typeID
     * @public
     */
    getPositiveCountPropertyForType: function( typeID ) {
      var convertedTypeID = constantToCamelCase( typeID );
      assert && assert(
        typeof( this.positiveCoinTermCountsByType[ convertedTypeID ] === 'number' ),
        'no positive count for coin term type ' + convertedTypeID
      );
      return this.positiveCoinTermCountsByType[ convertedTypeID + 'Property' ];
    },

    /**
     * get the negative count property for the given coin term type
     * @param {CoinTermTypeID} typeID
     * @public
     */
    getNegativeCountPropertyForType: function( typeID ) {
      var convertedTypeID = constantToCamelCase( typeID );
      assert && assert(
        typeof( this.negativeCoinTermCountsByType[ convertedTypeID ] === 'number' ),
        'no negative count for coin term type ' + convertedTypeID
      );
      return this.negativeCoinTermCountsByType[ convertedTypeID + 'Property' ];
    },

    // @public - remove the specified expression
    removeExpression: function( expression ) {
      var self = this;
      var coinTermsToRemove = expression.removeAllCoinTerms();
      coinTermsToRemove.forEach( function( coinTerm ) {
        self.removeCoinTerm( coinTerm, true );
      } );
      expressionExchange.log && expressionExchange.log( 'removing ' + expression.id );
      this.expressions.remove( expression );
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
     * get the expression that overlaps the most with the provided coin term, null if no overlap exists, user controlled
     * expressions are excluded
     * @param {CoinTerm} coinTerm
     * @private
     */
    getExpressionMostOverlappingWithCoinTerm: function( coinTerm ) {
      var maxOverlap = 0;
      var mostOverlappingExpression = null;
      this.expressions.forEach( function( expression ) {
        if ( !expression.userControlled && // exclude expressions that are being moved by a user
             !expression.inProgressAnimation && // exclude expressions that are animating to a destination
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
        if ( !coinTerm.userControlled &&
             !self.isCoinTermInExpression( coinTerm ) &&
             coinTerm.existenceStrength === 1 &&
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
      var maxOverlap = 0;
      var mostOverlappingExpression = null;
      this.expressions.forEach( function( testExpression ) {
        if ( testExpression !== expression && !testExpression.userControlled && // exclude expressions that are being moved by a user
             !testExpression.inProgressAnimation && // exclude expressions that are moving somewhere
             expression.getExpressionOverlap( testExpression ) > maxOverlap ) {
          mostOverlappingExpression = testExpression;
        }
      } );
      return mostOverlappingExpression;
    },

    // @public
    reset: function() {
      // TODO: Probably need to reset expressions here so that they can cancel any in-progress animations.
      this.expressions.clear();
      this.coinTerms.clear();
      this.positiveCoinTermCountsByType.reset();
      this.negativeCoinTermCountsByType.reset();
      PropertySet.prototype.reset.call( this );
    },

    // @private - test if coinTermB is in the "expression combine zone" of coinTermA
    isCoinTermInExpressionCombineZone: function( coinTermA, coinTermB ) {

      // The determination is made based on adjusted bounds, and the adjustments are a little different based on the
      // view mode.  The adjustment values were empirically determined.
      var boundsHeightAdjustmentFactor;
      if ( this.viewMode === ViewMode.COINS ) {
        boundsHeightAdjustmentFactor = 0.25;
      }
      else {
        boundsHeightAdjustmentFactor = 0.5;
      }

      // TODO: This could end up being a fair amount of allocations and may need some pre-allocated bounds for good performance
      // Make the combine zone wider, but vertically shorter, than the actual bounds, as this gives the most desirable behavior
      var extendedTargetCoinTermBounds = coinTermA.getViewBounds().dilatedXY(
        coinTermA.relativeViewBounds.width,
        -coinTermA.relativeViewBounds.height * boundsHeightAdjustmentFactor
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
        if ( ct !== testCoinTerm && !self.isCoinTermInExpression( ct ) && !ct.inProgressAnimation ) {
          // test if the provided coin term is in one of the compare coin term's "expression combine zones"
          if ( self.isCoinTermInExpressionCombineZone( testCoinTerm, ct ) ) {
            if ( !joinableFreeCoinTerm || ( joinableFreeCoinTerm.position.distance( ct ) < joinableFreeCoinTerm.position.distance( testCoinTerm ) ) ) {
              joinableFreeCoinTerm = ct;
            }
          }
        }
      } );
      return joinableFreeCoinTerm;
    },

    /**
     * get the positive total count value for the specified coin term type
     * @param {CoinTermTypeID} typeID
     * @public
     */
    getPositiveCoinTermCount: function( typeID ) {
      var count = 0;
      this.coinTerms.forEach( function( coinTerm ) {
        if ( typeID === coinTerm.typeID && coinTerm.combinedCount > 0 ) {
          count += coinTerm.combinedCount;
        }
      } );
      return count;
    },

    /**
     * get the negative total count value for the specified coin term type
     * @param {CoinTermTypeID} typeID
     * @public
     */
    getNegativeCoinTermCount: function( typeID ) {
      var count = 0;
      this.coinTerms.forEach( function( coinTerm ) {
        if ( typeID === coinTerm.typeID && coinTerm.combinedCount < 0 ) {
          count += Math.abs( coinTerm.combinedCount );
        }
      } );
      return count;
    },

    // @private, get the amount of overlap given two coin terms by comparing position and coin radius
    getCoinOverlapAmount: function( coinTerm1, coinTerm2 ) {
      var distanceBetweenCenters = coinTerm1.position.distance( coinTerm2.position );
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
        if ( coinTerm !== testCoinTerm &&
             coinTerm.canCombineWith( testCoinTerm ) &&
             !testCoinTerm.userControlled &&
             testCoinTerm.existenceStrength === 1 &&
             !self.isCoinTermInExpression( testCoinTerm ) ) {

          // calculate and compare the relative overlap amounts, done a bit differently in the different view modes
          var overlapAmount;
          if ( self.viewMode === ViewMode.COINS ) {
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
        if ( potentiallyOverlappingCoinTerm !== coinTerm &&
             !potentiallyOverlappingCoinTerm.userControlled &&
             potentiallyOverlappingCoinTerm.existenceStrength === 1 &&
             potentiallyOverlappingCoinTerm.canCombineWith( coinTerm ) ) {
          var overlapAmount = 0;
          if ( self.viewMode === ViewMode.COINS ) {
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
    }

  } );
} );