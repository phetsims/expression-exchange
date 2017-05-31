// Copyright 2016, University of Colorado Boulder

/**
 * allowed representations when displaying coin terms to the user
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );

  //REVIEW: Rename to AllowedRepresentation? Other enumerations are not named
  var AllowedRepresentations = {
    COINS_ONLY: 'COINS_ONLY',
    VARIABLES_ONLY: 'VARIABLES_ONLY',
    COINS_AND_VARIABLES: 'COINS_AND_VARIABLES'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( AllowedRepresentations ); }

  expressionExchange.register( 'AllowedRepresentations', AllowedRepresentations );

  return AllowedRepresentations;

} );