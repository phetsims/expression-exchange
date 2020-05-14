// Copyright 2016-2020, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author John Blanco
 */

import expressionExchange from '../expressionExchange.js';

const EEQueryParameters = QueryStringMachine.getAll( {

  // Controls whether expression width is always adjusted or whether it sometimes remains constant.
  // For internal use only.
  adjustExpressionWidth: { type: 'flag' },

  // Shows the reward screen every time a level is completed instead of when ALL levels are completed.
  // For internal use only.
  showRewardNodeEveryLevel: { type: 'flag' },

  // Reduces the number of game levels, useful for testing "all levels completed" behavior.
  // For internal use only.
  minimalGameLevels: { type: 'flag' }
} );

expressionExchange.register( 'EEQueryParameters', EEQueryParameters );

export default EEQueryParameters;