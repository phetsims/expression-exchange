// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var CoinTermCreatorBox = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermCreatorBox' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionManipulationView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionManipulationView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  function EEGameLevelView( levelModel, screenLayoutBounds, visibleBoundsProperty ) {
    Node.call( this );

    var coinTermCreatorDescriptors = CoinTermCreatorBox.BASIC_SCREEN_CONFIG;

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

    this.addChild( new ExpressionManipulationView( levelModel, Bounds2.EMPTY, visibleBoundsProperty ) );
  }

  expressionExchange.register( 'EEGameLevelView', EEGameLevelView );

  return inherit( Node, EEGameLevelView );
} );