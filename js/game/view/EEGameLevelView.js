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
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var ShowSubtractionIcon = require( 'EXPRESSION_EXCHANGE/common/view/ShowSubtractionIcon' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var levelNString = require( 'string!EXPRESSION_EXCHANGE/levelN' );

  /**
   * @param {EEGameLevelModel} levelModel
   * @param {Bounds2} screenLayoutBounds
   * @param {Property.<Bounds2>} visibleBoundsProperty
   * @param {function} nextLevelFunction - function called when user hits 'next' button
   * @param {Property.<boolean>} showRewardNodeProperty - property that will control when the reward node is shown
   * @param {function} returnToLevelSelectionFunction
   * @constructor
   */
  function EEGameLevelView( levelModel,
                            screenLayoutBounds,
                            visibleBoundsProperty,
                            nextLevelFunction,
                            showRewardNodeProperty,
                            returnToLevelSelectionFunction ) {

    var self = this;
    Node.call( this );

    // add an invisible background rectangle so that bounds are correct
    var background = new Rectangle( screenLayoutBounds, {
      stroke: 'rgba( 0, 0, 200, 0.01 )' // increase opacity to make the outline visible if desired (for debugging)
    } );
    this.addChild( background );

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
        levelModel,
        { centerX: title.centerX, bottom: screenLayoutBounds.bottom - 40 }
      );
      self.addChild( coinTermCreatorBox );
      coinTermCreatorBox.moveToBack(); // needs to be behind coin term and other layers...
      background.moveToBack(); // ...except for the background

      // let the model know where the creator box is so that it knows when the user returns coin terms
      levelModel.creatorBoxBounds = coinTermCreatorBox.bounds;
    } );

    // add the check box that allows expressions with negative values to be simplified
    var boundsOfLowestCollectionArea = levelModel.collectionAreas[ 2 ].bounds;
    var showSubtractionCheckbox = new CheckBox(
      new ShowSubtractionIcon(),
      levelModel.simplifyNegativesProperty,
      {
        left: boundsOfLowestCollectionArea.minX,
        top: boundsOfLowestCollectionArea.maxY + 10,
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
    this.addChild( new ExpressionManipulationView(
      levelModel,
      visibleBoundsProperty,
      { coinTermBreakApartButtonMode: 'inverted' }
    ) );

    // hook up the audio player to the sound settings
    var gameAudioPlayer = new GameAudioPlayer( levelModel.soundEnabledProperty );
    levelModel.scoreProperty.link( function( newScore, oldScore ) {

      // play a feedback sound
      if ( newScore > oldScore ) {
        gameAudioPlayer.correctAnswer();
      }
    } );

    showRewardNodeProperty.link( function( showRewardNode ) {
      if ( showRewardNode ) {

        // create and show the reward node
        self.rewardNode = new EERewardNode();
        background.addChild( self.rewardNode );
        self.rewardNode.moveToBack();

        // play the sound for all levels completed
        gameAudioPlayer.gameOverPerfectScore();
      }
      else if ( self.rewardNode ) {

        // get rid of the reward node
        background.removeChild( self.rewardNode );
        self.rewardNode = null;
      }
    } );
  }

  expressionExchange.register( 'EEGameLevelView', EEGameLevelView );

  return inherit( Node, EEGameLevelView, {

    /**
     * set the pickability (i.e. whether or not the user can interact with it) of the 'next level' dialog node
     * @param {Boolean} pickable
     * @public
     */
    setNextLevelNodePickable: function( pickable ) {
      this.nextLevelNode.pickable = pickable;
    },

    // @public
    step: function( dt ) {
      this.rewardNode && this.rewardNode.step( Math.min( dt, 1 ) );
    }
  } );
} );