// Copyright 2016, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );

  var EEQueryParameters = QueryStringMachine.getAll( {

    // turn on logging of coin term and expression creation and removal
    enableLogging: { type: 'flag' },

    // control whether expression width is always adjusted or whether it sometimes remains constant
    adjustExpressionWidth: { type: 'flag' }
  } );


  expressionExchange.register( 'EEQueryParameters', EEQueryParameters );

  return EEQueryParameters;
} );
