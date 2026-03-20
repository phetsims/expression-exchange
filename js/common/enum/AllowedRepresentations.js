// Copyright 2016-2026, University of Colorado Boulder

/**
 * allowed representations when displaying coin terms to the user
 *
 * @author John Blanco
 */

const AllowedRepresentations = {
  COINS_ONLY: 'COINS_ONLY',
  VARIABLES_ONLY: 'VARIABLES_ONLY',
  COINS_AND_VARIABLES: 'COINS_AND_VARIABLES'
};

// verify that enum is immutable, without the runtime penalty in production code
if ( assert ) { Object.freeze( AllowedRepresentations ); }

export default AllowedRepresentations;
