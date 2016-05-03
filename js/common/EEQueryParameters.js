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

  var getQueryParameter = phet.chipper.getQueryParameter;

  var EEQueryParameters = {

    // Automatically answer most problems to enable faster testing of level completion.
    ADJUST_EXPRESSION_WIDTH: !!getQueryParameter( 'adjustExpressionWidth' )
  };

  expressionExchange.register( 'EEQueryParameters', EEQueryParameters );

  return EEQueryParameters;
} );
