// Copyright 2017-2019, University of Colorado Boulder

/**
 * view representation of the area where expressions can be collected, used in the game
 */
define( require => {
  'use strict';

  // modules
  const ExpressionDescriptionNode = require( 'EXPRESSION_EXCHANGE/game/view/ExpressionDescriptionNode' );
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // constants
  const CORNER_RADIUS = 4;

  /**
   * @param {EECollectionArea} collectionArea
   * @constructor
   */
  function EECollectionAreaNode( collectionArea ) {
    const self = this;
    Node.call( this );

    // create the 'halo' that will turn on as a hint that the user can drop something into the collection area
    const halo = Rectangle.bounds( collectionArea.bounds, {
      lineWidth: 9,
      stroke: '#66FF33',
      cornerRadius: CORNER_RADIUS
    } );
    this.addChild( halo );

    // control halo visibility
    collectionArea.haloActiveProperty.linkAttribute( halo, 'visible' );

    // create the basic rectangular background
    const collectionAreaRectangle = Rectangle.bounds( collectionArea.bounds, {
      fill: 'white',
      stroke: 'black',
      cornerRadius: CORNER_RADIUS
    } );
    this.addChild( collectionAreaRectangle );

    // add the expression description representation, which will update if the expression description changes
    let expressionDescriptionNode = null;
    collectionArea.expressionDescriptionProperty.link( function( expressionDescription ) {

      // remove the previous expression description node, if present
      if ( expressionDescriptionNode ) {
        self.removeChild( expressionDescriptionNode );
        expressionDescriptionNode = null;
      }

      // add the description node for the new expression
      if ( expressionDescription ) {
        expressionDescriptionNode = new ExpressionDescriptionNode(
          expressionDescription,
          collectionArea.viewMode,
          { left: collectionAreaRectangle.left, bottom: collectionAreaRectangle.top - 2 }
        );
        self.addChild( expressionDescriptionNode );
      }
    } );
  }

  expressionExchange.register( 'EECollectionAreaNode', EECollectionAreaNode );

  return inherit( Node, EECollectionAreaNode );
} );