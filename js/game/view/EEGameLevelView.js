// Copyright 2016, University of Colorado Boulder

/**
 * view for a single level of the Expression Exchange game
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTermCreatorBoxFactory = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermCreatorBoxFactory' );
  var ExpressionCollectionAreaNode = require( 'EXPRESSION_EXCHANGE/game/view/ExpressionCollectionAreaNode' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionManipulationView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionManipulationView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

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
    levelModel.expressionCollectionAreas.forEach( function( expressionCollectionArea ) {
      self.addChild( new ExpressionCollectionAreaNode( expressionCollectionArea ) );
    } );

    // add the view area where the user will interact with coin terms and expressions
    this.addChild( new ExpressionManipulationView(
      levelModel.expressionManipulationModel,
      coinTermCreatorBox.bounds,
      visibleBoundsProperty,
      { coinTermBreakApartButtonMode: 'inverted' }
    ) );
  }

  expressionExchange.register( 'EEGameLevelView', EEGameLevelView );

  return inherit( Node, EEGameLevelView );
} );