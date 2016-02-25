// Copyright 2016, University of Colorado Boulder

/**
 * main model for the 'Explore' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var Expression = require( 'EXPRESSION_EXCHANGE/common/model/Expression' );
  var ExpressionHint = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionHint' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PropertySet = require( 'AXON/PropertySet' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/explore/model/ViewMode' );

  // utility function for determining which coin term in a set that is closest to the provided position
  function getClosestCoinTermToPosition( position, coinTerms ) {
    assert && assert( coinTerms.length > 0, 'coinTerms must be an array with at least one coin' );
    var distanceToClosestCoin = Number.POSITIVE_INFINITY;
    var closestCoin;
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
  function EEExploreModel() {

    PropertySet.call( this, {
      viewMode: ViewMode.COINS, // @public
      showCoinValues: false, // @public
      showVariableValues: false, // @public
      showAllCoefficients: false, // @public
      xTermValue: 2, // @public
      yTermValue: 5, // @public
      zTermValue: 10, // @public
      totalCents: 0 // @public, read-only
    } );
    var self = this;

    // @public, read and listen only, list of all coin terms in the model
    this.coinTerms = new ObservableArray();

    // @public, read and listen only, list of expressions in the model
    this.expressions = new ObservableArray();

    // @public, read and listen only, list of expression hints in the model
    this.expressionHints = new ObservableArray();

    // function to update the total cents whenever a coin is added or removed
    function updateTotal() {
      var total = 0;
      self.coinTerms.forEach( function( coin ) {
        total += coin.coinValue * coin.combinedCount;
      } );
      self.totalCents = total;
    }

    // add listeners for updating the total coin value
    this.coinTerms.addItemAddedListener( updateTotal );
    this.coinTerms.addItemRemovedListener( updateTotal );

    // add listeners to handle combining coins
    this.coinTerms.addItemAddedListener( function( addedCoinTerm ) {
      // TODO: Revisit this and verify that this doesn't leak memory
      // TODO: Work through this and see if it can be made more compact and readable (it's evolving a lot as it's being written)

      // Add a handler for when the coin term is released, which may add the coin to an expression or combine it with
      // another coin term.
      addedCoinTerm.userControlledProperty.onValue( false, function() {

        // check first for overlap with expressions
        var mostOverlappingExpression = self.getMostOverlappingExpression( addedCoinTerm );
        if ( mostOverlappingExpression ){
          mostOverlappingExpression.addCoinTerm( addedCoinTerm );
        }
        else{
          // there was no overlap with expressions, check for overlap with coin terms
          var overlappingCoinTerms = self.getOverlappingCoinTerms( addedCoinTerm );

          if ( overlappingCoinTerms.length > 0 ) {
            var coinToCombineWith = getClosestCoinTermToPosition( addedCoinTerm.position, overlappingCoinTerms );
            if ( coinToCombineWith.termText === addedCoinTerm.termText ) {

              // same type of coin, so combine them
              addedCoinTerm.travelToDestination( coinToCombineWith.position );
              addedCoinTerm.destinationReached.addListener( function() {
                coinToCombineWith.combinedCount += addedCoinTerm.combinedCount;
                self.removeCoinTerm( addedCoinTerm );
              } );
            }
            else {
              self.expressions.add( new Expression( coinToCombineWith, addedCoinTerm ) );
            }
          }
          else {
            // there were no overlapping coin terms, so check if close enough to form an expression
            var joinableFreeCoinTerm = self.checkForJoinableFreeCoinTerm( addedCoinTerm );
            if ( joinableFreeCoinTerm ) {
              self.expressions.add( new Expression( joinableFreeCoinTerm, addedCoinTerm ) );
            }
          }

        }

      } );
    } );
  }

  return inherit( PropertySet, EEExploreModel, {

    step: function( dt ) {

      var self = this;

      // get a list of all user controlled coins (max of one coin on mouse-based systems, any number on touch-based)
      var userControlledCoinTerms = _.filter( this.coinTerms.getArray(), function( coin ) { return coin.userControlled; } );

      // check each user-controlled coin to see if it's in a position to combine with an expression or another coin term
      var coinTermsThatCouldCombine = [];
      var neededExpressionHints = [];
      userControlledCoinTerms.forEach( function( userControlledCoinTerm ) {

        var mostOverlappingExpression = self.getMostOverlappingExpression( userControlledCoinTerm );

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
    removeCoinTerm: function( coinTerm ) {
      this.coinTerms.remove( coinTerm );
    },

    /**
     * get the expression that overlaps the most with the provided coin term, null of no overlap exists
     * @param coinTerm
     * @private
     */
    getMostOverlappingExpression: function( coinTerm ) {
      var maxOverlap = 0;
      var mostOverlappingExpression = null;
      this.expressions.forEach( function( expression ) {
        if ( expression.getCoinTermJoinZoneOverlap( coinTerm ) > maxOverlap ) {
          mostOverlappingExpression = expression;
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
      if ( this.viewMode === ViewMode.COINS ) {
        return distanceBetweenCenters < ( coinTerm1.coinDiameter / 2 ) + ( coinTerm2.coinDiameter / 2 );
      }
      else {
        // multiplier in test below was empirically determined
        return distanceBetweenCenters < EESharedConstants.TERM_COMBINE_RADIUS * 1.15;
      }
    },

    // @private - test if coinTermB is in the "expression combine zone" of coinTermA
    isCoinTermInExpressionCombineZone: function( coinTermA, coinTermB ) {

      var positionDifferenceVector = coinTermA.position.minus( coinTermB.position );

      // this test depends upon the view mode, i.e. uses different criteria for coins versus text
      if ( this.viewMode === ViewMode.COINS ) {
        var radiusSum = coinTermA.coinDiameter / 2 + coinTermB.coinDiameter / 2;

        // tweak alert - the multipliers in this clause were empirically determined
        return ( Math.abs( positionDifferenceVector.x ) > radiusSum &&
                 Math.abs( positionDifferenceVector.x ) < radiusSum * 2.5 &&
                 Math.abs( positionDifferenceVector.y ) < radiusSum / 4 );
      }
      else {

        // tweak alert - the multipliers in this clause were empirically determined
        return ( Math.abs( positionDifferenceVector.x ) > EESharedConstants.TERM_COMBINE_RADIUS &&
                 Math.abs( positionDifferenceVector.x ) < EESharedConstants.TERM_COMBINE_RADIUS * 3 &&
                 Math.abs( positionDifferenceVector.y ) < EESharedConstants.TERM_COMBINE_RADIUS / 2 );
      }
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
        if ( ct !== testCoinTerm && !self.isCoinTermInExpression( ct ) ) {
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

    // @private - check if the given cointerm is currently part of an expression
    isCoinTermInExpression: function( coinTerm ) {
      // TODO: implement
      return false;
    },

    // @private, gets a list of coins that overlap with the provided coin
    getOverlappingCoinTerms: function( coinTerm ) {
      assert && assert( this.coinTerms.contains( coinTerm ), 'overlap requested for something that is not in model' );
      var self = this;
      var overlappingCoinTerms = [];
      this.coinTerms.forEach( function( potentiallyOverlappingCoinTerm ) {
        if ( coinTerm !== potentiallyOverlappingCoinTerm && !potentiallyOverlappingCoinTerm.userControlled &&
             self.doCoinTermsOverlap( coinTerm, potentiallyOverlappingCoinTerm ) ) {
          overlappingCoinTerms.push( potentiallyOverlappingCoinTerm );
        }
      } );
      return overlappingCoinTerms;
    }
  } );
} );