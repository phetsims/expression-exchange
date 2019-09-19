// Copyright 2016-2017, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );

  var EEQueryParameters = QueryStringMachine.getAll( {

    // control whether expression width is always adjusted or whether it sometimes remains constant
    adjustExpressionWidth: { type: 'flag' },

    // show the reward screen every time a level is completed instead of when ALL levels are completed
    showRewardNodeEveryLevel: { type: 'flag' },

    // reduce the number of game levels, useful for testing "all levels completed" behavior
    minimalGameLevels: { type: 'flag' }
  } );

  expressionExchange.register( 'EEQueryParameters', EEQueryParameters );

  return EEQueryParameters;
} );
