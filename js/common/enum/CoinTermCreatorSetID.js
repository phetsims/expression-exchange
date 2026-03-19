// Copyright 2016-2020, University of Colorado Boulder

/**
 * enum that defines the coin term collections that are used on the explore screens
 *
 * @author John Blanco
 */

const CoinTermCreatorSetID = {
  BASICS: 'BASICS',
  EXPLORE: 'EXPLORE',
  VARIABLES: 'VARIABLES'
};

// verify that enum is immutable, without the runtime penalty in production code
if ( assert ) { Object.freeze( CoinTermCreatorSetID ); }

export default CoinTermCreatorSetID;
