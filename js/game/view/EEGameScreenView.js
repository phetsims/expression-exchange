// Copyright 2016, University of Colorado Boulder

/**
 * main view for the Expression Exchange 'Game' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EEGameLevelIconFactory = require( 'EXPRESSION_EXCHANGE/game/view/EEGameLevelIconFactory' );
  var EEGameLevelView = require( 'EXPRESSION_EXCHANGE/game/view/EEGameLevelView' );
  var EEGameModel = require( 'EXPRESSION_EXCHANGE/game/model/EEGameModel' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var GameAudioPlayer = require( 'VEGAS/GameAudioPlayer' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var StartGameLevelNode = require( 'EXPRESSION_EXCHANGE/game/view/StartGameLevelNode' );

  // constants
  var SCREEN_CHANGE_TIME = 1000; // milliseconds

  /**
   * @param {EEGameLevelModel} gameModel
   * @constructor
   */
  function EEGameScreenView( gameModel ) {

    var self = this;
    //REVIEW: visibility and type docs
    this.gameModel = gameModel;
    ScreenView.call( this, { layoutBounds: EESharedConstants.LAYOUT_BOUNDS } );

    // hook up the audio player to the sound settings
    //REVIEW: visibility docs
    //REVIEW: Wait, this isn't used? EEGameLevelView uses a different instance of GameAudioPlayer?
    this.gameAudioPlayer = new GameAudioPlayer( gameModel.soundEnabledProperty );

    // consolidate the level scores into an array for the level selection node
    //REVIEW: just pass in the levels themselves, this is unnecessary
    var levelScoreProperties = [];
    gameModel.gameLevelModels.forEach( function( gameLevelModel ) {
      levelScoreProperties.push( gameLevelModel.scoreProperty );
    } );

    // create the icons used on the level selection buttons
    //REVIEW: just pass in the levels themselves, this is unnecessary
    var levelSelectionButtonIcons = [];
    _.times( EEGameModel.NUMBER_OF_LEVELS, function( level ) {
      levelSelectionButtonIcons.push( EEGameLevelIconFactory.createIcon( level ) );
    } );

    // add the node that allows the user to choose a game level to play
    //REVIEW: Heavily prefer passing in the level models directly
    //REVIEW: Then you don't need to SEPARATE out the functions, icons and scores, and then combine them in the other type.
    //REVIEW: Name change to LevelSelectionNode might be clearer here as a type?
    //REVIEW: type/visibility docs
    this.levelSelectionNode = new StartGameLevelNode(
      function( level ) { gameModel.selectLevel( level ); },
      function() { gameModel.reset(); },
      gameModel.soundEnabledProperty,
      levelSelectionButtonIcons,
      levelScoreProperties,
      {
        //REVIEW: Almost all of these should be inlined in StartGameLevelNode, and not specified here.
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
    //REVIEW: This looks like a function that should belong on the game model itself?
    function goToNextLevel() {
      if ( gameModel.currentLevelProperty.get() < EEGameModel.NUMBER_OF_LEVELS - 1 ) {
        gameModel.currentLevelProperty.set( gameModel.currentLevelProperty.get() + 1 );
      }
      else {
        gameModel.returnToLevelSelection();
      }
    }

    // helper function for returning to level selection mode
    //REVIEW: Just use gameModel.returnToLevelSelection.bind( gameModel )
    function returnToLevelSelection() {
      gameModel.returnToLevelSelection();
    }

    // create the game level views and add them to the main game play node
    this.gameLevelViews = [];
    //REVIEW: a map() would work better instead of having to push? Just addChild inside it?
    gameModel.gameLevelModels.forEach( function( levelModel ) {
      var gameLevelView = new EEGameLevelView(
        levelModel,
        self.layoutBounds,
        self.visibleBoundsProperty,
        goToNextLevel,
        gameModel.allLevelsCompletedProperty,
        returnToLevelSelection
      );
      gameLevelView.visible = false; // will be made visible when the corresponding level is activated
      self.gameLevelViews.push( gameLevelView );
      self.addChild( gameLevelView );
    } );

    // set the bounds for retrieving coin terms when expressions or composite coin terms are broken up
    //REVIEW: This is done right after creating the views for each level. Can we just pass it as part of the view
    // construction?
    gameModel.setCoinTermRetrievalBounds( this.layoutBounds );

    // hook up the animations for moving between level selection and game play
    gameModel.currentLevelProperty.lazyLink( function( newLevel, oldLevel ) {

      //REVIEW: If currentLevelProperty is changed to point to EEGameLevelModels (renamed EEGameLevel), this isn't needed.
      var incomingViewNode = newLevel === null ? self.levelSelectionNode : self.gameLevelViews[ newLevel ];
      var outgoingViewNode = oldLevel === null ? self.levelSelectionNode : self.gameLevelViews[ oldLevel ];
      var outgoingNodeDestinationX;
      var incomingNodeStartX;

      if ( newLevel === null ) {

        //REVIEW: See make-a-ten's SlidingScreen. Can that be used as an abstraction for this?
        // level selection screen is coming in, which is a left-to-right motion
        incomingNodeStartX = self.layoutBounds.minX - slideDistance;
        outgoingNodeDestinationX = self.layoutBounds.minX + slideDistance;
      }
      else {

        // a game level node is coming in, which is a right-to-left motion
        incomingNodeStartX = self.layoutBounds.minX + slideDistance;
        outgoingNodeDestinationX = self.layoutBounds.minX - slideDistance;
      }

      // prevent any interaction with the 'next level' dialogs while the animations are in progress
      self.gameLevelViews.forEach( function( gameLevelView ) {
        gameLevelView.setNextLevelNodePickable( false );
      } );

      // move out the old node
      //REVIEW: See make-a-ten's SlidingScreen. Can that be used as an abstraction for this? Doesn't use TWEEN
      new TWEEN.Tween( { x: nodeInViewport.x } )
        .to( { x: outgoingNodeDestinationX }, SCREEN_CHANGE_TIME )
        .easing( TWEEN.Easing.Cubic.InOut )
        .start( phet.joist.elapsedTime )
        .onStart( function() {
          outgoingViewNode.inViewportProperty && outgoingViewNode.inViewportProperty.set( false );
        } )
        .onUpdate( function() { nodeInViewport.x = this.x; } )
        .onComplete( function() {
          nodeInViewport.visible = false;
          nodeInViewport = null;
        } );

      // move in the new node
      //REVIEW: See make-a-ten's SlidingScreen. Can that be used as an abstraction for this? Doesn't use TWEEN
      incomingViewNode.x = incomingNodeStartX;
      incomingViewNode.visible = true;
      new TWEEN.Tween( { x: incomingViewNode.x } )
        .to( { x: self.layoutBounds.minX }, SCREEN_CHANGE_TIME )
        .easing( TWEEN.Easing.Cubic.InOut )
        .start( phet.joist.elapsedTime )
        .onUpdate( function() { incomingViewNode.x = this.x; } )
        .onComplete( function() {
          nodeInViewport = incomingViewNode;
          nodeInViewport.setNextLevelNodePickable && nodeInViewport.setNextLevelNodePickable( true );
          nodeInViewport.inViewportProperty && nodeInViewport.inViewportProperty.set( true );
        } );
    } );
  }

  expressionExchange.register( 'EEGameScreenView', EEGameScreenView );

  return inherit( ScreenView, EEGameScreenView, {

    // @public
    //REVIEW: docs
    step: function( dt ) {
      var currentLevelNumber = this.gameModel.currentLevelProperty.get();
      if ( currentLevelNumber !== null ) {
        this.gameLevelViews[ currentLevelNumber ].step( dt );
      }
    }

  } );
} );