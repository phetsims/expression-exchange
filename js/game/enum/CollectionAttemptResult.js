// Copyright 2017, University of Colorado Boulder

/**
 * possible results from an attempt to collect a coin term or expression in a collection area
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );

  var CollectionAttemptResult = {

    // the item matched the expression specification and was collected
    COLLECTED: 'COLLECTED',

    // the item did not match the expression specification and was rejected
    REJECTED_AS_INCORRECT: 'REJECTED_AS_INCORRECT',

    // the item matched the expression specification, but the collection area is already full
    REJECTED_DUE_TO_FULL_COLLECTION_AREA: 'REJECTED_DUE_TO_FULL_COLLECTION_AREA'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( CollectionAttemptResult ); }

  expressionExchange.register( 'CollectionAttemptResult', CollectionAttemptResult );

  return CollectionAttemptResult;

} );