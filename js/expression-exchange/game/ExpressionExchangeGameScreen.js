// Copyright 2016, University of Colorado Boulder

/**
 * The 'Game' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ExpressionExchangeGameScreenView = require( 'EXPRESSION_EXCHANGE/expression-exchange/game/view/ExpressionExchangeGameScreenView' );
  var ExpressionExchangeGameModel = require( 'EXPRESSION_EXCHANGE/expression-exchange/game/model/ExpressionExchangeGameModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var gameString = require( 'string!EXPRESSION_EXCHANGE/game' );

  /**
   * @constructor
   */
  function ExpressionExchangeGameScreen() {

    // TODO: temporary icon, will need to be replaced
    var icon = new Rectangle( 0, 0, 548, 373, 0, 0, { fill: 'blue' } );

    Screen.call( this, gameString, icon,
      function() { return new ExpressionExchangeGameModel(); },
      function( model ) { return new ExpressionExchangeGameScreenView( model ); },
      { backgroundColor: '#CCE7FF' }
    );
  }

  return inherit( Screen, ExpressionExchangeGameScreen );
} );