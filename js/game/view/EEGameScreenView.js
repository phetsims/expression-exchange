// Copyright 2016, University of Colorado Boulder

/**
 * main view for the Expression Exchange 'Game' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var GameAudioPlayer = require( 'VEGAS/GameAudioPlayer' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var StartGameLevelNode = require( 'EXPRESSION_EXCHANGE/game/view/StartGameLevelNode' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var GAME_VISIBLE = false;
  
  // TODO: Temporary, remove when real icons are available
  function createIcon( color, label ){
    var background = new Rectangle( 0, 0, 40, 40, 0, 0, { fill: color, lineWidth: 1, stroke: '#555555' } );
    var labelNode = new Text( label, {
      font: new PhetFont( 22 ),
      center: background.center
    } );
    background.addChild( labelNode );
    return background;
  }

  /**
   * @param {EEGameModel} gameModel
   * @constructor
   */
  function EEGameScreenView( gameModel ) {

    ScreenView.call( this );

    if ( !GAME_VISIBLE ){
      // add a message about the game coming soon and bail out
      // TODO: This is temporary while the game is in development and should be removed when the game is live
      this.addChild( new Text( 'Game coming soon.', {
        font: new PhetFont( 60 ),
        fill: 'rgba( 50, 50, 50, 0.5 )',
        centerX: this.layoutBounds.width / 2,
        centerY: this.layoutBounds.height * 0.33
      } ) );
      return;
    }

    // Hook up the audio player to the sound settings.
    this.gameAudioPlayer = new GameAudioPlayer( gameModel.soundEnabledProperty );

    // Create a root node and send to back so that the layout bounds box can be made visible if needed.
    this.rootNode = new Node();
    this.addChild( this.rootNode );
    this.rootNode.moveToBack();

    // Add layers used to control game appearance.
    this.controlLayer = new Node();
    this.rootNode.addChild( this.controlLayer );
    this.challengeLayer = new Node();
    this.rootNode.addChild( this.challengeLayer );

    // Add the node that allows the user to choose a game level to play.
    this.startGameLevelNode = new StartGameLevelNode(
      function( level ) { gameModel.startLevel( level ); },
      function() { gameModel.reset(); },
      gameModel.timerEnabledProperty,
      gameModel.soundEnabledProperty,
      [
        createIcon( '#CB99C9', 1 ),
        createIcon( '#9acd32', 2 ),
        createIcon( '#FFB347', 3 ),
        createIcon( '#FDFD96', 4 ),
        createIcon( '#800000', 5 ),
        createIcon( '#eed5b7', 6 ),
        createIcon( '#cd5c5c', 7 ),
        createIcon( '#dda0dd', 8 )
      ],
      gameModel.bestScoreProperties,
      {
        numStarsOnButtons: gameModel.challengesPerSet,
        perfectScore: gameModel.maxPossibleScore,
        numLevels: gameModel.numberOfLevels,
        numButtonRows: 2,
        controlsInset: 20,
        size: this.layoutBounds
      }
    );
    this.rootNode.addChild( this.startGameLevelNode );
  }

  expressionExchange.register( 'EEGameScreenView', EEGameScreenView );

  return inherit( ScreenView, EEGameScreenView, {

    //TODO Called by the animation loop. Optional, so if your view has no animation, please delete this.
    step: function( dt ) {
      //TODO Handle view animation here.
    }
  } );
} );