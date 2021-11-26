// Copyright 2016-2021, University of Colorado Boulder

/**
 * Constants that are shared between the various portions of the Expression Exchange simulation.
 * @author John Blanco
 */

import Dimension2 from '../../../dot/js/Dimension2.js';
import { Color } from '../../../scenery/js/imports.js';
import expressionExchange from '../expressionExchange.js';

const EESharedConstants = {

  // radius at which terms can be combined
  TERM_COMBINE_DISTANCE: 35,

  // speed at which coins and terms move
  COIN_TERM_MOVEMENT_SPEED: 400, // in model units (which are basically screen coordinates) per second

  // colors
  NON_GAME_SCREENS_BACKGROUND_COLOR: '#AFF6CC',
  GAME_SCREEN_BACKGROUND_COLOR: '#CCE7FF',
  EXPRESSION_BACKGROUND_COLOR: 'rgba( 255, 255, 255, 0.5 )',
  CONTROL_PANEL_BACKGROUND_COLOR: new Color( 'rgb( 235, 235, 235 )' ),
  CARD_BACKGROUND_COLOR: '#FFFFEE',

  // amount of time that the popup buttons are shown
  POPUP_BUTTON_SHOW_TIME: 1.5, // in seconds,

  // largest supported value for a non-decomposable coin term, e.g. 8x
  MAX_NON_DECOMPOSABLE_AMOUNT: 8,

  // size of the collection areas in the game, in view coordinates, empirically determined
  COLLECTION_AREA_SIZE: new Dimension2( 220, 90 ),

  // misc
  RESET_ALL_BUTTON_RADIUS: 24
};

expressionExchange.register( 'EESharedConstants', EESharedConstants );

export default EESharedConstants;