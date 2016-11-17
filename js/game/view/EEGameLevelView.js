// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // modules
  var CoinTermCreatorBox = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermCreatorBox' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionManipulationView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionManipulationView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @param {EEGameLevelModel} levelModel
   * @param {Bounds2} screenLayoutBounds
   * @param {Property.<Bounds2>} visibleBoundsProperty
   * @constructor
   */
  function EEGameLevelView( levelModel, screenLayoutBounds, visibleBoundsProperty ) {
    Node.call( this );

    // TODO: Temporarily using this descriptor until we have something to generate them.
    var coinTermCreatorDescriptors = CoinTermCreatorBox.BASIC_SCREEN_CONFIG;

    // add the coin term creator box
    var coinTermCreatorBox = new CoinTermCreatorBox(
      coinTermCreatorDescriptors,
      levelModel,
      screenLayoutBounds,
      {
        centerX: screenLayoutBounds.centerX,
        bottom: screenLayoutBounds.bottom - 40
      }
    );
    this.addChild( coinTermCreatorBox );

    // TODO: Temp for demo purposes - add some boxes that look like the collection area
    var collectionAreaWidth = 200;
    var collectionAreaHeight = 100;
    var topCollectionArea = new Rectangle( 0, 0, collectionAreaWidth, collectionAreaHeight, {
      fill: 'white',
      stroke: 'gray',
      top: 20,
      right: screenLayoutBounds.maxX - 20
    } );
    this.addChild( topCollectionArea );
    var middleCollectionArea = new Rectangle( 0, 0, collectionAreaWidth, collectionAreaHeight, {
      fill: 'white',
      stroke: 'gray',
      top: topCollectionArea.bottom + 20,
      right: topCollectionArea.right
    } );
    this.addChild( middleCollectionArea );
    var bottomCollectionArea = new Rectangle( 0, 0, collectionAreaWidth, collectionAreaHeight, {
      fill: 'white',
      stroke: 'gray',
      top: middleCollectionArea.bottom + 20,
      right: middleCollectionArea.right
    } );
    this.addChild( bottomCollectionArea );

    // add the view area where the user will interact with coin terms and expressions
    this.addChild( new ExpressionManipulationView( levelModel, coinTermCreatorBox.bounds, visibleBoundsProperty ) );
  }

  expressionExchange.register( 'EEGameLevelView', EEGameLevelView );

  return inherit( Node, EEGameLevelView );
} );