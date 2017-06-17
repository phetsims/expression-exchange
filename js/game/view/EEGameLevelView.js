// Copyright 2016, University of Colorado Boulder

/**
 * view for a single level of the Expression Exchange game
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AllLevelsCompletedDialog = require( 'EXPRESSION_EXCHANGE/game/view/AllLevelsCompletedDialog' );
  var BackButton = require( 'SCENERY_PHET/buttons/BackButton' );
  var CheckBox = require( 'SUN/CheckBox' );
  var CoinTermCreatorBoxFactory = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermCreatorBoxFactory' );
  var CollectionAttemptResult = require( 'EXPRESSION_EXCHANGE/game/enum/CollectionAttemptResult' );
  var EEGameModel = require( 'EXPRESSION_EXCHANGE/game/model/EEGameModel' );
  var EEQueryParameters = require( 'EXPRESSION_EXCHANGE/common/EEQueryParameters' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var EERewardNode = require( 'EXPRESSION_EXCHANGE/game/view/EERewardNode' );
  var ExpressionManipulationView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionManipulationView' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NextLevelNode = require( 'EXPRESSION_EXCHANGE/game/view/NextLevelNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var ShowSubtractionIcon = require( 'EXPRESSION_EXCHANGE/common/view/ShowSubtractionIcon' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var levelNumberPatternString = require( 'string!EXPRESSION_EXCHANGE/levelNumberPattern' );

  // constants
  var BUTTON_XY_TOUCH_DILATION = 4;

  /**
   * @param {EEGameModel} gameModel - main model for the game
   * @param {EEGameLevel} levelModel - model for the level depicted by this view object
   * @param {Bounds2} screenLayoutBounds
   * @param {Property.<Bounds2>} visibleBoundsProperty
   * @param {GameAudioPlayer} gameAudioPlayer
   * @constructor
   */
  function EEGameLevelView( gameModel, levelModel, screenLayoutBounds, visibleBoundsProperty, gameAudioPlayer ) {

    var self = this;

    Node.call( this );

    // @public {Property.<boolean>} - a property that is externally set to true when this node is in the view port and
    // available for interaction with the user.  This is done in the view rather than in the model because the model has
    // no awareness of the slide in/out animations, and clocking the reward node during those animations caused
    // performance issues, and this property can be used to only clock when this is in the viewport.
    this.inViewportProperty = new Property( false );

    // add an invisible background rectangle so that bounds are correct, this is needed for animation of game level views
    var background = new Rectangle( screenLayoutBounds, {
      stroke: 'transparent' // increase opacity to make the outline visible if desired (for debugging)
    } );
    this.addChild( background );

    // layer where everything else should appear
    var middleLayer = new Node();
    this.addChild( middleLayer );

    // layer where the coin term nodes live
    var coinTermLayer = new Node();
    this.addChild( coinTermLayer );

    // set the bounds for coin term retrieval in the model
    levelModel.setRetrievalBounds( screenLayoutBounds );

    // add the level label
    var title = new Text(
      StringUtils.fillIn( levelNumberPatternString, { levelNumber: ( levelModel.levelNumber + 1 ) } ),
      {
        font: new PhetFont( 20 ),
        centerX: screenLayoutBounds.width * 0.4,
        top: 20
      }
    );
    middleLayer.addChild( title );

    // add the back button
    var backButton = new BackButton( {
      left: screenLayoutBounds.left + 30,
      top: screenLayoutBounds.top + 30,
      listener: gameModel.returnToLevelSelection.bind( gameModel ),
      touchAreaXDilation: BUTTON_XY_TOUCH_DILATION,
      touchAreaYDilation: BUTTON_XY_TOUCH_DILATION
    } );
    middleLayer.addChild( backButton );

    // add the refresh button
    var refreshButton = new RectangularPushButton( {
      content: new FontAwesomeNode( 'refresh', { scale: 0.7 } ),
      baseColor: PhetColorScheme.PHET_LOGO_YELLOW,
      xMargin: 9,
      yMargin: 7,
      listener: function() { levelModel.refresh(); },
      left: backButton.left,
      top: backButton.bottom + 8,
      touchAreaXDilation: BUTTON_XY_TOUCH_DILATION,
      touchAreaYDilation: BUTTON_XY_TOUCH_DILATION
    } );
    middleLayer.addChild( refreshButton );

    // create the expression manipulation view
    var expressionManipulationView = new ExpressionManipulationView(
      levelModel,
      visibleBoundsProperty,
      { coinTermBreakApartButtonMode: 'inverted' }
    );
    coinTermLayer.addChild( expressionManipulationView );

    // add the coin term creator box
    var coinTermCreatorBox = null;
    levelModel.currentChallengeProperty.link( function( currentChallenge ) {
      if ( coinTermCreatorBox ) {
        middleLayer.removeChild( coinTermCreatorBox );
        coinTermCreatorBox.dispose();
      }
      coinTermCreatorBox = CoinTermCreatorBoxFactory.createGameScreenCreatorBox(
        currentChallenge,
        levelModel,
        expressionManipulationView,
        { centerX: title.centerX, bottom: screenLayoutBounds.bottom - 40 }
      );
      middleLayer.addChild( coinTermCreatorBox );

      // let the model know where the creator box is so that it knows when the user returns coin terms
      levelModel.creatorBoxBounds = coinTermCreatorBox.bounds;
    } );

    // add the check box that allows expressions with negative values to be simplified
    var boundsOfLowestCollectionArea = _.last( levelModel.collectionAreas ).bounds;
    var showSubtractionCheckbox = new CheckBox(
      new ShowSubtractionIcon(),
      levelModel.simplifyNegativesProperty,
      {
        left: boundsOfLowestCollectionArea.left,
        top: boundsOfLowestCollectionArea.bottom + 20,
        maxWidth: boundsOfLowestCollectionArea.minX
      }
    );
    middleLayer.addChild( showSubtractionCheckbox );

    // add the node for moving to the next level, only shown when all challenges on this level have been answered
    this.nextLevelNode = new NextLevelNode( gameModel.nextLevel.bind( gameModel ), {
      centerX: title.centerX,
      centerY: screenLayoutBounds.height * 0.33 // empirically determined
    } );
    middleLayer.addChild( this.nextLevelNode );

    this.allLevelsCompletedDialog = new AllLevelsCompletedDialog( gameModel.returnToLevelSelection.bind( gameModel ), {
      centerX: title.centerX,
      centerY: screenLayoutBounds.height * 0.4 // empirically determined
    } );
    middleLayer.addChild( this.allLevelsCompletedDialog );

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

    // show the appropriate dialog and reward node based on the score
    levelModel.scoreProperty.link( function( score ) {

      if ( score === EEGameModel.MAX_SCORE_PER_LEVEL ) {

        var allLevelsCompleted = gameModel.getAllLevelsCompleted();

        // show the appropriate dialog
        if ( allLevelsCompleted ) {
          self.allLevelsCompletedDialog.visible = true;

          // clear the flags for all levels completed so that the user will have to complete them again in order to
          // see this dialog
          gameModel.clearAllLevelsCompleted();
        }
        else {
          self.nextLevelNode.visible = true;
        }

        // show the reward node if warranted - this is created lazily to save time on startup and memory
        if ( allLevelsCompleted || EEQueryParameters.showRewardNodeEveryLevel ) {
          if ( !self.rewardNode ) {
            self.rewardNode = new EERewardNode();
            background.addChild( self.rewardNode );
          }
          self.rewardNode.visible = true;
        }
      }
      else {
        self.nextLevelNode.visible = false;
        self.allLevelsCompletedDialog.visible = false;
        if ( self.rewardNode ) {
          self.rewardNode.visible = false;
        }
      }
    } );

    // hook up listeners to the collection areas to play the appropriate sounds upon collection or rejection of a user-
    // submitted answer
    levelModel.collectionAreas.forEach( function( collectionArea ) {
      collectionArea.itemEvaluatedEmitter.addListener( function( collectionAttemptResult ) {
        if ( collectionAttemptResult === CollectionAttemptResult.COLLECTED ) {
          gameAudioPlayer.correctAnswer();
        }
        else if ( collectionAttemptResult === CollectionAttemptResult.REJECTED_AS_INCORRECT ) {
          gameAudioPlayer.wrongAnswer();
        }
      } );
    } );
  }

  expressionExchange.register( 'EEGameLevelView', EEGameLevelView );

  return inherit( Node, EEGameLevelView, {

    /**
     * @param {number} dt
     * @public
     */
    step: function( dt ) {
      if ( this.inViewportProperty.get() && this.rewardNode && this.rewardNode.visible ) {
        this.rewardNode.step( Math.min( dt, 1 ) );
      }
    }

  } );
} );