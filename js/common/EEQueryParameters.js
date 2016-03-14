// Copyright 2016, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  var getQueryParameter = phet.chipper.getQueryParameter;

  return {

    // Automatically answer most problems to enable faster testing of level completion.
    COLLAPSE_EXPRESSIONS: !!getQueryParameter( 'collapseExpressions' )
  };
} );
