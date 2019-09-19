// Copyright 2015-2019, University of Colorado Boulder

/**
 * main view for the Expression Exchange 'Game' screen
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const Animation = require( 'TWIXT/Animation' );
  const Easing = require( 'TWIXT/Easing' );
  const EEGameLevelIconFactory = require( 'EXPRESSION_EXCHANGE/game/view/EEGameLevelIconFactory' );
  const EEGameLevelView = require( 'EXPRESSION_EXCHANGE/game/view/EEGameLevelView' );
  const EEGameModel = require( 'EXPRESSION_EXCHANGE/game/model/EEGameModel' );
  const EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const GameAudioPlayer = require( 'VEGAS/GameAudioPlayer' );
  const inherit = require( 'PHET_CORE/inherit' );
  const LevelSelectionNode = require( 'EXPRESSION_EXCHANGE/game/view/LevelSelectionNode' );
  const ScreenView = require( 'JOIST/ScreenView' );

  // constants
  const SCREEN_CHANGE_TIME = 1; // seconds

  /**
   * @param {EEGameLevel} gameModel
   * @constructor
   */
  function EEGameScreenView( gameModel ) {

    const self = this;
    ScreenView.call( this, { layoutBounds: EESharedConstants.LAYOUT_BOUNDS } );

    // @private {EEGameModel}
    this.gameModel = gameModel;

    // create the sound player for the game sounds
    const gameAudioPlayer = new GameAudioPlayer();

    // consolidate the level scores into an array for the level selection node
    const levelScoreProperties = [];
    gameModel.gameLevels.forEach( function( gameLevelModel ) {
      levelScoreProperties.push( gameLevelModel.scoreProperty );
    } );

    // create the icons used on the level selection buttons
    const levelSelectionItemNodeIcons = [];
    _.times( EEGameModel.NUMBER_OF_LEVELS, function( level ) {
      levelSelectionItemNodeIcons.push( EEGameLevelIconFactory.createIcon( level ) );
    } );

    // add the node that allows the user to choose a game level to play
    const levelSelectionNode = new LevelSelectionNode(
      function( level ) { gameModel.selectLevel( level ); },
      function() { gameModel.reset(); },
      levelSelectionItemNodeIcons,
      levelScoreProperties,
      {
        layoutBoundsProperty: this.visibleBoundsProperty,
        centerX: this.layoutBounds.centerX
      }
    );

    this.addChild( levelSelectionNode );

    // currently displayed level or level selection node
    let nodeInViewport = levelSelectionNode;

    // create the game level views and add them to the main game play node
    this.gameLevelViews = [];
    gameModel.gameLevels.forEach( function( levelModel ) {
      const gameLevelView = new EEGameLevelView(
        gameModel,
        levelModel,
        self.layoutBounds,
        self.visibleBoundsProperty,
        gameAudioPlayer
      );
      gameLevelView.visible = false; // will be made visible when the corresponding level is activated
      self.gameLevelViews.push( gameLevelView );
      self.addChild( gameLevelView );
    } );

    // hook up the animations for moving between level selection and game play
    gameModel.currentLevelProperty.lazyLink( function( newLevel, oldLevel ) {

      const slideDistance = self.visibleBoundsProperty.get().width;
      const incomingViewNode = newLevel === null ? levelSelectionNode : self.gameLevelViews[ newLevel.levelNumber ];
      const outgoingViewNode = oldLevel === null ? levelSelectionNode : self.gameLevelViews[ oldLevel.levelNumber ];
      let outgoingNodeDestinationX;
      let incomingNodeStartX;

      // prevent interaction during animation
      incomingViewNode.pickable = false;
      outgoingViewNode.pickable = false;

      // determine how the incoming and outgoing nodes should move
      if ( newLevel === null ) {

        // level selection screen is coming in, which is a left-to-right motion
        incomingNodeStartX = self.layoutBounds.minX - slideDistance;
        outgoingNodeDestinationX = self.layoutBounds.minX + slideDistance;
      }
      else {

        // a game level node is coming in, which is a right-to-left motion
        incomingNodeStartX = self.layoutBounds.minX + slideDistance;
        outgoingNodeDestinationX = self.layoutBounds.minX - slideDistance;
      }

      // move out the old node
      const moveOutAnimation = new Animation( {
        duration: SCREEN_CHANGE_TIME,
        easing: Easing.CUBIC_IN_OUT,
        setValue: function( newXPosition ) {
          nodeInViewport.x = newXPosition;
        },
        from: nodeInViewport.x,
        to: outgoingNodeDestinationX
      } );
      moveOutAnimation.beginEmitter.addListener( function() {
        outgoingViewNode.inViewportProperty && outgoingViewNode.inViewportProperty.set( false );
      } );
      moveOutAnimation.finishEmitter.addListener( function() {
        outgoingViewNode.visible = false;
      } );
      moveOutAnimation.start();

      // move in the new node
      const moveInAnimation = new Animation( {
        duration: SCREEN_CHANGE_TIME,
        easing: Easing.CUBIC_IN_OUT,
        setValue: function( newXPosition ) {
          incomingViewNode.x = newXPosition;
        },
        from: incomingNodeStartX,
        to: self.layoutBounds.minX
      } );
      moveInAnimation.beginEmitter.addListener( function() {
        incomingViewNode.visible = true;
      } );
      moveInAnimation.finishEmitter.addListener( function() {
        nodeInViewport = incomingViewNode;
        nodeInViewport.pickable = true;
        nodeInViewport.inViewportProperty && nodeInViewport.inViewportProperty.set( true );
      } );
      moveInAnimation.start();
    } );
  }

  expressionExchange.register( 'EEGameScreenView', EEGameScreenView );

  return inherit( ScreenView, EEGameScreenView, {

    /**
     * step the view, needed for animations
     * @param {number} dt
     * @public
     */
    step: function( dt ) {
      const currentLevel = this.gameModel.currentLevelProperty.get();
      if ( currentLevel !== null ) {
        this.gameLevelViews[ currentLevel.levelNumber ].step( dt );
      }
    }

  } );
} );