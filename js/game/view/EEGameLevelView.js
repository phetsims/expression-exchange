// Copyright 2016-2022, University of Colorado Boulder

/**
 * view for a single level of the Expression Exchange game
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import BackButton from '../../../../scenery-phet/js/buttons/BackButton.js';
import RefreshButton from '../../../../scenery-phet/js/buttons/RefreshButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import AllLevelsCompletedNode from '../../../../vegas/js/AllLevelsCompletedNode.js';
import EEQueryParameters from '../../common/EEQueryParameters.js';
import CoinTermCreatorBoxFactory from '../../common/view/CoinTermCreatorBoxFactory.js';
import ExpressionManipulationView from '../../common/view/ExpressionManipulationView.js';
import ShowSubtractionIcon from '../../common/view/ShowSubtractionIcon.js';
import expressionExchange from '../../expressionExchange.js';
import ExpressionExchangeStrings from '../../ExpressionExchangeStrings.js';
import EERewardNode from './EERewardNode.js';
import NextLevelNode from './NextLevelNode.js';

const levelNumberPatternString = ExpressionExchangeStrings.levelNumberPattern;

// constants
const BUTTON_XY_TOUCH_DILATION = 4;

class EEGameLevelView extends Node {

  /**
   * @param {EEGameModel} gameModel - main model for the game
   * @param {EEGameLevel} levelModel - model for the level depicted by this view object
   * @param {Bounds2} screenLayoutBounds
   * @param {Property.<Bounds2>} visibleBoundsProperty
   * @param {GameAudioPlayer} gameAudioPlayer
   */
  constructor( gameModel, levelModel, screenLayoutBounds, visibleBoundsProperty, gameAudioPlayer ) {

    super();

    // @public {Property.<boolean>} - a property that is externally set to true when this node is in the view port and
    // available for interaction with the user.  This is done in the view rather than in the model because the model has
    // no awareness of the slide in/out animations, and clocking the reward node during those animations caused
    // performance issues, and this property can be used to only clock when this is in the viewport.
    this.inViewportProperty = new Property( false );

    // add an invisible background rectangle so that bounds are correct, this is needed for animation of game level views
    const background = new Rectangle( screenLayoutBounds, {
      stroke: 'transparent' // increase opacity to make the outline visible if desired (for debugging)
    } );
    this.addChild( background );

    // layer where everything else should appear
    const middleLayer = new Node();
    this.addChild( middleLayer );

    // layer where the coin term nodes live
    const coinTermLayer = new Node();
    this.addChild( coinTermLayer );

    // layer where the dialog-ish nodes are shown
    const notificationsLayer = new Node();
    this.addChild( notificationsLayer );

    // set the bounds for coin term retrieval in the model
    levelModel.setRetrievalBounds( screenLayoutBounds );

    // add the level label
    const title = new Text(
      StringUtils.fillIn( levelNumberPatternString, { levelNumber: ( levelModel.levelNumber + 1 ) } ),
      {
        font: new PhetFont( 20 ),
        centerX: screenLayoutBounds.width * 0.4,
        top: 20
      }
    );
    middleLayer.addChild( title );

    // add the back button
    const backButton = new BackButton( {
      left: screenLayoutBounds.left + 30,
      top: screenLayoutBounds.top + 30,
      listener: gameModel.returnToLevelSelection.bind( gameModel ),
      touchAreaXDilation: BUTTON_XY_TOUCH_DILATION,
      touchAreaYDilation: BUTTON_XY_TOUCH_DILATION
    } );
    middleLayer.addChild( backButton );

    // add the refresh button
    const refreshButton = new RefreshButton( {
      iconHeight: 27,
      xMargin: 9,
      yMargin: 7,
      listener: () => { levelModel.refresh(); },
      left: backButton.left,
      top: backButton.bottom + 8,
      touchAreaXDilation: BUTTON_XY_TOUCH_DILATION,
      touchAreaYDilation: BUTTON_XY_TOUCH_DILATION
    } );
    middleLayer.addChild( refreshButton );

    // create the expression manipulation view
    const expressionManipulationView = new ExpressionManipulationView(
      levelModel,
      visibleBoundsProperty,
      { coinTermBreakApartButtonMode: 'inverted' }
    );
    coinTermLayer.addChild( expressionManipulationView );

    // add the coin term creator box
    let coinTermCreatorBox = null;
    levelModel.currentChallengeProperty.link( currentChallenge => {
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

    // add the checkbox that allows expressions with negative values to be simplified
    const boundsOfLowestCollectionArea = _.last( levelModel.collectionAreas ).bounds;
    const showSubtractionCheckbox = new Checkbox( levelModel.simplifyNegativesProperty, new ShowSubtractionIcon(), {
      left: boundsOfLowestCollectionArea.left,
      top: boundsOfLowestCollectionArea.bottom + 20,
      maxWidth: boundsOfLowestCollectionArea.minX
    } );
    middleLayer.addChild( showSubtractionCheckbox );

    // only show the checkbox for simplifying expressions with negative values if some are present in the challenge
    levelModel.currentChallengeProperty.link( currentChallenge => {

      // determine whether negative values are present in this challenge
      let negativesExist = false;
      currentChallenge.carouselContents.forEach( carouselContent => {
        if ( carouselContent.minimumDecomposition < 0 ) {
          negativesExist = true;
        }
      } );
      showSubtractionCheckbox.visible = negativesExist;
    } );

    // add the node for moving to the next level, only shown when all challenges on this level have been answered
    this.nextLevelNode = new NextLevelNode( gameModel.nextLevel.bind( gameModel ), {
      centerX: title.centerX,
      centerY: screenLayoutBounds.height * 0.33 // multiplier empirically determined
    } );
    notificationsLayer.addChild( this.nextLevelNode );

    // create the dialog that is shown when all levels reach completion
    this.allLevelsCompletedDialog = new AllLevelsCompletedNode( gameModel.returnToLevelSelection.bind( gameModel ), {
      centerX: title.centerX,
      centerY: screenLayoutBounds.height * 0.4, // empirically determined
      visible: false
    } );
    notificationsLayer.addChild( this.allLevelsCompletedDialog );

    // helper function for showing the reward node
    const showRewardNode = () => {
      if ( !this.rewardNode ) {
        this.rewardNode = new EERewardNode();
        background.addChild( this.rewardNode );
      }
      if ( this.rewardNode ) {
        this.rewardNode.visible = true;
      }
    };

    // the reward node is removed rather then hidden in order to conserve memory
    const removeRewardNode = () => {
      if ( this.rewardNode ) {
        background.removeChild( this.rewardNode );
        this.rewardNode.dispose();
        this.rewardNode = null;
      }
    };

    // define a property that tracks whether the 'next level' node should be visible.  This is done as a separate
    // view-only property because the logic that decides whether to show it is somewhat complex.
    const showNextLevelNodeProperty = new Property( false );

    // show the "next level" node when this level becomes completed
    levelModel.completedSinceLastClearProperty.link( currentlyCompleted => {
      showNextLevelNodeProperty.set( currentlyCompleted && !gameModel.allLevelsCompletedProperty.get() );

      // if the appropriate query param is set, show the reward node every time this level is successfully completed
      if ( EEQueryParameters.showRewardNodeEveryLevel ) {
        if ( currentlyCompleted ) {
          showRewardNode();
        }
        else {
          removeRewardNode();
        }
      }
    } );

    showNextLevelNodeProperty.linkAttribute( this.nextLevelNode, 'visible' );

    gameModel.allLevelsCompletedProperty.link( ( allLevelsCompleted, allLevelsWereCompleted ) => {

      // when all levels become completed, we no longer show the "Next Level" nodes, see
      // https://github.com/phetsims/expression-exchange/issues/108 for more information about why
      if ( allLevelsCompleted ) {
        showNextLevelNodeProperty.set( false );

        if ( this.inViewportProperty.get() ) {

          // show the 'all levels completed' dialog
          this.allLevelsCompletedDialog.visible = true;

          // show the reward node
          showRewardNode();

          // play the sound that indicates all levels have been completed
          gameAudioPlayer.gameOverPerfectScore();
        }
      }

      // this handles the case where the user presses the refresh button while in the "all levels completed" state
      if ( !allLevelsCompleted && allLevelsWereCompleted && this.inViewportProperty.get() ) {
        this.allLevelsCompletedDialog.visible = false;
        removeRewardNode();
        gameModel.clearAllLevelsCompleted();
      }
    } );

    // when this node leaves the view port, check whether all levels had been completed and, if so, hide the associated
    // celebratory nodes and reset the flag in the model.
    this.inViewportProperty.link( ( inViewPort, wasInViewPort ) => {
      if ( !inViewPort && wasInViewPort && gameModel.allLevelsCompletedProperty.get() ) {
        removeRewardNode();
        this.allLevelsCompletedDialog.visible = false;
        gameModel.clearAllLevelsCompleted();
      }
    } );

    // hook up listeners to the collection areas to play the appropriate sounds upon collection or rejection of a user-
    // submitted answer
    levelModel.collectionAreas.forEach( collectionArea => {
      collectionArea.collectionAttemptedEmitter.addListener( itemCollected => {
        if ( itemCollected ) {
          gameAudioPlayer.correctAnswer();
        }
        else if ( !itemCollected && collectionArea.isEmpty() ) {
          gameAudioPlayer.wrongAnswer();
        }
      } );
    } );
  }

  /**
   * @param {number} dt
   * @public
   */
  step( dt ) {
    if ( this.inViewportProperty.get() && this.rewardNode && this.rewardNode.visible ) {
      this.rewardNode.step( Math.min( dt, 1 ) );
    }
  }
}

expressionExchange.register( 'EEGameLevelView', EEGameLevelView );

export default EEGameLevelView;