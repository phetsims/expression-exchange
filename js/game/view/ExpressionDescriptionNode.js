// Copyright 2017, University of Colorado Boulder

/**
 * a Scenery node that represents a visual description of an expression, used in the game to describe what the user
 * should attempt to construct
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @param expressionDescription
   * @constructor
   */
  function ExpressionDescriptionNode( expressionDescription, options ) {
    Node.call( this );
    this.addChild( new Rectangle( 0, 0, 100, 20, { fill: 'pink' } ) );
    this.mutate( options );
  }

  expressionExchange.register( 'ExpressionDescriptionNode', ExpressionDescriptionNode );

  return inherit( Node, ExpressionDescriptionNode );
} );