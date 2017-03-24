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

    // add a node that will contain the dotted line circles (only used in coin view mode)
    var dottedCirclesRootNode = new Node();
    collectionAreaRectangle.addChild( dottedCirclesRootNode );

    // monitor the collected expression and update the state when it changes
    collectionArea.collectedItemProperty.link( function( collectedExpression ) {
      dottedCirclesRootNode.visible = collectedExpression === null;
    } );

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
          { left: collectionAreaRectangle.left, bottom: collectionAreaRectangle.top - 4 }
        );
        self.addChild( expressionDescriptionNode );
      }

      // set up the dotted line circles if in coin view mode
      if ( collectionArea.viewMode === ViewMode.COINS ) {
        dottedCirclesRootNode.removeAllChildren();
        var nextCircleXPos = 0;
        _.times( expressionDescription.termsArray.length, function() {
          var circle = new Circle( DOTTED_CIRCLE_RADIUS, {
            stroke: '#999999',
            lineDash: [ 4, 3 ],
            left: nextCircleXPos,
            y: collectionAreaRectangle.height / 2
          } );
          dottedCirclesRootNode.addChild( circle );
          nextCircleXPos += circle.width + INTER_CIRCLE_SPACING;
        } );
        dottedCirclesRootNode.centerX = collectionArea.bounds.width / 2;
        dottedCirclesRootNode.centerY = collectionArea.bounds.height / 2;
      }
    } );

    this.setTranslation( collectionArea.bounds.minX, collectionArea.bounds.minY );
  }

  expressionExchange.register( 'EECollectionAreaNode', EECollectionAreaNode );

  return inherit( Node, EECollectionAreaNode );
} );