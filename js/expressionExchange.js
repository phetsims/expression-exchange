// Copyright 2016, University of Colorado Boulder

/**
 * Creates the namespace for this simulation.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Namespace = require( 'PHET_CORE/Namespace' );

  var expressionExchange = new Namespace( 'expressionExchange' );

  // add support for logging
  if ( phet.chipper.getQueryParameter( 'log' ) ) {
    console.log( 'enabling log' );
    expressionExchange.log = function( message ) {
      console.log( '%clog: ' + message, 'color: #009900' ); // green
    };
  }
  else{
    expressionExchange.log = function(){};
  }

  return expressionExchange;
} );