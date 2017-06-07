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
  var EEGameModel = require( 'EXPRESSION_EXCHANGE/game/model/EEGameModel' );
  var EEQueryParameters = require( 'EXPRESSION_EXCHANGE/common/EEQueryParameters' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var EERewardNode = require( 'EXPRESSION_EXCHANGE/game/view/EERewardNode' );
  var ExpressionManipulationView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionManipulationView' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var GameAudioPlayer = require( 'VEGAS/GameAudioPlayer' );
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

  /**
   * @param {EEGameModel} gameModel - main model for the game
   * @param {EEGameLevel} levelModel - model for the level depicted by this view object
   * @param {Bounds2} screenLayoutBounds
   * @param {Property.<Bounds2>} visibleBoundsProperty
   * @constructor
   */
  function EEGameLevelView( gameModel, levelModel, screenLayoutBounds, visibleBoundsProperty ) {

    var self = this;

    Node.call( this );

    // @public {Property.<boolean>} - a property that is externally set to true when this node is in the view port and
    // available for interaction with the user.  This is done in the view rather than in the model because the model has
    // no awareness of the slide in/out animations, and clocking the reward node during those animations caused
    // performance issues, and this property can be used to only clock when this is in the viewport.
    this.inViewportProperty = new Property( false );

    // add an invisible background rectangle so that bounds are correct
    //REVIEW: Shouldn't need a reference to this with proper layering?
    var background = new Rectangle( screenLayoutBounds, {
      //REVIEW: if for debugging, why still here?
      //REVIEW: Why have something that's "essentially invisible" instead of a null or 'transparent' fill?
      stroke: 'rgba( 0, 0, 200, 0.01 )' // increase opacity to make the outline visible if desired (for debugging)
    } );
    this.addChild( background );

    // set the bounds for coin term retrieval in the model
    levelModel.setCoinTermRetrievalBounds( screenLayoutBounds );

    // add the level label
    var title = new Text(
      StringUtils.fillIn( levelNumberPatternString, { levelNumber: ( levelModel.levelNumber + 1 ) } ),
      {
        font: new PhetFont( 20 ),
        centerX: screenLayoutBounds.width * 0.4,
        top: 20
      }
    );
    this.addChild( title );

    // add the back button
    var backButton = new BackButton( {
      //REVIEW: easier to read with screenLayoutBounds.left and screenLayoutBounds.top
      //REVIEW: Or leftTop: screenLayoutBounds.eroded( 30 ).leftTop
      left: screenLayoutBounds.minX + 30,
      top: screenLayoutBounds.minY + 30,
      listener: gameModel.returnToLevelSelection.bind( gameModel )
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

    // create the expression manipulation view, added later for correct layering
    var expressionManipulationView = new ExpressionManipulationView(
      levelModel,
      visibleBoundsProperty,
      { coinTermBreakApartButtonMode: 'inverted' }
    );

    // add the coin term creator box
    var coinTermCreatorBox = null;
    levelModel.currentChallengeProperty.link( function( currentChallenge ) {
      if ( coinTermCreatorBox ) {
        self.removeChild( coinTermCreatorBox );
      }
      coinTermCreatorBox = CoinTermCreatorBoxFactory.createGameScreenCreatorBox(
        currentChallenge,
        levelModel,
        expressionManipulationView,
        { centerX: title.centerX, bottom: screenLayoutBounds.bottom - 40 }
      );
      self.addChild( coinTermCreatorBox );
      //REVIEW: Seems like an anti-pattern to moveToBack here. Use layers instead?
      coinTermCreatorBox.moveToBack(); // needs to be behind coin term and other layers...
      background.moveToBack(); // ...except for the background

      // let the model know where the creator box is so that it knows when the user returns coin terms
      levelModel.creatorBoxBounds = coinTermCreatorBox.bounds;
    } );

    // add the check box that allows expressions with negative values to be simplified
    //REVIEW: Third collection area seems easy to break in future refactoring. Pick last collection area instead?
    var boundsOfLowestCollectionArea = levelModel.collectionAreas[ 2 ].bounds;
    var showSubtractionCheckbox = new CheckBox(
      new ShowSubtractionIcon(),
      levelModel.simplifyNegativesProperty,
      {
        //REVIEW: for readability, use bounds.left and bounds.bottom?
        left: boundsOfLowestCollectionArea.minX,
        top: boundsOfLowestCollectionArea.maxY + 20,
        maxWidth: boundsOfLowestCollectionArea.minX
      }
    );
    this.addChild( showSubtractionCheckbox );

    // add the node for moving to the next level, only shown when all challenges on this level have been answered
    this.nextLevelNode = new NextLevelNode( gameModel.nextLevel.bind( gameModel ), {
      centerX: title.centerX,
      centerY: screenLayoutBounds.height * 0.33 // empirically determined
    } );
    this.addChild( this.nextLevelNode );

    this.allLevelsCompletedDialog = new AllLevelsCompletedDialog( gameModel.returnToLevelSelection.bind( gameModel ), {
      centerX: title.centerX,
      centerY: screenLayoutBounds.height * 0.4 // empirically determined
    } );
    this.addChild( this.allLevelsCompletedDialog );

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
    this.addChild( expressionManipulationView );

    // create the audio player
    //REVIEW: Presumably this one is used, the one in EEGameScreenView is not?
    // TODO: consider passing this in to save memory
    var gameAudioPlayer = new GameAudioPlayer( levelModel.soundEnabledProperty );

    // show the appropriate dialog and reward node based on the score
    levelModel.scoreProperty.link( function( score, previousScore ) {

      // play the appropriate sound
      if ( score > previousScore ) {
        gameAudioPlayer.correctAnswer();
      }

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

        // show the reward node if warranted
        if ( allLevelsCompleted || EEQueryParameters.showRewardNodeEveryLevel ) {
          if ( !self.rewardNode ) {
            //REVIEW: Can we create this on startup, so the extra logic isn't needed?
            self.rewardNode = new EERewardNode();
            background.addChild( self.rewardNode );
            self.rewardNode.moveToBack(); //REVIEW: Why immediately move to back? why not insert it at the correct place?
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
  }

  expressionExchange.register( 'EEGameLevelView', EEGameLevelView );

  return inherit( Node, EEGameLevelView, {

    // @public
    //REVIEW: docs?
    step: function( dt ) {
      if ( this.inViewportProperty.get() && this.rewardNode && this.rewardNode.visible ) {
        //REVIEW: Generally preferred to cap DT at the top level. Is the cap only needed for RewardNode?
        this.rewardNode.step( Math.min( dt, 1 ) );
      }
    },

    /**
     * set the pickability (i.e. whether or not the user can interact with it) of the 'next level' dialog node, useful
     * for preventing interaction when moving the game level view around
     * @param {Boolean} pickable
     * @public
     */
    setNextLevelNodePickable: function( pickable ) {
      this.nextLevelNode.pickable = pickable;
    }

  } );
} );