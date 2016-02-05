// Copyright 2016, University of Colorado Boulder

/**
 * main model for the 'Explore' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ExpressionExchangeSharedConstants = require( 'EXPRESSION_EXCHANGE/common/ExpressionExchangeSharedConstants' );
  var ExpressionHint = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionHint' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PropertySet = require( 'AXON/PropertySet' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/explore/model/ViewMode' );

  // utility function for determining the coin term in a set that is closest to the provided position
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
  function ExpressionExchangeExploreModel() {

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

    // @public, read and listen only, list of all coin terms in model
    this.coinTerms = new ObservableArray();

    // @public, read and listen only, list of expression hints in model
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
      // TODO: Revisit this and verify that it doesn't leak memory

      // add a handler that will check for overlap upon release of a coin and, if found, will combine the coins
      addedCoinTerm.userControlledProperty.onValue( false, function() {
        var overlappingCoins = self.getOverlappingCoinTerms( addedCoinTerm );

        if ( overlappingCoins.length > 0 ) {
          var coinToCombineWith = getClosestCoinTermToPosition( addedCoinTerm.position, overlappingCoins );
          if ( coinToCombineWith.termText === addedCoinTerm.termText ) {

            // same type of coin, so combine them
            addedCoinTerm.travelToDestination( coinToCombineWith.position );
            addedCoinTerm.destinationReached.addListener( function() {
              coinToCombineWith.combinedCount += addedCoinTerm.combinedCount;
              self.removeCoinTerm( addedCoinTerm );
            } );
          }
          // TODO: Add combining of dissimilar coins into expressions
          else {
            console.log( 'combining of dissimilar coins is not yet implemented' );
          }
        }
      } );
    } );
  }

  return inherit( PropertySet, ExpressionExchangeExploreModel, {

    step: function( dt ) {

      var self = this;

      // get a list of all user controlled coins (max of one coin on mouse-based systems, more on touch-based)
      var userControlledCoinTerms = _.filter( this.coinTerms.getArray(), function( coin ) { return coin.userControlled; } );

      // Check each user-controlled coin to see if it's in a position to combine with another coin or become part of an
      // expression.
      var coinTermsThatCouldCombine = [];
      var neededExpressionHints = [];
      userControlledCoinTerms.forEach( function( userControlledCoinTerm ) {

        // overlap trumps being in the expression combine zone, so check that first
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
          if ( !matchFound ){
            self.expressionHints.remove( existingExpressionHint );
          }
        } );

        // add any needed expression hints that are not yet on the list
        neededExpressionHints.forEach( function( neededExpressionHint ){
          var matchFound = false;
          self.expressionHints.forEach( function( existingExpressionHint ){
            if ( existingExpressionHint.equals( neededExpressionHint )){
              matchFound = true;
            }
          } );
          if ( !matchFound ){
            self.expressionHints.add( neededExpressionHint );
          }
        } );
      }
      else {
        this.expressionHints.clear();
      }
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

    // @public
    reset: function() {
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
        return distanceBetweenCenters < ExpressionExchangeSharedConstants.TERM_COMBINE_RADIUS * 1.15;
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
        return ( Math.abs( positionDifferenceVector.x ) > ExpressionExchangeSharedConstants.TERM_COMBINE_RADIUS &&
                 Math.abs( positionDifferenceVector.x ) < ExpressionExchangeSharedConstants.TERM_COMBINE_RADIUS * 3 &&
                 Math.abs( positionDifferenceVector.y ) < ExpressionExchangeSharedConstants.TERM_COMBINE_RADIUS / 2 );
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