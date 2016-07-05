// Copyright 2016, University of Colorado Boulder

/**
 * The 'Game' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EEGameIconNode = require( 'EXPRESSION_EXCHANGE/game/view/EEGameIconNode' );
  var EEGameScreenView = require( 'EXPRESSION_EXCHANGE/game/view/EEGameScreenView' );
  var EEGameModel = require( 'EXPRESSION_EXCHANGE/game/model/EEGameModel' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var gameString = require( 'string!EXPRESSION_EXCHANGE/game' );

  /**
   * @constructor
   */
  function EEGameScreen() {

    Screen.call(
      this,
      gameString,
      new EEGameIconNode,
      function() { return new EEGameModel(); },
      function( model ) { return new EEGameScreenView( model ); },
      { backgroundColor: '#CCE7FF' }
    );
  }

  expressionExchange.register( 'EEGameScreen', EEGameScreen );

  return inherit( Screen, EEGameScreen );
} );