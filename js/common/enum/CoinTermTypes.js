// Copyright 2016, University of Colorado Boulder

/**
 * enum that defines the different types of coin terms
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );

  var CoinTermType = {
    X: 'X',
    Y: 'Y',
    X_TIMES_Y: 'X_TIMES_Y',
    X_SQUARED: 'X_SQUARED',
    Y_SQUARED: 'Y_SQUARED',
    X_SQUARED_TIMES_Y_SQUARED: 'X_SQUARED_TIMES_Y_SQUARED'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( CoinTermType ); }

  expressionExchange.register( 'CoinTermType', CoinTermType );

  return CoinTermType;
} );