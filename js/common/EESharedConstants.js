// Copyright 2016, University of Colorado Boulder

/**
 * Constants that are shared between the various portions of the Expression Exchange simulation.
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var Color = require( 'SCENERY/util/Color' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );

  var EESharedConstants = {

    LAYOUT_BOUNDS: new Bounds2( 0, 0, 1024, 618 ), // at the time of this writing this is the same as the default

    // radius at which terms can be combined
    TERM_COMBINE_DISTANCE: 35,

    // speed at which coins and terms move
    COIN_TERM_MOVEMENT_SPEED: 400, // in model units (which are basically screen coordinates) per second

    // colors
    NON_GAME_SCREENS_BACKGROUND_COLOR: '#AFF6CC',
    GAME_SCREEN_BACKGROUND_COLOR: '#CCE7FF',
    EXPRESSION_BACKGROUND_COLOR: 'rgba( 255, 255, 255, 0.5 )',
    CONTROL_PANEL_BACKGROUND_COLOR: new Color( 'rgb( 235, 235, 235 )' ),

    // characters used for the variables depicted in the sim
    X_VARIABLE_CHAR: 'x',
    Y_VARIABLE_CHAR: 'y',
    Z_VARIABLE_CHAR: 'z',

    // operator characters
    MINUS_SIGN_UNICODE: '\u2212',

    // amount of time that the popup buttons are shown
    POPUP_BUTTON_SHOW_TIME: 1.5, // in seconds,

    // largest supported value for a non-decomposable coin term, e.g. 8x
    MAX_NON_DECOMPOSABLE_AMOUNT: 8,

    // size of the collection areas in the game, in view coordinates, empirically determined
    COLLECTION_AREA_SIZE: new Dimension2( 220, 90 )
  };

  expressionExchange.register( 'EESharedConstants', EESharedConstants );

  return EESharedConstants;

} );