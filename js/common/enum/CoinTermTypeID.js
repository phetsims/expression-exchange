// Copyright 2016-2019, University of Colorado Boulder

/**
 * enum that defines the different types of coin terms
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );

  const CoinTermTypeID = {
    X: 'X',
    Y: 'Y',
    Z: 'Z',
    X_TIMES_Y: 'X_TIMES_Y',
    X_SQUARED: 'X_SQUARED',
    Y_SQUARED: 'Y_SQUARED',
    X_SQUARED_TIMES_Y_SQUARED: 'X_SQUARED_TIMES_Y_SQUARED',
    CONSTANT: 'CONSTANT'
  };

  // make the values available in an array
  CoinTermTypeID.VALUES = _.values( CoinTermTypeID );

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( CoinTermTypeID ); }

  expressionExchange.register( 'CoinTermTypeID', CoinTermTypeID );

  return CoinTermTypeID;
} );