// Copyright 2017-2022, University of Colorado Boulder

/**
 * view representation of the area where expressions can be collected, used in the game
 */

import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import expressionExchange from '../../expressionExchange.js';
import ExpressionDescriptionNode from './ExpressionDescriptionNode.js';

// constants
const CORNER_RADIUS = 4;

class EECollectionAreaNode extends Node {

  /**
   * @param {EECollectionArea} collectionArea
   */
  constructor( collectionArea ) {
    super();

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
    collectionArea.expressionDescriptionProperty.link( expressionDescription => {

      // remove the previous expression description node, if present
      if ( expressionDescriptionNode ) {
        this.removeChild( expressionDescriptionNode );
        expressionDescriptionNode = null;
      }

      // add the description node for the new expression
      if ( expressionDescription ) {
        expressionDescriptionNode = new ExpressionDescriptionNode(
          expressionDescription,
          collectionArea.viewMode,
          { left: collectionAreaRectangle.left, bottom: collectionAreaRectangle.top - 2 }
        );
        this.addChild( expressionDescriptionNode );
      }
    } );
  }
}

expressionExchange.register( 'EECollectionAreaNode', EECollectionAreaNode );

export default EECollectionAreaNode;