// Copyright 2016-2017, University of Colorado Boulder

/**
 * The 'Game' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const EEGameIconNode = require( 'EXPRESSION_EXCHANGE/game/view/EEGameIconNode' );
  const EEGameModel = require( 'EXPRESSION_EXCHANGE/game/model/EEGameModel' );
  const EEGameScreenView = require( 'EXPRESSION_EXCHANGE/game/view/EEGameScreenView' );
  const EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Property = require( 'AXON/Property' );
  const Screen = require( 'JOIST/Screen' );

  // strings
  const gameString = require( 'string!EXPRESSION_EXCHANGE/game' );

  /**
   * @constructor
   */
  function EEGameScreen() {

    const options = {
      name: gameString,
      backgroundColorProperty: new Property( EESharedConstants.GAME_SCREEN_BACKGROUND_COLOR ),
      homeScreenIcon: new EEGameIconNode()
    };

    Screen.call( this,
      function() { return new EEGameModel(); },
      function( model ) { return new EEGameScreenView( model ); },
      options
    );
  }

  expressionExchange.register( 'EEGameScreen', EEGameScreen );

  return inherit( Screen, EEGameScreen );
} );
