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
    Node.call( this );

    var collectionArea = new Rectangle( expressionCollectionArea.bounds, {
      fill: 'white',
      stroke: 'black'
    } );
    this.addChild( collectionArea );

    this.addChild( new ExpressionDescriptionNode( null, {
      left: collectionArea.left,
      bottom: collectionArea.top - 4
    } ) );
  }

  expressionExchange.register( 'ExpressionCollectionAreaNode', ExpressionCollectionAreaNode );

  return inherit( Node, ExpressionCollectionAreaNode );
} );