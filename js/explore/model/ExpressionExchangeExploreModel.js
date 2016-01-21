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

  // utility function
  function coinsOverlap( coin1, coin2 ) {
    var distanceBetweenCenters = coin1.position.distance( coin2.position );
    return distanceBetweenCenters < ( coin1.termInfo.coinDiameter / 2 ) + ( coin2.termInfo.coinDiameter / 2 ) * 0.65;
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
        total += coin.termInfo.value;
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
        // Only combine when there is a single overlap
        // TODO: Not sure if the single overlap rule will last, may need to get more sophisticated here.
        if ( overlappingCoins.length === 1 ) {
          var overlappingCoin = overlappingCoins[ 0 ];
          if ( overlappingCoin.termInfo === addedCoin.termInfo ) {
            // same type of coin, so combine them
            addedCoin.travelToDestination( overlappingCoin.position );
            addedCoin.destinationReached.addListener( function() {
              self.removeCoin( addedCoin );
              overlappingCoin.coinCount += 1;
            } );
          }
        }
      } );

      // add a handler that will check for overlap when a coin is moved and will activate and deactivate halos
      addedCoin.positionProperty.link( function() {
        if ( addedCoin.userControlled ) {
          var overlappingCoins = self.getOverlappingCoins( addedCoin );
          addedCoin.overlappingOtherCoins = overlappingCoins.length > 0;
        }
      } );
    } );
  }

  return inherit( PropertySet, ExpressionExchangeExploreModel, {

    //TODO Called by the animation loop. Optional, so if your model has no animation, please delete this.
    step: function( dt ) {
      //TODO Handle model animation here.
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