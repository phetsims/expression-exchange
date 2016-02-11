// Copyright 2016, University of Colorado Boulder

/**
 * Constants that are shared between the various portions of the Expression Exchange simulation.
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  return {

    // radius at which terms can be combined
    TERM_COMBINE_RADIUS: 35,

    // speed at which coins and terms move
    COIN_TERM_MOVEMENT_SPEED: 100, // in model units (which are basically screen coordinates) per second

    EXPRESSION_BACKGROUND_COLOR: 'rgba( 255, 255, 255, 0.5 )'

};

} );