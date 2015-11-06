// Copyright 2002-2015, University of Colorado Boulder

/**
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ExpressionExchangeModel = require( 'EXPRESSION_EXCHANGE/expression-exchange/model/ExpressionExchangeModel' );
  var ExpressionExchangeScreenView = require( 'EXPRESSION_EXCHANGE/expression-exchange/view/ExpressionExchangeScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var expressionExchangeTitleString = require( 'string!EXPRESSION_EXCHANGE/expression-exchange.title' );

  /**
   * @constructor
   */
  function ExpressionExchangeScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = null;

    Screen.call( this, expressionExchangeTitleString, icon,
      function() { return new ExpressionExchangeModel(); },
      function( model ) { return new ExpressionExchangeScreenView( model ); },
      { backgroundColor: 'white' }
    );
  }

  return inherit( Screen, ExpressionExchangeScreen );
} );