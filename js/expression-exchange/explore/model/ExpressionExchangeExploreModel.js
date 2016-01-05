// Copyright 2016, University of Colorado Boulder

/**
 * main model for the 'Explore' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Coin = require( 'EXPRESSION_EXCHANGE/expression-exchange/common/model/Coin' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @constructor
   */
  function ExpressionExchangeExploreModel() {

    PropertySet.call( this, {
      totalCents: 0, // @public, read-only
      showValues: false, // @public
      showAllCoefficients: false // @public
    } );

    // @public, read and listen only
    this.coins = new ObservableArray();

    // TODO temp - add some initial coins
    var coin;
    coin = Coin.createCoin( 1 );
    this.coins.add( coin );
  }

  return inherit( PropertySet, ExpressionExchangeExploreModel, {

    //TODO Called by the animation loop. Optional, so if your model has no animation, please delete this.
    step: function( dt ) {
      //TODO Handle model animation here.
    }
  } );
} );