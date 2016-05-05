// Copyright 2016, University of Colorado Boulder

/**
 * Constants that are shared between the various portions of the Expression Exchange simulation.
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );

  var EESharedConstants = {

    // radius at which terms can be combined
    TERM_COMBINE_RADIUS: 35,

    // speed at which coins and terms move
    COIN_TERM_MOVEMENT_SPEED: 400, // in model units (which are basically screen coordinates) per second

    EXPRESSION_BACKGROUND_COLOR: 'rgba( 255, 255, 255, 0.5 )',

    // the characters to use for the various variables depicted in the sim
    X_VARIABLE_CHAR: '\uD835\uDC65',
    Y_VARIABLE_CHAR: '\uD835\uDC66',
    Z_VARIABLE_CHAR: '\uD835\uDC67'

  };

  expressionExchange.register( 'EESharedConstants', EESharedConstants );

  return EESharedConstants;

} );