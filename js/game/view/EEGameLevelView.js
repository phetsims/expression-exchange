// Copyright 2016, University of Colorado Boulder

/**
 * view for a single level of the Expression Exchange game
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var BackButton = require( 'SCENERY_PHET/buttons/BackButton' );
  var CheckBox = require( 'SUN/CheckBox' );
  var CoinTermCreatorBoxFactory = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermCreatorBoxFactory' );
  var EECollectionAreaNode = require( 'EXPRESSION_EXCHANGE/game/view/EECollectionAreaNode' );
  var EEGameModel = require( 'EXPRESSION_EXCHANGE/game/model/EEGameModel' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionManipulationView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionManipulationView' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var GameAudioPlayer = require( 'VEGAS/GameAudioPlayer' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NextLevelNode = require( 'EXPRESSION_EXCHANGE/game/view/NextLevelNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var ShowSubtractionIcon = require( 'EXPRESSION_EXCHANGE/common/view/ShowSubtractionIcon' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var UndoButton = require( 'EXPRESSION_EXCHANGE/game/view/UndoButton' );

  // strings
  var levelNString = require( 'string!EXPRESSION_EXCHANGE/levelN' );

  /**
   * @param {EEGameLevelModel} levelModel
   * @param {Bounds2} screenLayoutBounds
   * @param {Property.<Bounds2>} visibleBoundsProperty
   * @param {function} nextLevelFunction
   * @param {function} returnToLevelSelectionFunction
   * @constructor
   */
  function EEGameLevelView( levelModel, screenLayoutBounds, visibleBoundsProperty, nextLevelFunction, returnToLevelSelectionFunction ) {
    var self = this;
    Node.call( this );

    // add an invisible background rectangle so that bounds are correct
    this.addChild( new Rectangle( screenLayoutBounds, {
      stroke: 'rgba( 0, 0, 200, 0.01 )' // increase opacity to make the outline visible if desired (for debugging)
    } ) );

    // add the level label
    var title = new Text( StringUtils.format( levelNString, ( levelModel.level + 1 ) ), {
      font: new PhetFont( 20 ),
      centerX: screenLayoutBounds.width * 0.4,
      top: 20
    } );
    this.addChild( title );

    // add the back button
    var backButton = new BackButton( {
      left: screenLayoutBounds.minX + 30,
      top: screenLayoutBounds.minY + 30,
      listener: returnToLevelSelectionFunction
    } );
    this.addChild( backButton );

    // add the refresh button
    var refreshButton = new RectangularPushButton( {
      content: new FontAwesomeNode( 'refresh', { scale: 0.7 } ),
      baseColor: PhetColorScheme.PHET_LOGO_YELLOW,
      xMargin: 9,
      yMargin: 7,
      listener: function() { levelModel.refresh(); },
      left: backButton.left,
      top: backButton.bottom + 8
    } );
    this.addChild( refreshButton );

    // add the coin term creator box
    var coinTermCreatorBox = null;
    levelModel.currentChallengeProperty.link( function( currentChallenge ) {
      if ( coinTermCreatorBox ) {
        self.removeChild( coinTermCreatorBox );
      }
      coinTermCreatorBox = CoinTermCreatorBoxFactory.createGameScreenCreatorBox(
        currentChallenge,
        levelModel.expressionManipulationModel,
        { centerX: title.centerX, bottom: screenLayoutBounds.bottom - 40 }
      );
      self.addChild( coinTermCreatorBox );
      coinTermCreatorBox.moveToBack(); // needs to be behind coin term and other layers
    } );

    // add the expression collection area nodes
    levelModel.collectionAreas.forEach( function( collectionArea ) {
      self.addChild( new EECollectionAreaNode( collectionArea ) );
    } );

    // add the check box that allows expressions with negative values to be simplified
    var boundsOfLowestCollectionArea = levelModel.collectionAreas[ 2 ].bounds;
    var showSubtractionCheckbox = new CheckBox(
      new ShowSubtractionIcon(),
      levelModel.expressionManipulationModel.simplifyNegativesProperty,
      {
        left: boundsOfLowestCollectionArea.minX,
        top: boundsOfLowestCollectionArea.maxY + 10,
        maxWidth: boundsOfLowestCollectionArea.minX
      }
    );
    this.addChild( showSubtractionCheckbox );

    // add the node for moving to the next level, only shown when all challenges on this level have been answered
    var nextLevelNode = new NextLevelNode( nextLevelFunction, {
      centerX: title.centerX,
      centerY: screenLayoutBounds.height * 0.33 // empirically determined
    } );
    this.addChild( nextLevelNode );
    levelModel.scoreProperty.link( function( score ) {
      nextLevelNode.visible = score === EEGameModel.MAX_SCORE_PER_LEVEL;
    } );

    // only show the checkbox for simplifying expressions with negative values if some are present in the challenge
    levelModel.currentChallengeProperty.link( function( currentChallenge ) {

      // determine whether negative values are present in this challenge
      var negativesExist = false;
      currentChallenge.carouselContents.forEach( function( carouselContent ) {
        if ( carouselContent.minimumDecomposition < 0 ) {
          negativesExist = true;
        }
      } );
      showSubtractionCheckbox.visible = negativesExist;
    } );

    // add the view area where the user will interact with coin terms and expressions
    this.addChild( new ExpressionManipulationView(
      levelModel.expressionManipulationModel,
      coinTermCreatorBox.bounds,
      visibleBoundsProperty,
      { coinTermBreakApartButtonMode: 'inverted' }
    ) );

    // add the buttons for ejecting expressions from the collection area, must be above the expressions in the z-order
    levelModel.collectionAreas.forEach( function( collectionArea ) {

      var ejectButton = new UndoButton( {
        listener: function() { collectionArea.ejectCollectedItem(); },
        left: collectionArea.bounds.minX,
        top: collectionArea.bounds.minY
      } );
      self.addChild( ejectButton );

      // control the visibility of the eject button
      collectionArea.collectedItemProperty.link( function( collectedItem ) {
        ejectButton.visible = collectedItem !== null;
      } );
    } );

    // hook up the audio player to the sound settings
    var gameAudioPlayer = new GameAudioPlayer( levelModel.soundEnabledProperty );
    levelModel.scoreProperty.link( function( newScore, oldScore ) {
      if ( newScore > oldScore ) {
        gameAudioPlayer.correctAnswer();
      }
    } );
  }

  expressionExchange.register( 'EEGameLevelView', EEGameLevelView );

  return inherit( Node, EEGameLevelView );
} );