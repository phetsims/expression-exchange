// Copyright 2016, University of Colorado Boulder

/**
 * possible view modes for the coin terms
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );

  var ViewMode = {
    COINS: 'COINS',
    VARIABLES: 'VARIABLES'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( ViewMode ); }

  expressionExchange.register( 'ViewMode', ViewMode );

  return ViewMode;

} );