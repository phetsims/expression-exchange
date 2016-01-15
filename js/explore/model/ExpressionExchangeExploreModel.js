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
    function updateTotal(){
      var total = 0;
      self.coins.forEach( function( coin ){
        total += coin.termInfo.value;
      } );
      self.totalCents = total;
    }

    this.coins.addItemAddedListener( updateTotal );
    this.coins.addItemRemovedListener( updateTotal );
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
    }
  } );
} );