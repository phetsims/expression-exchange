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

  // constants

  var TERM_STRING_TO_COIN_PARAM_MAPPING = {
    'x': { diameter: 45 },
    'y': { diameter: 45 },
    'z': { diameter: 60 },
    'x*y': { diameter: 60 },
    'x^2': { diameter: 75 },
    'y^2': { diameter: 75 },
    'x^2*y^2': { diameter: 80 }
  };

  /**
   * TODO: document parameters once finalized
   * @constructor
   */
  function Coin( termString, diameter ) {
    PropertySet.call( this, {
      position: Vector2.ZERO, // @public
      userControlled: false // @public, indicate whether user is currently dragging this coin
    } );
    this.termString = termString; // @public, read only
    this.diameter = diameter; // @public, read only
  }

  return inherit( PropertySet, Coin, {}, {

    /**
     * Create a coin based on the provided term string.  The simulation supports a fixed set of coins, each of which
     * map the a particular term string (e.g. 'x', '2*x', 'y^2').  The function creates the Coin model element that
     * corresponds to the provided term string.
     * @param {String} termString
     * @public
     */
    createCoinFromTermString: function( termString ){
      var coinParameters = TERM_STRING_TO_COIN_PARAM_MAPPING[ termString ];
      assert && assert( coinParameters, 'no coin defined for provided term string' );
      return new Coin( termString, coinParameters.diameter );
    }
  } );
} );