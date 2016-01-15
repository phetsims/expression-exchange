// Copyright 2016, University of Colorado Boulder

/**
 * model of a coin which can be represented in the view as a coin image or a mathematical term
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
  function Coin( termInfo ) {
    PropertySet.call( this, {
      position: Vector2.ZERO, // @public
      userControlled: false // @public, indicate whether user is currently dragging this coin
    } );
    this.termInfo = termInfo; // @public, read only
  }

  return inherit( PropertySet, Coin );
} );