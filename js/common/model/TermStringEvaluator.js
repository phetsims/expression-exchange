// Copyright 2016, University of Colorado Boulder

/**
 * static object used to evaluate term strings
 */
define( function( require ) {
  'use strict';

  // modules
  var ExpressionExchangeSharedConstants = require( 'EXPRESSION_EXCHANGE/common/ExpressionExchangeSharedConstants' );

  // constants
  /*eslint-disable */
  var x = ExpressionExchangeSharedConstants.X_TERM_DEFAULT_VALUE;
  var y = ExpressionExchangeSharedConstants.Y_TERM_DEFAULT_VALUE;
  var z = ExpressionExchangeSharedConstants.Z_TERM_DEFAULT_VALUE;
  /*eslint-ensable */

  return {
    evaluate: function( termString ){
      var myTermString = termString;
      // TODO: This is a very non-robust workaround for JavaScripts lack of an expoenent operator, and should be replaced ASAP
      if ( termString.indexOf( '^' ) === 1 ){
        myTermString = 'Math.pow(' + termString.charAt(0) + ',' + termString.charAt( 2 ) + ')';
      }
      return eval( myTermString );
    }
  };
} );