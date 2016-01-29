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
      xTermValue : 2, // @public
      yTermValue : 5, // @public
      zTermValue : 10, // @public
      totalCents: 0 // @public, read-only
    } );
    var self = this;

    // @public, read and listen only, use API defined below to add and remove coins
    this.coinTerms = new ObservableArray();

    // function to update the total cents whenever a coin is added or removed
    function updateTotal() {
      var total = 0;
      self.coinTerms.forEach( function( coin ) {
        total += coin.coinValue * coin.coinCount;
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
              coinToCombineWith.coinCount += addedCoinTerm.coinCount;
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

      // ---------------------------------------------------------------------
      // update the overlap state for all coins
      // ---------------------------------------------------------------------

      // get a list of all user controlled coins (max of one coin on mouse-based systems, more on touch-based)
      var userControlledCoinTerms = _.filter( this.coinTerms.getArray(), function( coin ) { return coin.userControlled; } );

      // make a list of all coins that should have halos
      var coinTermsThatCouldCombine = [];
      userControlledCoinTerms.forEach( function( coin ) {
        var overlappingCoinTerms = self.getOverlappingCoinTerms( coin );
        if ( overlappingCoinTerms.length > 0 ) {
          coinTermsThatCouldCombine.push( coin );
          coinTermsThatCouldCombine.push( getClosestCoinTermToPosition( coin.position, overlappingCoinTerms ) );
        }
      } );

      // go through all coin terms and set the state of their combine halos
      this.coinTerms.forEach( function( coin ) {
        coin.combineHaloActive = coinTermsThatCouldCombine.indexOf( coin ) !== -1;
      } );
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
    coinTermsOverlap: function( coinTerm1, coinTerm2 ) {
      var distanceBetweenCenters = coinTerm1.position.distance( coinTerm2.position );

      // the decision about whether these overlap depends upon whether we are in COIN and VARIABLES mode
      if ( this.viewMode === ViewMode.COINS ){
        // multiplier in test below was empirically determined
        return distanceBetweenCenters < ( coinTerm1.coinDiameter / 2 ) + ( coinTerm2.coinDiameter / 2 ) * 0.65;
      }
      else{
        // multiplier in test below was empirically determined
        return distanceBetweenCenters < ExpressionExchangeSharedConstants.TERM_COMBINE_RADIUS * 1.25;
      }
    },

    // @private, gets a list of coins that overlap with the provided coin
    getOverlappingCoinTerms: function( coinTerm ) {
      assert && assert( this.coinTerms.contains( coinTerm ), 'overlap requested for something that is not in model' );
      var self = this;
      var overlappingCoinTerms = [];
      this.coinTerms.forEach( function( potentiallyOverlappingCoinTerm ) {
        if ( coinTerm !== potentiallyOverlappingCoinTerm && self.coinTermsOverlap( coinTerm, potentiallyOverlappingCoinTerm ) ) {
          overlappingCoinTerms.push( potentiallyOverlappingCoinTerm );
        }
      } );
      return overlappingCoinTerms;
    }
  } );
} );