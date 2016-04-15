// Copyright 2016, University of Colorado Boulder

/**
 * enum that defines the different collections of coin terms that are used on the different screens
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  var CoinTermCollectionEnum = {
    BASIC: 'BASIC',
    EXPLORE: 'EXPLORE',
    ADVANCED: 'ADVANCED'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( CoinTermCollectionEnum ); }

  return CoinTermCollectionEnum;
} );