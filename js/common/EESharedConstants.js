// Copyright 2016, University of Colorado Boulder

/**
 * Constants that are shared between the various portions of the Expression Exchange simulation.
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );

  var EESharedConstants = {

    // radius at which terms can be combined
    TERM_COMBINE_DISTANCE: 35,

    // speed at which coins and terms move
    COIN_TERM_MOVEMENT_SPEED: 400, // in model units (which are basically screen coordinates) per second

    EXPRESSION_BACKGROUND_COLOR: 'rgba( 255, 255, 255, 0.5 )',

    // characters used for the variables depicted in the sim
    X_VARIABLE_CHAR: '\uD835\uDC65',
    Y_VARIABLE_CHAR: '\uD835\uDC66',
    Z_VARIABLE_CHAR: '\uD835\uDC67',

    // background color for control panels
    CONTROL_PANEL_BACKGROUND_COLOR: new Color( 'rgb( 235, 235, 235 )' )
  };

  expressionExchange.register( 'EESharedConstants', EESharedConstants );

  return EESharedConstants;

} );