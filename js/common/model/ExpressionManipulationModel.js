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
  var Bounds2 = require( 'DOT/Bounds2' );
  var AllowedRepresentationsEnum = require( 'EXPRESSION_EXCHANGE/common/model/AllowedRepresentationsEnum' );
  var CoinTermCollectionEnum = require( 'EXPRESSION_EXCHANGE/common/model/CoinTermCollectionEnum' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var Expression = require( 'EXPRESSION_EXCHANGE/common/model/Expression' );
  var ExpressionHint = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionHint' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );
  var ViewModeEnum = require( 'EXPRESSION_EXCHANGE/common/model/ViewModeEnum' );

  // constants
  var BREAK_APART_SPACING = 10;

  // utility function for determining which coin term in a set that is closest to the provided position
  function getClosestCoinTermToPosition( position, coinTerms ) {
    assert && assert( coinTerms.length > 0, 'coinTerms must be an array with at least one coin' );
    var distanceToClosestCoin = Number.POSITIVE_INFINITY;
    var closestCoin = null;
    coinTerms.forEach( function( coin ) {
      if ( position.distance( coin.position ) < distanceToClosestCoin ) {
        closestCoin = coin;
        distanceToClosestCoin = position.distance( closestCoin.position );
      }
    } );
    return closestCoin;
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
      coinTermCollection: CoinTermCollectionEnum.BASIC,

      // defines whether to present just coins, just variables, or both to the user
      allowedRepresentations: AllowedRepresentationsEnum.COINS_AND_VARIABLES

    }, options );

    var initialViewMode = options.allowedRepresentations === AllowedRepresentationsEnum.VARIABLES_ONLY ?
                          ViewModeEnum.VARIABLES : ViewModeEnum.COINS;

    PropertySet.call( this, {
      viewMode: initialViewMode, // @public
      showCoinValues: false, // @public
      showVariableValues: false, // @public
      showAllCoefficients: false, // @public
      xTermValue: 2, // @public
      yTermValue: 5, // @public
      zTermValue: 10, // @public
      totalCents: 0 // @public, read-only
    } );

    var self = this;

    // @public, read only, options that control what is available to the user to manipulate
    this.coinTermCollection = options.coinTermCollection;
    this.allowedRepresentations = options.allowedRepresentations;

    // @public, read and listen only, list of all coin terms in the model
    this.coinTerms = new ObservableArray();

    // @public, read and listen only, list of expressions in the model
    this.expressions = new ObservableArray();

    // @public, read and listen only, list of expression hints in the model
    this.expressionHints = new ObservableArray();

    // function to update the total cents whenever a coin is added or removed
    function updateTotal() {
      var total = 0;
      self.coinTerms.forEach( function( coinTerm ) {
        total += coinTerm.coinValue * coinTerm.combinedCount;
      } );
      self.totalCents = total;
    }

    // add listeners for updating the total coin value
    this.coinTerms.addItemAddedListener( updateTotal );
    this.coinTerms.addItemRemovedListener( updateTotal );

    // when a coin term is added, add listeners to handle it being released
    this.coinTerms.addItemAddedListener( function( addedCoinTerm ) {
      // TODO: Revisit this and verify that this doesn't leak memory, making sure that all added listeners are removed
      // TODO: Work through this and see if it can be made more compact and readable (it's evolving a lot as it's being written)


      // Add a handler for when the coin term is released, which may add the coin to an expression or combine it with
      // another coin term.
      addedCoinTerm.userControlledProperty.lazyLink( function( userControlled ) {

        if ( userControlled === false ) {
          // check first for overlap with expressions
          var mostOverlappingExpression = self.getExpressionMostOverlappingWithCoinTerm( addedCoinTerm );
          if ( mostOverlappingExpression ) {
            console.log( 'adding ' + addedCoinTerm.id + ' to ' + mostOverlappingExpression.id );
            mostOverlappingExpression.addCoinTerm( addedCoinTerm );
          }
          else {
            // there was no overlap with expressions, check for overlap with coin terms
            var overlappingCoinTerms = self.getOverlappingCoinTerms( addedCoinTerm );

            if ( overlappingCoinTerms.length > 0 ) {
              var coinToCombineWith = getClosestCoinTermToPosition( addedCoinTerm.position, overlappingCoinTerms );
              if ( coinToCombineWith.termText === addedCoinTerm.termText ) {

                // same type of coin, so combine them
                addedCoinTerm.travelToDestination( coinToCombineWith.position );
                addedCoinTerm.destinationReachedEmitter.addListener( function destinationReachedListener() {
                  coinToCombineWith.combinedCount += addedCoinTerm.combinedCount;
                  self.removeCoinTerm( addedCoinTerm, false );
                  addedCoinTerm.destinationReachedEmitter.removeListener( destinationReachedListener );
                } );
              }
              else {
                self.expressions.push( new Expression( coinToCombineWith, addedCoinTerm ) );
              }
            }
            else {
              // there were no overlapping coin terms, so check if close enough to form an expression
              var joinableFreeCoinTerm = self.checkForJoinableFreeCoinTerm( addedCoinTerm );
              if ( joinableFreeCoinTerm ) {
                self.expressions.push( new Expression( joinableFreeCoinTerm, addedCoinTerm ) );
              }
            }
          }
        }
      } );

      // add a listener that will handle breaking apart the coin if necessary
      addedCoinTerm.breakApartEmitter.addListener( function() {

        if ( Math.abs( addedCoinTerm.combinedCount ) < 2 ) {
          // bail if the coin is a single
          return;
        }
        var numToCreate = Math.abs( addedCoinTerm.combinedCount ) - 1;

        // set this coin back to being a single, keeping the sign the same
        addedCoinTerm.combinedCount = addedCoinTerm.combinedCount > 0 ? 1 : -1;

        // add new coin terms to represent those that were broken out from the initial one
        var interCoinTermDistance = addedCoinTerm.relativeViewBounds.width + BREAK_APART_SPACING;
        var nextLeftX = addedCoinTerm.position.x - interCoinTermDistance;
        var nextRightX = addedCoinTerm.position.x + interCoinTermDistance;
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
      } );

      // add a listener that will remove this coin when it returns to its original position
      addedCoinTerm.returnedToOriginEmitter.addListener( function() {
        self.removeCoinTerm( addedCoinTerm, false );
      } );
    } );

    this.expressions.addItemAddedListener( function( addedExpression ) {
      // TODO: Revisit this and verify that this doesn't leak memory

      // add a handler for when the expression is released, which may cause it to be combined with another expression
      addedExpression.userControlledProperty.lazyLink( function( userControlled ) {

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
                console.log( 'moving ' + coinTerm.id + ' from ' + addedExpression.id + ' to ' + mostOverlappingExpression.id );
                mostOverlappingExpression.addCoinTerm( coinTerm );
              } );
              addedExpression.destinationReachedEmitter.removeListener( destinationReachedListener );
              // TODO: I haven't thought through and added handling for the case where a reset occurs during the course
              // TODO: of this animation.  How does the listener get removed in that case, or does it even have to?  I'll
              // TODO: need to do that at some point.
            } );
          }
        }
      } );
    } );
  }

  return inherit( PropertySet, ExpressionManipulationModel, {

    step: function( dt ) {

      var self = this;

      // get a list of user controlled expressions
      var userControlledExpressions = _.filter( this.expressions.getArray(), function( expression ) {
        return expression.userControlled;
      } );

      // check each user controlled expression to see if it is in a position to combine with another expression
      userControlledExpressions.forEach( function( userControlledExpression ) {
        var mostOverlappingExpression = self.getExpressionMostOverlappingWithExpression( userControlledExpression );

        // update hover info for each expression with respect to this expression
        self.expressions.forEach( function( expression ) {
          if ( expression === mostOverlappingExpression ) {
            expression.addHoveringExpression( userControlledExpression );
          }
          else {
            expression.removeHoveringExpression( userControlledExpression );
          }
        } );
      } );

      // get a list of all user controlled coins (max of one coin on mouse-based systems, any number on touch-based)
      var userControlledCoinTerms = _.filter( this.coinTerms.getArray(), function( coin ) { return coin.userControlled; } );

      // check each user-controlled coin to see if it's in a position to combine with an expression or another coin term
      var coinTermsThatCouldCombine = [];
      var neededExpressionHints = [];
      userControlledCoinTerms.forEach( function( userControlledCoinTerm ) {

        var mostOverlappingExpression = self.getExpressionMostOverlappingWithCoinTerm( userControlledCoinTerm );

        // update hover info for each expression with respect to this coin term
        self.expressions.forEach( function( expression ) {
          if ( expression === mostOverlappingExpression ) {
            expression.addHoveringCoinTerm( userControlledCoinTerm );
          }
          else {
            expression.removeHoveringCoinTerm( userControlledCoinTerm );
          }
        } );

        if ( !mostOverlappingExpression ) { // not overlapping any expressions, check overlap with other coin terms

          // TODO: This portion of code should be revised to be more similar to the clause above, where there is a
          // method to get the most overlapping, and overlap is determined using the view bounds.
          var overlappingCoinTerms = self.getOverlappingCoinTerms( userControlledCoinTerm );
          if ( overlappingCoinTerms.length > 0 ) {
            coinTermsThatCouldCombine.push( userControlledCoinTerm );
            coinTermsThatCouldCombine.push( getClosestCoinTermToPosition( userControlledCoinTerm.position, overlappingCoinTerms ) );
          }

          if ( overlappingCoinTerms.length === 0 ) {

            // The current user-controlled coin term is not overlapping any coins, so now check if it is in the
            // 'expression combine zone' of any other single coins.
            var joinableFreeCoinTerm = self.checkForJoinableFreeCoinTerm( userControlledCoinTerm );
            if ( joinableFreeCoinTerm ) {

              // there is such a coin term, add the pair to the list
              neededExpressionHints.push( new ExpressionHint( joinableFreeCoinTerm, userControlledCoinTerm ) );
            }
          }
        }

      } );

      // go through all coin terms and set the state of their combine halos
      this.coinTerms.forEach( function( coin ) {
        coin.combineHaloActive = coinTermsThatCouldCombine.indexOf( coin ) !== -1;
      } );

      // update the expression hints for single coins that could combine
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
            self.expressionHints.remove( existingExpressionHint );
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
        this.expressionHints.clear();
      }

      // step the expressions
      this.expressions.forEach( function( expression ) {
        expression.step( dt );
      } );
    },

    // @private - returns the first hint encountered that contains the provided coin term
    getExpressionHintContainingCoinTerm: function( coinTerm ) {
      var hint;
      for ( var i = 0; i < this.expressionHints.length; i++ ) {
        if ( this.expressionHints.get( i ).containsCoinTerm( coinTerm ) ) {
          hint = this.expressionHints.get( i );
          break;
        }
      }
      return hint;
    },

    // @public
    addCoinTerm: function( coinTerm ) {
      this.coinTerms.add( coinTerm );
    },

    // @public TODO this will likely be made more fancy at some point, i.e. will include some animation
    removeCoinTerm: function( coinTerm, animate ) {
      if ( animate ){
        coinTerm.returnToOrigin();
      }
      else{
        this.coinTerms.remove( coinTerm );
      }
    },

    // @public - remove the specified expression
    removeExpression: function( expression ) {
      var self = this;
      var coinTermsToRemove = expression.removeAllCoinTerms();
      coinTermsToRemove.forEach( function( coinTerm ) {
        self.removeCoinTerm( coinTerm, true );
      } );
      this.expressions.remove( expression );
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
      PropertySet.prototype.reset.call( this );
    },

    // @private - utility function for determining whether two coin terms overlap
    doCoinTermsOverlap: function( coinTerm1, coinTerm2 ) {
      var distanceBetweenCenters = coinTerm1.position.distance( coinTerm2.position );

      // the decision about whether these overlap depends upon whether we are in COIN and VARIABLES mode
      if ( this.viewMode === ViewModeEnum.COINS ) {
        return distanceBetweenCenters < ( coinTerm1.coinDiameter / 2 ) + ( coinTerm2.coinDiameter / 2 );
      }
      else {
        // multiplier in test below was empirically determined
        return distanceBetweenCenters < EESharedConstants.TERM_COMBINE_RADIUS * 1.15;
      }
    },

    // @private - test if coinTermB is in the "expression combine zone" of coinTermA
    isCoinTermInExpressionCombineZone: function( coinTermA, coinTermB ) {

      // TODO: This could end up being a fair amount of allocations and may need some pre-allocated bounds
      var extendedTargetCoinTermBounds = new Bounds2(
        coinTermA.position.x + coinTermA.relativeViewBounds.minX,
        coinTermA.position.y + coinTermA.relativeViewBounds.minY,
        coinTermA.position.x + coinTermA.relativeViewBounds.maxX,
        coinTermA.position.y + coinTermA.relativeViewBounds.maxY
      ).dilatedX( coinTermA.relativeViewBounds.width );

      var potentiallyJoiningCoinTermBounds = new Bounds2(
        coinTermB.position.x + coinTermB.relativeViewBounds.minX,
        coinTermB.position.y + coinTermB.relativeViewBounds.minY,
        coinTermB.position.x + coinTermB.relativeViewBounds.maxX,
        coinTermB.position.y + coinTermB.relativeViewBounds.maxY
      );

      return extendedTargetCoinTermBounds.intersectsBounds( potentiallyJoiningCoinTermBounds );
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
     * the provided coin into an expression.  If more than one possibility exists, the closest is returned.  If none
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

    // @private, gets a list of coins that overlap with the provided coin
    getOverlappingCoinTerms: function( coinTerm ) {
      assert && assert( this.coinTerms.contains( coinTerm ), 'overlap requested for something that is not in model' );
      var self = this;
      var overlappingCoinTerms = [];
      this.coinTerms.forEach( function( potentiallyOverlappingCoinTerm ) {
        if ( coinTerm !== potentiallyOverlappingCoinTerm && !potentiallyOverlappingCoinTerm.userControlled && // exclude coin terms that are being moved by a user
             !self.isCoinTermInExpression( potentiallyOverlappingCoinTerm ) && // exclude coin terms that are in expressions
             self.doCoinTermsOverlap( coinTerm, potentiallyOverlappingCoinTerm ) ) {
          overlappingCoinTerms.push( potentiallyOverlappingCoinTerm );
        }
      } );
      return overlappingCoinTerms;
    }
  } );
} );