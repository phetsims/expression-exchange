// Copyright 2016-2017, University of Colorado Boulder

/**
 * enum that defines the coin term collections that are used on the explore screens
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );

  var CoinTermCreatorSetID = {
    BASICS: 'BASICS',
    EXPLORE: 'EXPLORE',
    VARIABLES: 'VARIABLES'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( CoinTermCreatorSetID ); }

  expressionExchange.register( 'CoinTermCreatorSetID', CoinTermCreatorSetID );

  return CoinTermCreatorSetID;
} );