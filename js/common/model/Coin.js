// Copyright 2016, University of Colorado Boulder

/**
 * model of a coin
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * TODO: document parameters once finalized
   * @constructor
   */
  function Coin( value ) {
    PropertySet.call( this, {
      position: Vector2.ZERO, // @public
      userControlled: false // @public, indicate whether user is currently dragging this coin
    } );
    this.value = value; // @public, read only
  }

  return inherit( PropertySet, Coin );
} );