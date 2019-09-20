// Copyright 2016-2019, University of Colorado Boulder

/**
 * possible view modes for the coin terms
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );

  const ViewMode = {
    COINS: 'COINS',
    VARIABLES: 'VARIABLES'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( ViewMode ); }

  expressionExchange.register( 'ViewMode', ViewMode );

  return ViewMode;

} );