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
  var AllowedRepresentations = require( 'EXPRESSION_EXCHANGE/common/enum/AllowedRepresentations' );
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
   * @param {Object} [options]
   */
  function ExpressionManipulationModel( options ) {

    options = _.extend( {

      // defines whether to present just coins, just variables, or both to the user
      allowedRepresentations: AllowedRepresentations.COINS_AND_VARIABLES,

      // flag that controls how cancellation is handled in cases where coin terms don't completely cancel each other out
      partialCancellationEnabled: true,

      // flag that controls whether the 'simplify negatives' setting is on or off by default
      simplifyNegativesDefault: false

    }, options );

    var initialViewMode = options.allowedRepresentations === AllowedRepresentations.VARIABLES_ONLY ?
                          ViewMode.VARIABLES : ViewMode.COINS;

    // @public {Property.<ViewMode>}
    this.viewModeProperty = new Property( initialViewMode );

    // @public {Property.<boolean>}
    this.showCoinValuesProperty = new Property( false );
    this.showVariableValuesProperty = new Property( false );
    this.showAllCoefficientsProperty = new Property( false );

    // @public {Property.<number>}
    this.xTermValueProperty = new Property( 2 );
    this.yTermValueProperty = new Property( 5 );
    this.zTermValueProperty = new Property( 10 );

    // @public {Property.<number>} (read-only)
    this.totalValueProperty = new Property( 0 );

    // @public {Property.<Expression>}, read-only, null when no expression is being edited
    this.expressionBeingEditedProperty = new Property( null );

    // @public {Property.<boolean>}
    this.simplifyNegativesProperty = new Property( options.simplifyNegativesDefault );

    var self = this;

    // @public {CoinTermFactory}, read only, factory used to create coin terms
    this.coinTermFactory = new CoinTermFactory( this.xTermValueProperty, this.yTermValueProperty, this.zTermValueProperty );

    // @public {AllowedRepresentations}, read only, options that control what is available to the user to manipulate
    this.allowedRepresentations = options.allowedRepresentations;

    // @public {ObservableArray.<CoinTerm>}, read and listen only, list of all coin terms in the model
    this.coinTerms = new ObservableArray();

    // @public {ObservableArray.<Expression>}, read and listen only, list of expressions in the model
    this.expressions = new ObservableArray();

    // @public {ObservableArray.<ExpressionHint}, read and listen only, list of expression hints in the model
    this.expressionHints = new ObservableArray();

    // @public {Bounds2} (read-only) - coin terms that end up outside these bounds are moved back inside the bounds
    this.coinTermRetrievalBounds = Bounds2.EVERYTHING;

    // @public {Array.<EECollectionArea>}, read only - areas where expressions or coin terms can be collected, used
    // only in game
    this.collectionAreas = [];

    /*
     * @private, with some elements accessible via methods define below - This is a populated data structure that
     * contains counts for the various possible combinations of coin term types and minimum decomposition.  For
     * instance, it keeps track of the number of 2X values that can't be further decomposed.
     * {CoinTermTypeID} => {Array.<{ count: {number}, countProperty: {Property.<number>|null} }>}
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

    // @public {@Bounds2} (read-write) - should be set by view, generally just once.  Used to determine when to remove a
    // coin term because the user has essentially put it away
    this.creatorBoxBounds = Bounds2.NOTHING;

    // @private {boolean} - make this option available to methods
    this.partialCancellationEnabled = options.partialCancellationEnabled;

    // add a listener that resets the coin term values when the view mode switches from variables to coins
    this.viewModeProperty.link( function( newViewMode, oldViewMode ) {
      if ( newViewMode === ViewMode.COINS && oldViewMode === ViewMode.VARIABLES ) {
        self.xTermValueProperty.reset();
        self.yTermValueProperty.reset();
        self.zTermValueProperty.reset();
      }
    } );

    // add a listener that updates the total whenever one of the term value properties change
    Property.multilink(
      [ this.xTermValueProperty, this.yTermValueProperty, this.zTermValueProperty, this.coinTerms.lengthProperty ],
      function() {
        var total = 0;
        self.coinTerms.forEach( function( coinTerm ) {
          total += coinTerm.valueProperty.value * coinTerm.totalCountProperty.get();
        } );
        self.totalValueProperty.set( total );
      }
    );

    // add a listener that handles the addition of coin terms
    this.coinTerms.addItemAddedListener( this.coinTermAddedListener.bind( this ) );

    // add a listener that handles the addition of an expression
    this.expressions.addItemAddedListener( this.expressionAddedListener.bind( this ) );
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

      // step all the coin terms
      this.coinTerms.forEach( function( coinTerm ) { coinTerm.step( dt ); } );

      // Update the state of the hints and halos.  This has to be done in the step function rather than in the
      // event listeners, where much of the other action occurs, because the code needs to figure out which hints and
      // halos should be activated and deactivated based on the positions of all coin terms and expressions.
      if ( !this.expressionBeingEditedProperty.get() ) {

        // get a list of user controlled expressions, max of one on mouse based systems, any number on touch devices
        var userControlledExpressions = _.filter( this.expressions.getArray(), function( expression ) {
          return expression.userControlledProperty.get();
        } );

        var collectionAreasWhoseHalosShouldBeActive = [];

        // Update hints for expressions and collection areas.
        userControlledExpressions.forEach( function( userControlledExpression ) {

          var expressionIsOverCreatorBox = userControlledExpression.getBounds().intersectsBounds( self.creatorBoxBounds );
          var mostOverlappingCollectionArea = self.getMostOverlappingCollectionAreaForExpression( userControlledExpression );
          var mostOverlappingExpression = self.getExpressionMostOverlappingWithExpression( userControlledExpression );
          var mostOverlappingCoinTerm = self.getFreeCoinTermMostOverlappingWithExpression( userControlledExpression );
          var expressionOverWhichThisExpressionIsHovering = null;
          var coinTermOverWhichThisExpressionIsHovering = null;

          if ( expressionIsOverCreatorBox ) {
            // The expression is at least partially over the creator box, which takes precedence over everything else,
            // so don't activate any hints or halos.
          }
          else if ( mostOverlappingCollectionArea ) {
            collectionAreasWhoseHalosShouldBeActive.push( mostOverlappingCollectionArea );
          }
          else if ( mostOverlappingExpression ) {
            expressionOverWhichThisExpressionIsHovering = mostOverlappingExpression;
          }
          else if ( mostOverlappingCoinTerm ) {
            coinTermOverWhichThisExpressionIsHovering = mostOverlappingCoinTerm;
          }

          // update hover info for each of the other expressions with respect to this one
          self.expressions.forEach( function( expression ) {

            if ( expression === userControlledExpression ) {
              // skip self
              return;
            }

            if ( expression === expressionOverWhichThisExpressionIsHovering ) {
              expression.addHoveringExpression( userControlledExpression );
            }
            else {

              // removes it if there, no-op if not
              expression.removeHoveringExpression( userControlledExpression );
            }
          } );

          // update overlap info with respect to free coin terms
          userControlledExpression.clearHoveringCoinTerms();
          if ( coinTermOverWhichThisExpressionIsHovering ) {

            // there can only be one most overlapping coin term, so out with the old, in with the new
            userControlledExpression.addHoveringCoinTerm( mostOverlappingCoinTerm );
          }
        } );

        // get a list of all user controlled coin terms, max of one coin on mouse-based systems, any number on touch devices
        userControlledCoinTerms = _.filter( this.coinTerms.getArray(), function( coin ) {
          return coin.userControlledProperty.get();
        } );

        // check each user-controlled coin term to see if it's in a position to combine with an expression or another
        // coin term
        var neededExpressionHints = [];
        userControlledCoinTerms.forEach( function( userControlledCoinTerm ) {

          var coinTermIsOverCreatorBox = userControlledCoinTerm.getViewBounds().intersectsBounds( self.creatorBoxBounds );
          var mostOverlappingCollectionArea = self.getMostOverlappingCollectionAreaForCoinTerm( userControlledCoinTerm );
          var mostOverlappingExpression = self.getExpressionMostOverlappingWithCoinTerm( userControlledCoinTerm );
          var mostOverlappingLikeCoinTerm = self.getMostOverlappingLikeCoinTerm( userControlledCoinTerm );
          var joinableFreeCoinTerm = self.checkForJoinableFreeCoinTerm( userControlledCoinTerm );
          var expressionOverWhichCoinTermIsHovering = null;

          if ( coinTermIsOverCreatorBox ) {
            // The coin term is over the creator box, which takes precedence over everything else, so don't activate any
            // hints or halos.
          }
          else if ( mostOverlappingCollectionArea ) {

            // the coin term is over a collection area, so activate that collection area's hint
            collectionAreasWhoseHalosShouldBeActive.push( mostOverlappingCollectionArea );
          }
          else if ( mostOverlappingExpression ) {

            // the coin term is over an expression, so add this coin term to the list of those hovering
            expressionOverWhichCoinTermIsHovering = mostOverlappingExpression;
          }
          else if ( mostOverlappingLikeCoinTerm ) {

            // activate halos for overlapping coin terms
            coinTermsWithHalos.push( userControlledCoinTerm );
            coinTermsWithHalos.push( mostOverlappingLikeCoinTerm );
          }
          else if ( joinableFreeCoinTerm ) {

            // this coin term is positioned such that it could join a free coin term, so add a hint
            neededExpressionHints.push( new ExpressionHint( joinableFreeCoinTerm, userControlledCoinTerm ) );
          }

          // update hover info for each expression with respect to this coin term
          self.expressions.forEach( function( expression ) {
            if ( expression === expressionOverWhichCoinTermIsHovering ) {
              expression.addHoveringCoinTerm( userControlledCoinTerm );
            }
            else {
              expression.removeHoveringCoinTerm( userControlledCoinTerm );
            }
          } );
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

        // update hover info for each collection area
        self.collectionAreas.forEach( function( collectionArea ) {
          collectionArea.haloActiveProperty.set(
            collectionAreasWhoseHalosShouldBeActive.indexOf( collectionArea ) >= 0
          );
        } );

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

      // remove the coin term from any expressions
      this.expressions.forEach( function( expression ) {
        if ( expression.containsCoinTerm( coinTerm ) ) {
          expression.removeCoinTerm( coinTerm );
        }
      } );

      if ( animate ) {
        // send the coin term back to its origin - the final steps of its removal will take place when it gets there
        coinTerm.returnToOrigin();
      }
      else {

        expressionExchange.log && expressionExchange.log( 'removed ' + coinTerm.id );
        this.coinTerms.remove( coinTerm );
        this.updateCoinTermCounts( coinTerm.typeID );
      }
    },

    /**
     * get a property that represents the count in the model of coin terms of the given type and min decomposition
     * @param {CoinTermTypeID} coinTermTypeID
     * @param {number} minimumDecomposition - miniumum amount into which the coin term can be decomposed
     * @param {boolean} createIfUndefined
     * @public
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

      // check each expression against the coin term to see which has max overlap
      this.expressions.forEach( function( expression ) {

        if ( !expression.userControlledProperty.get() && // exclude expressions that are being moved by a user
             !expression.inProgressAnimationProperty.get() && // exclude expressions that are animating to a destination
             !expression.collectedProperty.get() && // exclude expression that are in a collection area
             expression.getCoinTermJoinZoneOverlap( coinTerm ) > maxOverlap ) {

          mostOverlappingExpression = expression;
          maxOverlap = expression.getCoinTermJoinZoneOverlap( coinTerm );
        }
      } );
      return mostOverlappingExpression;
    },

    /**
     * get the free coin term (i.e. one that is not in an expression) that overlaps the most with the provided
     * expression, null if no overlapping coin terms exist
     * @param {Expression} expression
     * @returns {CoinTerm}
     * @private
     */
    getFreeCoinTermMostOverlappingWithExpression: function( expression ) {
      var self = this;
      var maxOverlap = 0;
      var mostOverlappingFreeCoinTerm = null;

      this.coinTerms.forEach( function( coinTerm ) {

        // make sure the coin term is eligible and then compare the amount of overlap to what was previously seen
        if ( !coinTerm.userControlledProperty.get() && !self.isCoinTermInExpression( coinTerm ) && !coinTerm.collectedProperty.get() && !coinTerm.isFadingOut() &&
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
     * @param {Expression} thisExpression
     * @private
     */
    getExpressionMostOverlappingWithExpression: function( thisExpression ) {
      var maxOverlap = 0;
      var mostOverlappingExpression = null;

      // test each other expression for eligibility and overlap
      this.expressions.forEach( function( thatExpression ) {

        // make sure the expression is eligible for consideration, then determine if it is the most overlapping
        if ( thatExpression !== thisExpression && !thatExpression.userControlledProperty.get() && // exclude expressions that are being moved by a user
             !thatExpression.inProgressAnimationProperty.get() && // exclude expressions that are moving somewhere
             !thatExpression.collectedProperty.get() && // exclude expressions that are in a collection area
             thisExpression.getOverlap( thatExpression ) > maxOverlap ) {
          mostOverlappingExpression = thatExpression;
          maxOverlap = thisExpression.getOverlap( thatExpression );
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

    /**
     * get a reference to the collection area that most overlaps with the provided coin term, null if no overlap exists
     * @param {CoinTerm} coinTerm
     * @private
     */
    getMostOverlappingCollectionAreaForCoinTerm: function( coinTerm ) {
      var maxOverlap = 0;
      var mostOverlappingCollectionArea = null;
      this.collectionAreas.forEach( function( collectionArea ) {
        var coinTermBounds = coinTerm.getViewBounds();
        var collectionAreaBounds = collectionArea.bounds;
        var xOverlap = Math.max(
          0,
          Math.min( coinTermBounds.maxX, collectionAreaBounds.maxX ) - Math.max( coinTermBounds.minX, collectionAreaBounds.minX )
        );
        var yOverlap = Math.max(
          0,
          Math.min( coinTermBounds.maxY, collectionAreaBounds.maxY ) - Math.max( coinTermBounds.minY, collectionAreaBounds.minY )
        );
        var totalOverlap = xOverlap * yOverlap;
        if ( totalOverlap > maxOverlap ) {
          maxOverlap = totalOverlap;
          mostOverlappingCollectionArea = collectionArea;
        }
      } );
      return mostOverlappingCollectionArea;
    },

    /**
     * handler for when a coin term is added to the model, hooks up a bunch of listeners
     * @param addedCoinTerm
     * @private
     */
    coinTermAddedListener: function( addedCoinTerm ) {

      var self = this;

      // Add a listener that will potentially combine this coin term with expressions or other coin terms based on
      // where it is released.
      function coinTermUserControlledListener( userControlled ) {

        if ( userControlled === false ) {

          // Set a bunch of variables related to the current state of this coin term.  It's not really necessary to set
          // them all every time, but it avoids a deeply nested if-else structure.
          var releasedOverCreatorBox = addedCoinTerm.getViewBounds().intersectsBounds( self.creatorBoxBounds );
          var expressionBeingEdited = self.expressionBeingEditedProperty.get();
          var mostOverlappingCollectionArea = self.getMostOverlappingCollectionAreaForCoinTerm( addedCoinTerm );
          var mostOverlappingExpression = self.getExpressionMostOverlappingWithCoinTerm( addedCoinTerm );
          var mostOverlappingLikeCoinTerm = self.getMostOverlappingLikeCoinTerm( addedCoinTerm );
          var joinableFreeCoinTerm = self.checkForJoinableFreeCoinTerm( addedCoinTerm );

          if ( expressionBeingEdited ) {

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
              overlappingLikeCoinTerm.absorb( addedCoinTerm, self.partialCancellationEnabled );
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
          else if ( releasedOverCreatorBox ) {

            // the user has put this coin term back in the creator box, so remove it
            self.removeCoinTerm( addedCoinTerm, true );
          }
          else if ( mostOverlappingCollectionArea ) {

            // The coin term was released over a collection area (this only occurs on game screens).  Notify the
            // collection area so that it can either collect or reject it.
            mostOverlappingCollectionArea.collectOrRejectCoinTerm( addedCoinTerm );
          }
          else if ( mostOverlappingExpression ) {

            // the user is adding the coin term to an expression
            mostOverlappingExpression.addCoinTerm( addedCoinTerm );
            expressionExchange.log && expressionExchange.log( 'added ' + addedCoinTerm.id + ' to ' +
                                                              mostOverlappingExpression.id );
          }
          else if ( mostOverlappingLikeCoinTerm ) {

            // The coin term was released over a coin term of the same type, so combine the two coin terms into a single
            // one with a higher count value.
            addedCoinTerm.destinationReachedEmitter.addListener( function destinationReachedListener() {
              mostOverlappingLikeCoinTerm.absorb( addedCoinTerm, self.partialCancellationEnabled );
              expressionExchange.log && expressionExchange.log(
                mostOverlappingLikeCoinTerm.id + ' absorbed ' + addedCoinTerm.id + ', ' +
                mostOverlappingLikeCoinTerm.id + ' composition = ' + '[' +
                mostOverlappingLikeCoinTerm.composition + ']' );
              self.removeCoinTerm( addedCoinTerm, false );
              addedCoinTerm.destinationReachedEmitter.removeListener( destinationReachedListener );
            } );
            addedCoinTerm.travelToDestination( mostOverlappingLikeCoinTerm.positionProperty.get() );
          }
          else if ( joinableFreeCoinTerm ) {

            // The coin term was released in a place where it could join another free coin term.
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

      addedCoinTerm.userControlledProperty.lazyLink( coinTermUserControlledListener );

      // add a listener that will handle requests to break apart the coin term
      function coinTermBreakApartListener() {

        if ( addedCoinTerm.composition.length < 2 ) {
          // bail if the coin term can't be decomposed
          return;
        }
        var extractedCoinTerms = addedCoinTerm.extractConstituentCoinTerms();
        var relativeViewBounds = addedCoinTerm.localViewBoundsProperty.get();

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
    },

    /**
     * handle the addition of an expresion to the model
     * @param {Expression} addedExpression
     * @private
     */
    expressionAddedListener: function( addedExpression ) {
      var self = this;

      // add a listener for when the expression is released, which may cause it to be combined with another expression
      function expressionUserControlledListener( userControlled ) {

        if ( !userControlled ) {

          // Set a bunch of variables related to the current state of this expression.  It's not really necessary to set
          // them all every time, but it avoids a deeply nested if-else structure.
          var releasedOverCreatorBox = addedExpression.getBounds().intersectsBounds( self.creatorBoxBounds );
          var mostOverlappingCollectionArea = self.getMostOverlappingCollectionAreaForExpression( addedExpression );
          var mostOverlappingExpression = self.getExpressionMostOverlappingWithExpression( addedExpression );
          var numOverlappingCoinTerms = addedExpression.hoveringCoinTerms.length;

          // state checking
          assert && assert(
            numOverlappingCoinTerms === 0 || numOverlappingCoinTerms === 1,
            'max of one overlapping free coin term when expression is released, seeing ' + numOverlappingCoinTerms
          );

          if ( releasedOverCreatorBox ) {

            // the expression was released over the creator box, so it and the coin terms should be "put away"
            self.removeExpression( addedExpression );
          }
          else if ( mostOverlappingCollectionArea ) {

            // The expression was released in a location that at least partially overlaps a collection area.  The
            // collection area must decide whether to collect or reject the expression.
            mostOverlappingCollectionArea.collectOrRejectExpression( addedExpression );
          }
          else if ( mostOverlappingExpression ) {

            // The expression was released in a place where it at least partially overlaps another expression, the the
            // two expressions should be joined into one.  The first step is to remove the expression from the list of
            // those hovering.
            mostOverlappingExpression.removeHoveringExpression( addedExpression );

            // send the combining expression to the right side of receiving expression
            var destinationForCombine = mostOverlappingExpression.getUpperRightCorner();
            addedExpression.travelToDestination( destinationForCombine );

            // Listen for when the expression is in place and, when it is, transfer its coin terms to the receiving
            // expression.
            addedExpression.destinationReachedEmitter.addListener( function destinationReachedListener() {

              // destination reached, combine with other expression, but ONLY if it hasn't moved
              if ( mostOverlappingExpression.getUpperRightCorner().equals( destinationForCombine ) ) {
                var coinTermsToBeMoved = addedExpression.removeAllCoinTerms();
                self.expressions.remove( addedExpression );
                coinTermsToBeMoved.forEach( function( coinTerm ) {
                  expressionExchange.log && expressionExchange.log( 'moving ' + coinTerm.id + ' from ' +
                                                                    addedExpression.id + ' to ' +
                                                                    mostOverlappingExpression.id );
                  mostOverlappingExpression.addCoinTerm( coinTerm );
                } );
                addedExpression.destinationReachedEmitter.removeListener( destinationReachedListener );
              }
            } );
          }
          else if ( numOverlappingCoinTerms === 1 ) {

            // the expression was released over a free coin term, so have that free coin term join the expression
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
    },

    /**
     * @public
     */
    reset: function() {

      // reset any collection areas that have been created
      this.collectionAreas.forEach( function( collectionArea ) {
        collectionArea.reset();
      } );

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

    /**
     * test if coinTermB is in the "expression combine zone" of coinTermA
     * @param {CoinTerm} coinTermA
     * @param {CoinTerm} coinTermB
     * @returns {boolean}
     * @private
     */
    isCoinTermInExpressionCombineZone: function( coinTermA, coinTermB ) {

      // TODO: This could end up being a fair amount of allocations and may need some pre-allocated bounds for good performance
      // Make the combine zone wider, but vertically shorter, than the actual bounds, as this gives the most desirable
      // behavior.  The multiplier for the height was empirically determined.
      var extendedTargetCoinTermBounds = coinTermA.getViewBounds().dilatedXY(
        coinTermA.localViewBoundsProperty.get().width,
        -coinTermA.localViewBoundsProperty.get().height * 0.25
      );

      return extendedTargetCoinTermBounds.intersectsBounds( coinTermB.getViewBounds() );
    },

    /**
     * returns true if coin term is currently part of an expression
     * @param {CoinTerm} coinTerm
     * @returns {boolean}
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
     * @param {CoinTerm} thisCoinTerm
     * @returns {CoinTerm|null}
     * @private
     */
    checkForJoinableFreeCoinTerm: function( thisCoinTerm ) {

      var joinableFreeCoinTerm = null;
      var self = this;

      this.coinTerms.forEach( function( thatCoinTerm ) {

        // Okay, this is one nasty looking 'if' clause, but the basic idea is that first a bunch of conditions are
        // checked that would exclude the provided coin terms from joining, then it checks to see if the coin term is
        // in the 'join zone', and then checks that it's closer than any previously found joinable coin term.
        if ( thatCoinTerm !== thisCoinTerm && // exclude thisCoinTerm
             !thatCoinTerm.userControlledProperty.get() && // exclude coin terms that are user controlled
             !self.isCoinTermInExpression( thatCoinTerm ) && // exclude coin terms that are already in expressions
             !thatCoinTerm.collectedProperty.get() && // exclude coin terms that are in a collection
             !thatCoinTerm.inProgressAnimationProperty.get() && // exclude coin terms that are moving
             self.isCoinTermInExpressionCombineZone( thatCoinTerm, thisCoinTerm ) && // in the 'combine zone'
             ( !joinableFreeCoinTerm ||
               ( joinableFreeCoinTerm.positionProperty.get().distance( thatCoinTerm ) <
                 joinableFreeCoinTerm.positionProperty.get().distance( thisCoinTerm ) ) ) ) {

          joinableFreeCoinTerm = thatCoinTerm;
        }
      } );

      return joinableFreeCoinTerm;
    },

    /**
     * get the amount of overlap given two coin terms by comparing position and coin radius
     * @param {CoinTerm} coinTermA
     * @param {CoinTerm} coinTermB
     * @returns {number}
     * @private
     */
    getCoinOverlapAmount: function( coinTermA, coinTermB ) {
      var distanceBetweenCenters = coinTermA.positionProperty.get().distance( coinTermB.positionProperty.get() );
      return Math.max( ( coinTermA.coinRadius + coinTermB.coinRadius ) - distanceBetweenCenters, 0 );
    },

    /**
     * get the amount of overlap between the view representations of two coin terms
     * @param {CoinTerm} coinTermA
     * @param {CoinTerm} coinTermB
     * @returns {number} amount of overlap, which is essentially an area value in view coordinates
     */
    getViewBoundsOverlapAmount: function( coinTermA, coinTermB ) {
      var overlap = 0;

      if ( coinTermA.getViewBounds().intersectsBounds( coinTermB.getViewBounds() ) ) {
        var intersection = coinTermA.getViewBounds().intersection( coinTermB.getViewBounds() );
        overlap = intersection.width * intersection.height;
      }
      return overlap;
    },

    /**
     * get the coin term that overlaps the most with the provided coin term, is of the same type, is not user
     * controlled, and is not already in an expression
     * @param {CoinTerm} thisCoinTerm
     * @returns {CoinTerm}
     * @private
     */
    getMostOverlappingLikeCoinTerm: function( thisCoinTerm ) {
      assert && assert( this.coinTerms.contains( thisCoinTerm ), 'overlap requested for something that is not in model' );
      var self = this;
      var mostOverlappingLikeCoinTerm = null;
      var maxOverlapAmount = 0;

      this.coinTerms.forEach( function( thatCoinTerm ) {

        // test that the coin term is eligible for consideration first
        if ( thatCoinTerm.isEligibleToCombineWith( thisCoinTerm ) && !self.isCoinTermInExpression( thatCoinTerm ) ) {

          // calculate and compare the relative overlap amounts, done a bit differently in the different view modes
          var overlapAmount;
          if ( self.viewModeProperty.get() === ViewMode.COINS ) {
            overlapAmount = self.getCoinOverlapAmount( thisCoinTerm, thatCoinTerm );
          }
          else {
            overlapAmount = self.getViewBoundsOverlapAmount( thisCoinTerm, thatCoinTerm );
          }

          if ( overlapAmount > maxOverlapAmount ) {
            maxOverlapAmount = overlapAmount;
            mostOverlappingLikeCoinTerm = thatCoinTerm;
          }
        }
      } );
      return mostOverlappingLikeCoinTerm;
    },

    /**
     * @param {CoinTerm} coinTerm
     * @param {Expression} expression
     * @returns {CoinTerm|null}
     * @private
     */
    getOverlappingLikeCoinTermWithinExpression: function( coinTerm, expression ) {

      var overlappingCoinTerm = null;

      for ( var i = 0; i < expression.coinTerms.length; i++ ) {
        var potentiallyOverlappingCoinTerm = expression.coinTerms.get( i );
        if ( potentiallyOverlappingCoinTerm.isEligibleToCombineWith( coinTerm ) ) {
          var overlapAmount = 0;
          if ( this.viewModeProperty.get() === ViewMode.COINS ) {
            overlapAmount = this.getCoinOverlapAmount( coinTerm, potentiallyOverlappingCoinTerm );
          }
          else {
            overlapAmount = this.getViewBoundsOverlapAmount( coinTerm, potentiallyOverlappingCoinTerm );
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