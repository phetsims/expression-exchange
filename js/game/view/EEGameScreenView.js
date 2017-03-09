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
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var GameAudioPlayer = require( 'VEGAS/GameAudioPlayer' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var StartGameLevelNode = require( 'EXPRESSION_EXCHANGE/game/view/StartGameLevelNode' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
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
   * @param {EEGameLevelModel} gameModel
   * @constructor
   */
  function EEGameScreenView( gameModel ) {

    var self = this;
    ScreenView.call( this, { layoutBounds: EESharedConstants.LAYOUT_BOUNDS } );

    // set the bounds used to decide when coin terms need to be "pulled back"
    gameModel.coinTermRetrievalBounds = this.layoutBounds;

    // hook up the audio player to the sound settings
    this.gameAudioPlayer = new GameAudioPlayer( gameModel.soundEnabledProperty );

    // add the node that allows the user to choose a game level to play
    this.levelSelectionNode = new StartGameLevelNode(
      function( level ) { gameModel.selectLevel( level ); },
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

    this.addChild( this.levelSelectionNode );

    // currently displayed level node, null if none
    var currentlyShownLevelNode = null;

    // define the value used to define how far the screens slide when moving in and out of view
    var slideDistance = this.layoutBounds.width * 1.25;

    // helper function for moving to next game level
    function goToNextLevel() {
      console.log( 'goToNextLevel called' );
    }

    // helper function for returning to level selection mode
    function returnToLevelSelection() {
      gameModel.selectingLevelProperty.set( true );
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
    gameModel.setLevelModelBounds( this.layoutBounds );

    // hook up the animations for moving between level selection and game play
    Property.multilink(
      [ gameModel.selectingLevelProperty, gameModel.currentLevelProperty ],
      function( selectingLevel, currentLevel ) {
        if ( selectingLevel && self.levelSelectionNode.centerX !== self.layoutBounds.centerX ) {

          // animate the level selection node into the viewport
          new TWEEN.Tween( self.levelSelectionNode )
            .to( { centerX: self.layoutBounds.centerX }, SCREEN_CHANGE_TIME )
            .easing( TWEEN.Easing.Cubic.InOut )
            .onStart( function() { self.levelSelectionNode.visible = true; } )
            .start( phet.joist.elapsedTime );

          if ( currentlyShownLevelNode ) {
            // animate the currently visible game level node out of the viewport
            new TWEEN.Tween( currentlyShownLevelNode )
              .to( { centerX: self.layoutBounds.centerX + slideDistance }, SCREEN_CHANGE_TIME )
              .easing( TWEEN.Easing.Cubic.InOut )
              .start( phet.joist.elapsedTime )
              .onComplete( function() {
                currentlyShownLevelNode.visible = false;
                currentlyShownLevelNode = null;
              } );
          }
        }
        else if ( !selectingLevel && currentLevel >= 0 && currentlyShownLevelNode === null ) {

          // animate the game level node into the viewport
          currentlyShownLevelNode = self.gameLevelViews[ currentLevel ];
          currentlyShownLevelNode.left = self.layoutBounds.width * 1.25;
          currentlyShownLevelNode.visible = true;
          new TWEEN.Tween( currentlyShownLevelNode )
            .to( { centerX: self.layoutBounds.centerX }, SCREEN_CHANGE_TIME )
            .easing( TWEEN.Easing.Cubic.InOut )
            .start( phet.joist.elapsedTime );

          // animate the level selection node out of the viewport
          new TWEEN.Tween( self.levelSelectionNode )
            .to( { centerX: self.layoutBounds.centerX - self.layoutBounds.width * 1.25 }, SCREEN_CHANGE_TIME )
            .easing( TWEEN.Easing.Cubic.InOut )
            .start( phet.joist.elapsedTime )
            .onComplete( function() { self.levelSelectionNode.visible = false; } );
        }
      }
    );
  }

  expressionExchange.register( 'EEGameScreenView', EEGameScreenView );

  return inherit( ScreenView, EEGameScreenView, {

    //TODO Called by the animation loop. Optional, so if your view has no animation, please delete this.
    step: function( dt ) {
      //TODO Handle view animation here.
    }
  } );
} );