// Copyright 2017, University of Colorado Boulder

/**
 * view representation of the area where expressions can be collected, used in the game
 */
define( function( require ) {
  'use strict';

  // modules
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
    this.addChild( new Rectangle( expressionCollectionArea.bounds, {
      fill: 'white',
      stroke: 'black'
    } ) );
  }

  expressionExchange.register( 'ExpressionCollectionAreaNode', ExpressionCollectionAreaNode );

  return inherit( Node, ExpressionCollectionAreaNode );
} );