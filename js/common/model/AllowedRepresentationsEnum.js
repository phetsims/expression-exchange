// Copyright 2016, University of Colorado Boulder

/**
 * allowed representations when displaying coin terms to the user
 *
 * @author John Blanco
 */
define( function() {
  'use strict';

  var AllowedRepresentationsEnum = {
    COINS_ONLY: 'COINS_ONLY',
    VARIABLES_ONLY: 'VARIABLES_ONLY',
    COINS_AND_VARIABLES: 'COINS_AND_VARIABLES'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( AllowedRepresentationsEnum ); }

  return AllowedRepresentationsEnum;

} );