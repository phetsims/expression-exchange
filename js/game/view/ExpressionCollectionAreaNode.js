// Copyright 2017, University of Colorado Boulder

/**
 * view representation of the area where expressions can be collected, used in the game
 */
define( function( require ) {
  'use strict';

  // modules
  var ExpressionDescriptionNode = require( 'EXPRESSION_EXCHANGE/game/view/ExpressionDescriptionNode' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @param expressionCollectionArea
   * @constructor
   */
  function ExpressionCollectionAreaNode( expressionCollectionArea ) {
    var self = this;
    Node.call( this );

    var collectionArea = new Rectangle( expressionCollectionArea.bounds, {
      fill: 'white',
      stroke: 'black'
    } );
    this.addChild( collectionArea );

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
    } );
  }

  expressionExchange.register( 'ExpressionCollectionAreaNode', ExpressionCollectionAreaNode );

  return inherit( Node, ExpressionCollectionAreaNode );
} );