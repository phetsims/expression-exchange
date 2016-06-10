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
  var RandomIconFactory = require( 'EXPRESSION_EXCHANGE/common/view/RandomIconFactory' );

  var EESharedConstants = {

    // radius at which terms can be combined
    TERM_COMBINE_DISTANCE: 35,

    // speed at which coins and terms move
    COIN_TERM_MOVEMENT_SPEED: 400, // in model units (which are basically screen coordinates) per second

    EXPRESSION_BACKGROUND_COLOR: 'rgba( 255, 255, 255, 0.5 )',

    // characters used for the variables depicted in the sim
    X_VARIABLE_CHAR: 'x',
    Y_VARIABLE_CHAR: 'y',
    Z_VARIABLE_CHAR: 'z',

    // background color for control panels
    CONTROL_PANEL_BACKGROUND_COLOR: new Color( 'rgb( 235, 235, 235 )' ),

    // amount of time that the popup buttons are shown
    POPUP_BUTTON_SHOW_TIME: 1.5, // in seconds

    // TODO: This is temporary, and will be removed once we have artwork for the icons
    RANDOM_ICON_GENERATOR: new RandomIconFactory( 1814 )
  };

  expressionExchange.register( 'EESharedConstants', EESharedConstants );

  return EESharedConstants;

} );