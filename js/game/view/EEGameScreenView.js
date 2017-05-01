// Copyright 2016, University of Colorado Boulder

/**
 * main view for the Expression Exchange 'Game' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EEGameLevelView = require( 'EXPRESSION_EXCHANGE/game/view/EEGameLevelView' );
  var EEGameModel = require( 'EXPRESSION_EXCHANGE/game/model/EEGameModel' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var GameAudioPlayer = require( 'VEGAS/GameAudioPlayer' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var StartGameLevelNode = require( 'EXPRESSION_EXCHANGE/game/view/StartGameLevelNode' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var SCREEN_CHANGE_TIME = 1000; // milliseconds

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
   * @param {EEGameLevelModel} gameModel
   * @constructor
   */
  function EEGameScreenView( gameModel ) {

    var self = this;
    this.gameModel = gameModel;
    ScreenView.call( this, { layoutBounds: EESharedConstants.LAYOUT_BOUNDS } );

    // hook up the audio player to the sound settings
    this.gameAudioPlayer = new GameAudioPlayer( gameModel.soundEnabledProperty );

    // add the node that allows the user to choose a game level to play
    this.levelSelectionNode = new StartGameLevelNode(
      function( level ) { gameModel.selectLevel( level ); },
      function() { gameModel.reset(); },
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
      gameModel.levelScoreProperties,
      {
        numStarsOnButtons: EEGameModel.CHALLENGES_PER_LEVEL,
        perfectScore: EEGameModel.MAX_SCORE_PER_LEVEL,
        numLevels: EEGameModel.NUMBER_OF_LEVELS,
        numButtonRows: 2,
        controlsInset: 10,
        size: this.layoutBounds,
        centerX: this.layoutBounds.centerX
      }
    );

    this.addChild( this.levelSelectionNode );

    // currently displayed level or level selection node
    var nodeInViewport = this.levelSelectionNode;

    // define the value used to define how far the screens slide when moving in and out of view
    var slideDistance = this.layoutBounds.width * 1.25;

    // helper function for moving to next game level
    function goToNextLevel() {
      if ( gameModel.currentLevelProperty.get() < EEGameModel.NUMBER_OF_LEVELS - 1 ) {
        gameModel.currentLevelProperty.set( gameModel.currentLevelProperty.get() + 1 );
      }
      else {
        gameModel.returnToLevelSelection();
      }
    }

    // helper function for returning to level selection mode
    function returnToLevelSelection() {
      gameModel.returnToLevelSelection();
    }

    // create the game level views and add them to the main game play node
    this.gameLevelViews = [];
    gameModel.gameLevelModels.forEach( function( levelModel ) {
      var gameLevelView = new EEGameLevelView(
        levelModel,
        self.layoutBounds,
        self.visibleBoundsProperty,
        goToNextLevel,
        returnToLevelSelection
      );
      gameLevelView.visible = false; // will be made visible when the corresponding level is activated
      self.gameLevelViews.push( gameLevelView );
      self.addChild( gameLevelView );
    } );

    // set the bounds for retrieving coin terms when expressions or composite coin terms are broken up
    gameModel.setCoinTermRetrievalBounds( this.layoutBounds );

    // hook up the animations for moving between level selection and game play
    gameModel.currentLevelProperty.lazyLink( function( newLevel ) {

      var incomingViewNode;
      var outgoingNodeDestinationX;
      var incomingNodeStartX;

      if ( newLevel === null ) {

        // level selection screen is coming in, which is a left-to-right motion
        incomingViewNode = self.levelSelectionNode;
        incomingNodeStartX = self.layoutBounds.minX - slideDistance;
        outgoingNodeDestinationX = self.layoutBounds.minX + slideDistance;
      }
      else {

        // a game level node is coming in, which is a right-to-left motion
        incomingViewNode = self.gameLevelViews[ newLevel ];
        incomingNodeStartX = self.layoutBounds.minX + slideDistance;
        outgoingNodeDestinationX = self.layoutBounds.minX - slideDistance;
      }

      // prevent any interaction with the 'next level' dialogs while the animations are in progress
      self.gameLevelViews.forEach( function( gameLevelView ) {
        gameLevelView.setNextLevelNodePickable( false );
      } );

      // move out the old node
      new TWEEN.Tween( { x: nodeInViewport.x } )
        .to( { x: outgoingNodeDestinationX }, SCREEN_CHANGE_TIME )
        .easing( TWEEN.Easing.Cubic.InOut )
        .start( phet.joist.elapsedTime )
        .onUpdate( function() { nodeInViewport.x = this.x; } )
        .onComplete( function() {
          nodeInViewport.visible = false;
          nodeInViewport = null;
        } );

      // move in the new node
      incomingViewNode.x = incomingNodeStartX;
      incomingViewNode.visible = true;
      new TWEEN.Tween( { x: incomingViewNode.x } )
        .to( { x: self.layoutBounds.minX }, SCREEN_CHANGE_TIME )
        .easing( TWEEN.Easing.Cubic.InOut )
        .start( phet.joist.elapsedTime )
        .onUpdate( function() { incomingViewNode.x = this.x; } )
        .onComplete( function() {
          nodeInViewport = incomingViewNode;
          if ( newLevel !== null ) {
            self.gameLevelViews[ newLevel ].setNextLevelNodePickable( true );
          }
        } );
    } );
  }

  expressionExchange.register( 'EEGameScreenView', EEGameScreenView );

  return inherit( ScreenView, EEGameScreenView, {

    // @public
    step: function( dt ) {
      var currentLevelNumber = this.gameModel.currentLevelProperty.get();
      if ( currentLevelNumber !== null ) {
        this.gameLevelViews[ currentLevelNumber ].step( dt );
      }
    }

  } );
} );