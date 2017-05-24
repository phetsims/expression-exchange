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
   * @param {EEGameLevelModel} levelModel
   * @param {Bounds2} screenLayoutBounds
   * @param {Property.<Bounds2>} visibleBoundsProperty
   * @param {Function} nextLevelFunction - function called when user hits 'next' button REVIEW callback param docs
   * @param {Property.<boolean>} allLevelsCompletedProperty - property that indicates when all levels are successfully
   *                                                          completed
   * @param {Function} returnToLevelSelectionFunction REVIEW: callback param docs
   * @constructor
   */
  function EEGameLevelView( levelModel,
                            screenLayoutBounds,
                            visibleBoundsProperty,
                            nextLevelFunction,
                            allLevelsCompletedProperty,
                            returnToLevelSelectionFunction ) {

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
      stroke: 'rgba( 0, 0, 200, 0.01 )' // increase opacity to make the outline visible if desired (for debugging)
    } );
    this.addChild( background );

    // add the level label
    var title = new Text( StringUtils.format( levelNumberPatternString, ( levelModel.level + 1 ) ), {
      font: new PhetFont( 20 ),
      centerX: screenLayoutBounds.width * 0.4,
      top: 20
    } );
    this.addChild( title );

    // add the back button
    var backButton = new BackButton( {
      //REVIEW: easier to read with screenLayoutBounds.left and screenLayoutBounds.top
      //REVIEW: Or leftTop: screenLayoutBounds.eroded( 30 ).leftTop
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
    this.nextLevelNode = new NextLevelNode( nextLevelFunction, {
      centerX: title.centerX,
      centerY: screenLayoutBounds.height * 0.33 // empirically determined
    } );
    this.addChild( this.nextLevelNode );
    levelModel.scoreProperty.link( function( score ) {
      self.nextLevelNode.visible = score === EEGameModel.MAX_SCORE_PER_LEVEL;
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
    this.addChild( expressionManipulationView );

    // hook up the audio player for playing a correct answer
    //REVIEW: Presumably this one is used, the one in EEGameScreenView is not?
    var gameAudioPlayer = new GameAudioPlayer( levelModel.soundEnabledProperty );
    levelModel.scoreProperty.link( function( newScore, oldScore ) {

      // play a feedback sound
      if ( newScore > oldScore ) {
        gameAudioPlayer.correctAnswer();
      }
    } );

    // control the visibility of the reward node
    //REVIEW: Can we create this on startup, so the extra logic isn't needed?
    function createRewardNode() {
      if ( !self.rewardNode ) {
        self.rewardNode = new EERewardNode();
        background.addChild( self.rewardNode );
        self.rewardNode.moveToBack(); //REVIEW: Why immediately move to back? why not insert it at the correct place?
      }
    }

    if ( !EEQueryParameters.showRewardNodeEveryLevel ) {

      Property.multilink(
        [ allLevelsCompletedProperty, this.inViewportProperty ],
        function( allLevelsCompleted, inViewport ) {
          if ( allLevelsCompleted && inViewport && !self.rewardNode ) {
            createRewardNode();
          }
          if ( self.rewardNode ) {
            self.rewardNode.visible = allLevelsCompleted;
          }
        }
      );
    }
    else {

      // a query parameter is present that indicates that the reward node should be shown at the completion of each level
      levelModel.scoreProperty.link( function( score ) {
        if ( score === EEGameModel.MAX_SCORE_PER_LEVEL && !self.rewardNode ) {
          createRewardNode();
        }
        if ( self.rewardNode ) {
          self.rewardNode.visible = ( score === EEGameModel.MAX_SCORE_PER_LEVEL );
        }
      } );
    }
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
     * set the pickability (i.e. whether or not the user can interact with it) of the 'next level' dialog node
     * @param {Boolean} pickable
     * @public
     */
    setNextLevelNodePickable: function( pickable ) {
      this.nextLevelNode.pickable = pickable;
    }

  } );
} );