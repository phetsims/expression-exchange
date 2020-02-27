// Copyright 2016-2020, University of Colorado Boulder

/**
 * possible view modes for the coin terms
 *
 * @author John Blanco
 */

import expressionExchange from '../../expressionExchange.js';

const ViewMode = {
  COINS: 'COINS',
  VARIABLES: 'VARIABLES'
};

// verify that enum is immutable, without the runtime penalty in production code
if ( assert ) { Object.freeze( ViewMode ); }

expressionExchange.register( 'ViewMode', ViewMode );

export default ViewMode;