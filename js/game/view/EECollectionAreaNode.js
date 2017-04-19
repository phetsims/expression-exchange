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

  // constants
  var CORNER_RADIUS = 4;

  /**
   * @param collectionArea
   * @constructor
   */
  function EECollectionAreaNode( collectionArea ) {
    var self = this;
    Node.call( this );

    // create the 'halo' that will turn on as a hint that the user can drop something into the collection area
    var halo = new Rectangle(
      0,
      0,
      collectionArea.bounds.width,
      collectionArea.bounds.height,
      CORNER_RADIUS,
      CORNER_RADIUS,
      {
        lineWidth: 9,
        stroke: '#66FF33'
      }
    );
    this.addChild( halo );

    // control halo visibility
    collectionArea.haloActiveProperty.linkAttribute( halo, 'visible' );

    // create the basic rectangular background
    var collectionAreaRectangle = new Rectangle(
      0,
      0,
      collectionArea.bounds.width,
      collectionArea.bounds.height,
      CORNER_RADIUS,
      CORNER_RADIUS,
      {
        fill: 'white',
        stroke: 'black'
      }
    );
    this.addChild( collectionAreaRectangle );

    // add the expression description representation, which will update if the expression description changes
    var expressionDescriptionNode = null;
    collectionArea.expressionDescriptionProperty.link( function( expressionDescription ) {

      // remove the previous expression description node, if present
      if ( expressionDescriptionNode ) {
        self.removeChild( expressionDescriptionNode );
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

    this.setTranslation( collectionArea.bounds.minX, collectionArea.bounds.minY );
  }

  expressionExchange.register( 'EECollectionAreaNode', EECollectionAreaNode );

  return inherit( Node, EECollectionAreaNode );
} );