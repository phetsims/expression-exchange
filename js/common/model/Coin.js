// Copyright 2016, University of Colorado Boulder

/**
 * This type represents a model of a single or combined coin which can be represented in the view as a coin image or a
 * mathematical term.  A 'combined' coin is one where other matching coins have been combined with this one, kind of
 * like a stack of coins, though they are not represented in the view as a stack.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var MOVEMENT_SPEED = 100; // in model units (which are basically screen coordinates) per second

  /**
   * TODO: document parameters once finalized
   * @constructor
   */
  function Coin( termInfo ) {
    PropertySet.call( this, {
      position: Vector2.ZERO, // @public
      userControlled: false, // @public, indicate whether user is currently dragging this coin
      coinCount: 1 // @public, number of coins represented
    } );
    this.termInfo = termInfo; // @public, read only
    this.destinationReached = new Emitter(); // @public, listen only, fired when a destination is reached
  }

  return inherit( PropertySet, Coin, {

    /**
     * move to the specified destination, but do so a step at a time rather than all at once
     * @param {Vector2} destination
     */
    travelToDestination: function( destination ){
      var self = this;
      var movementTime = self.position.distance( destination ) / MOVEMENT_SPEED * 1000;
      new TWEEN.Tween( { x: this.position.x, y: this.position.y } )
        .to( { x: destination.x, y: destination.y }, movementTime )
        .easing( TWEEN.Easing.Cubic.InOut )
        .onUpdate( function() {
          self.position = new Vector2( this.x, this.y );
        } )
        .onComplete( function(){
          self.destinationReached.emit();
        } )
        .start();

    }
  } );
} );