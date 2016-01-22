// Copyright 2016, University of Colorado Boulder

/**
 * main model for the 'Explore' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PropertySet = require( 'AXON/PropertySet' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/explore/model/ViewMode' );

  // utility function for determining whether two coins overlap
  function coinsOverlap( coin1, coin2 ) {
    var distanceBetweenCenters = coin1.position.distance( coin2.position );
    return distanceBetweenCenters < ( coin1.termInfo.coinDiameter / 2 ) + ( coin2.termInfo.coinDiameter / 2 ) * 0.65;
  }

  // utility function for determining the coin in a set that is closest to the provided position
  function getClosestCoinToPosition( position, coins ) {
    assert && assert( coins.length > 0, 'coins must be an array with at least one coin' );
    var distanceToClosestCoin = Number.POSITIVE_INFINITY;
    var closestCoin;
    coins.forEach( function( coin ) {
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
      totalCents: 0, // @public, read-only
      showValues: false, // @public
      showAllCoefficients: false, // @public
      viewMode: ViewMode.COINS // @public
    } );
    var self = this;

    // @public, read and listen only, use API defined below to add and remove coins
    this.coins = new ObservableArray();

    // function to update the total cents whenever a coin is added or removed
    function updateTotal() {
      var total = 0;
      self.coins.forEach( function( coin ) {
        total += coin.termInfo.value * coin.coinCount;
      } );
      self.totalCents = total;
    }

    // add listeners for updating the total coin value
    this.coins.addItemAddedListener( updateTotal );
    this.coins.addItemRemovedListener( updateTotal );

    // add listeners to handling combining coins
    this.coins.addItemAddedListener( function( addedCoin ) {
      // TODO: Revisit this and verify that it doesn't leak memory

      // add a handler that will check for overlap upon release of a coin and, if found, will combine the coins
      addedCoin.userControlledProperty.onValue( false, function() {
        var overlappingCoins = self.getOverlappingCoins( addedCoin );

        if ( overlappingCoins.length > 0 ) {
          var coinToCombineWith = getClosestCoinToPosition( addedCoin.position, overlappingCoins );
          if ( coinToCombineWith.termInfo === addedCoin.termInfo ) {

            // same type of coin, so combine them
            addedCoin.travelToDestination( coinToCombineWith.position );
            addedCoin.destinationReached.addListener( function() {
              coinToCombineWith.coinCount += addedCoin.coinCount;
              self.removeCoin( addedCoin );
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

      // ---------------------------------------------------------------------
      // update the overlap state for all coins
      // ---------------------------------------------------------------------

      // get a list of all user controlled coins (max of one coin on mouse-based systems, more on touch-based)
      var userControlledCoins = _.filter( this.coins.getArray(), function( coin ) { return coin.userControlled; } );

      // make a list of all coins that should have halos
      var coinsThatCouldCombine = [];
      userControlledCoins.forEach( function( coin ) {
        var overlappingCoins = self.getOverlappingCoins( coin );
        if ( overlappingCoins.length > 0 ) {
          coinsThatCouldCombine.push( coin );
          coinsThatCouldCombine.push( getClosestCoinToPosition( coin.position, overlappingCoins ) );
        }
      } );

      // go through all coins and set the state of their combine halos
      this.coins.forEach( function( coin ) {
        coin.combineHaloActive = coinsThatCouldCombine.indexOf( coin ) !== -1;
      } );
    },

    // @public
    addCoin: function( coin ) {
      this.coins.add( coin );
    },

    // @public TODO this will likely be made more fancy at some point, i.e. will include some animation
    removeCoin: function( coin ) {
      this.coins.remove( coin );
    },

    // @public
    reset: function() {
      this.coins.clear();
      PropertySet.prototype.reset.call( this );
    },

    // @private, gets a list of coins that overlap with the provided coin
    getOverlappingCoins: function( coin ) {
      assert && assert( this.coins.contains( coin ), 'overlap requested for coin that is not in model' );
      var overlappingCoins = [];
      this.coins.forEach( function( potentiallyOverlappingCoin ) {
        if ( coin !== potentiallyOverlappingCoin && coinsOverlap( coin, potentiallyOverlappingCoin ) ) {
          overlappingCoins.push( potentiallyOverlappingCoin );
        }
      } );
      return overlappingCoins;
    }
  } );
} );