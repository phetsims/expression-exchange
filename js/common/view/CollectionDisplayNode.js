// Copyright 2016, University of Colorado Boulder

/**
 * a node that monitors the coin terms in the model and displays a summary of what has been created (a.k.a. "collected")
 * by the user
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // constants
  var WIDTH = 160; // empirically determined
  var HEIGHT = 400; // empirically determined

  /**
   * {ExpressionManipulationModel} model
   * @constructor
   */
  function CollectionDisplayNode( model ) {
    Node.call( this );
    this.addChild( new Rectangle( 0, 0, WIDTH, HEIGHT, 0, 0, { fill: 'pink' } ) );
  }

  expressionExchange.register( 'CollectionDisplayNode', CollectionDisplayNode );

  return inherit( Node, CollectionDisplayNode );
} );