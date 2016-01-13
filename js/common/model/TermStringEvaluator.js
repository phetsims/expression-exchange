// Copyright 2016, University of Colorado Boulder

/**
 * Static object used to evaluate term strings
 */
define( function( require ) {
  'use strict';

  // modules
  var ExpressionExchangeSharedConstants = require( 'EXPRESSION_EXCHANGE/common/ExpressionExchangeSharedConstants' );

  // constants
  var x = ExpressionExchangeSharedConstants.X_TERM_DEFAULT_VALUE;
  var y = ExpressionExchangeSharedConstants.X_TERM_DEFAULT_VALUE;
  var z = ExpressionExchangeSharedConstants.X_TERM_DEFAULT_VALUE;

  return {
    evaluate: function( termString ){
      debugger;
      return eval( termString );
    }
  };
} );