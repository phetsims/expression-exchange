// Copyright 2016, University of Colorado Boulder

/**
 * possible view modes for the non-game screens
 *
 * @author John Blanco
 */
define( function() {
  'use strict';

  var ViewModeEnum = {
    COINS: 'COINS',
    VARIABLES: 'VARIABLES'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( ViewModeEnum ); }

  return ViewModeEnum;

} );