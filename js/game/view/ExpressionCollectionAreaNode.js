// Copyright 2017, University of Colorado Boulder

/**
 * view representation of the area where expressions can be collected, used in the game
 */
define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var ExpressionDescriptionNode = require( 'EXPRESSION_EXCHANGE/game/view/ExpressionDescriptionNode' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );

  // constants
  var DOTTED_CIRCLE_RADIUS = 20; // empirically determined to be close to coin term radii in expressions
  var INTER_CIRCLE_SPACING = 30; // empirically determined to roughly match up with expression spacing

  /**
   * @param expressionCollectionArea
   * @constructor
   */
  function ExpressionCollectionAreaNode( expressionCollectionArea ) {
    var self = this;
    Node.call( this );

    // create the basic rectangular background
    var collectionArea = new Rectangle( expressionCollectionArea.bounds, {
      fill: 'white',
      stroke: 'black'
    } );
    this.addChild( collectionArea );

    // add a node that will contain the dotted line circles (only used in coin view mode)
    var dottedCirclesRootNode = new Node();
    this.addChild( dottedCirclesRootNode );

    var expressionDescriptionNode = null;
    expressionCollectionArea.expressionDescriptionProperty.link( function( expressionDescription ) {

      // remove the previous expression description node, if present
      if ( expressionDescriptionNode ) {
        self.removeChild( expressionDescriptionNode );
      }

      // add the description node for the new expression
      if ( expressionDescription ) {
        expressionDescriptionNode = new ExpressionDescriptionNode(
          expressionDescription,
          expressionCollectionArea.viewMode,
          { left: collectionArea.left, bottom: collectionArea.top - 4 }
        );
        self.addChild( expressionDescriptionNode );
      }

      // set up the dotted line circles if in coin view mode
      if ( expressionCollectionArea.viewMode === ViewMode.COINS ) {
        dottedCirclesRootNode.removeAllChildren();
        var nextCircleXPos = 0;
        _.times( expressionDescription.termsArray.length, function() {
          var circle = new Circle( DOTTED_CIRCLE_RADIUS, {
            stroke: '#999999',
            lineDash: [ 4, 3 ],
            left: nextCircleXPos
          } );
          dottedCirclesRootNode.addChild( circle );
          nextCircleXPos += circle.width + INTER_CIRCLE_SPACING;
        } );
        dottedCirclesRootNode.center = collectionArea.center;
      }
    } );
  }

  expressionExchange.register( 'ExpressionCollectionAreaNode', ExpressionCollectionAreaNode );

  return inherit( Node, ExpressionCollectionAreaNode );
} );