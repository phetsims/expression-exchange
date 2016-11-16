// Copyright 2016, University of Colorado Boulder

/**
 * main view for the Expression Exchange 'Game' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var BackButton = require( 'SCENERY_PHET/buttons/BackButton' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionManipulationView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionManipulationView' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var GameAudioPlayer = require( 'VEGAS/GameAudioPlayer' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var StartGameLevelNode = require( 'EXPRESSION_EXCHANGE/game/view/StartGameLevelNode' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );

  // constants
  var GAME_VISIBLE = true; // TODO: Remove this and its usages once game is working
  var SCREEN_CHANGE_TIME = 1000; // milliseconds
  var CHALLENGES_PER_LEVEL = 3; // milliseconds

  // TODO: Temporary, remove when real icons are available
  function createIcon( color, label ) {
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

    var self = this;
    ScreenView.call( this, { layoutBounds: EESharedConstants.LAYOUT_BOUNDS } );

    if ( !GAME_VISIBLE ) {
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

    // set the bounds used to decide when coin terms need to be "pulled back"
    gameModel.coinTermRetrievalBounds = this.layoutBounds;

    // hook up the audio player to the sound settings
    this.gameAudioPlayer = new GameAudioPlayer( gameModel.soundEnabledProperty );

    // add the node that allows the user to choose a game level to play
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
        numStarsOnButtons: CHALLENGES_PER_LEVEL,
        perfectScore: gameModel.maxPossibleScore,
        numLevels: gameModel.numberOfLevels,
        numButtonRows: 2,
        controlsInset: 20,
        size: this.layoutBounds,
        centerX: this.layoutBounds.centerX
      }
    );

    this.addChild( this.startGameLevelNode );

    // define the value used to define how far the screens slide when moving in and out of view
    var slideDistance = this.layoutBounds.width * 1.25;

    // TODO: If the gamePlayNode lives on, I should consider moving it to its own class.
    // add the parent node where the game play will occur
    this.gamePlayNode = new Rectangle( 0, 0, this.layoutBounds.width, this.layoutBounds.height, {
      fill: 'rgba( 0, 0, 0, 0.01 )',
      centerX: this.layoutBounds.centerX + slideDistance, // initially out of view
      visible: false
    } );
    var backButton = new BackButton( {
      left: 20,
      top: 20,
      listener: function() {
        gameModel.returnToLevelSelectState();
      }
    } );
    this.gamePlayNode.addChild( backButton );
    var refreshButton = new RectangularPushButton( {
      content: new FontAwesomeNode( 'refresh', { scale: 0.7 } ),
      baseColor: PhetColorScheme.PHET_YELLOW,
      xMargin: 9,
      yMargin: 7,
      listener: function() {
        gameModel.refreshCurrentLevel();
      },
      left: backButton.left,
      top: backButton.bottom + 8
    } );
    this.gamePlayNode.addChild( refreshButton );
    var levelLabel = new Text( '', {
      font: new PhetFont( 20 ),
      top: 20
    } );
    this.gamePlayNode.addChild( levelLabel );
    gameModel.currentLevelProperty.link( function( currentLevel ) {
      // TODO: i18n
      levelLabel.text = 'Level ' + ( currentLevel + 1 );
      levelLabel.centerX = self.gamePlayNode.width / 2;
    } );
    this.addChild( this.gamePlayNode );

    // create the game level views and add them to the main game play node
    this.gameLevelViews = [];
    gameModel.gameLevelModels.forEach( function( levelModel ) {
      var gameLevelView = new ExpressionManipulationView( levelModel, Bounds2.EMPTY, self.visibleBoundsProperty );
      gameLevelView.visible = false; // will be made visible when the corresponding level is activated
      self.gameLevelViews.push( gameLevelView );
      self.gamePlayNode.addChild( gameLevelView );
    } );

    // set the bounds for retrieving coin terms when expressions or composite coin terms are broken up
    gameModel.setLevelModelBounds( this.layoutBounds );

    // hook up the animations for moving between level selection and game play
    gameModel.selectingLevelProperty.link( function( selectingLevel ) {
      if ( selectingLevel && self.startGameLevelNode.centerX !== self.layoutBounds.centerX ) {

        // animate the level selection node into the viewport
        new TWEEN.Tween( self.startGameLevelNode )
          .to( { centerX: self.layoutBounds.centerX }, SCREEN_CHANGE_TIME )
          .easing( TWEEN.Easing.Cubic.InOut )
          .onStart( function() { self.startGameLevelNode.visible = true; } )
          .start( phet.joist.elapsedTime );

        // animate the game play node out of the viewport
        new TWEEN.Tween( self.gamePlayNode )
          .to( { centerX: self.layoutBounds.centerX + slideDistance }, SCREEN_CHANGE_TIME )
          .easing( TWEEN.Easing.Cubic.InOut )
          .start( phet.joist.elapsedTime )
          .onComplete( function() { self.gamePlayNode.visible = false; } );
      }
      else if ( !selectingLevel && self.startGameLevelNode.centerX === self.layoutBounds.centerX ) {

        // animate the game play node into the viewport
        new TWEEN.Tween( self.gamePlayNode )
          .to( { centerX: self.layoutBounds.centerX }, SCREEN_CHANGE_TIME )
          .easing( TWEEN.Easing.Cubic.InOut )
          .onStart( function() { self.gamePlayNode.visible = true; } )
          .start( phet.joist.elapsedTime );

        // animate the level selection node out of the viewport
        new TWEEN.Tween( self.startGameLevelNode )
          .to( { centerX: self.layoutBounds.centerX - self.layoutBounds.width * 1.25 }, SCREEN_CHANGE_TIME )
          .easing( TWEEN.Easing.Cubic.InOut )
          .start( phet.joist.elapsedTime )
          .onComplete( function() { self.startGameLevelNode.visible = false; } );
      }
    } );

    gameModel.currentLevelProperty.link( function( currentLevel ) {
      // make the selected level view visible (and all others invisible)
      self.gameLevelViews.forEach( function( gameLevelView, index ) {
        gameLevelView.visible = index === currentLevel;
      } );
    } );
  }

  expressionExchange.register( 'EEGameScreenView', EEGameScreenView );

  return inherit( ScreenView, EEGameScreenView, {

    //TODO Called by the animation loop. Optional, so if your view has no animation, please delete this.
    step: function( dt ) {
      //TODO Handle view animation here.
    }
  } );
} );