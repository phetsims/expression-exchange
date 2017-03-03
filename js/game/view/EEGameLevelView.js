// Copyright 2016, University of Colorado Boulder

/**
 * view for a single level of the Expression Exchange game
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CheckBox = require( 'SUN/CheckBox' );
  var CoinTermCreatorBoxFactory = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermCreatorBoxFactory' );
  var EECollectionAreaNode = require( 'EXPRESSION_EXCHANGE/game/view/EECollectionAreaNode' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionManipulationView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionManipulationView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ShowSubtractionIcon = require( 'EXPRESSION_EXCHANGE/common/view/ShowSubtractionIcon' );
  var UndoButton = require( 'EXPRESSION_EXCHANGE/game/view/UndoButton' );

  /**
   * @param {EEGameLevelModel} levelModel
   * @param {Bounds2} screenLayoutBounds
   * @param {Property.<Bounds2>} visibleBoundsProperty
   * @constructor
   */
  function EEGameLevelView( levelModel, screenLayoutBounds, visibleBoundsProperty ) {
    var self = this;
    Node.call( this );

    // add the coin term creator box
    var coinTermCreatorBox = null;
    levelModel.currentChallengeProperty.link( function( currentChallenge ) {
      if ( coinTermCreatorBox ) {
        self.removeChild( coinTermCreatorBox );
      }
      coinTermCreatorBox = CoinTermCreatorBoxFactory.createGameScreenCreatorBox(
        currentChallenge,
        levelModel.expressionManipulationModel,
        { centerX: screenLayoutBounds.width * 0.4, bottom: screenLayoutBounds.bottom - 40 }
      );
      self.addChild( coinTermCreatorBox );
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
  }

  expressionExchange.register( 'EEGameLevelView', EEGameLevelView );

  return inherit( Node, EEGameLevelView );
} );