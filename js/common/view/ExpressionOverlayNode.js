// Copyright 2016, University of Colorado Boulder

/**
 * a node that is placed on the top layer of an expression to allow it to be dragged and to prevent input events from
 * getting to the constituents of the expression
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Expression} expression - model of an expression
   * @param {Bounds2} dragBounds
   * @constructor
   */
  function ExpressionOverlayNode( expression, dragBounds ) {

    Node.call( this, { pickable: true, cursor: 'pointer' } );
    var self = this;

    // shape and path
    var shape;
    var path = null;

    function updateShape() {
      shape = new Shape.rect( 0, 0, expression.width, expression.height );
      if ( !path ) {
        path = new Path( shape, { fill: 'rgba( 255, 255, 255, 0.01 )' } ); // TODO: this works great, but review with JO to see if there is a better way
        self.addChild( path );
      }
      else {
        path.shape = shape;
      }
    }

    // update the shape if the height or width change
    Property.multilink( [ expression.widthProperty, expression.heightProperty ], updateShape );

    // update the position as the expression moves
    expression.upperLeftCornerProperty.link( function( upperLeftCorner ) {
      self.left = upperLeftCorner.x;
      self.top = upperLeftCorner.y;
    } );

    // pre-allocated vectors, used for calculating allowable locations for the extpression
    var unboundedUpperLeftCornerPosition = new Vector2();
    var boundedUpperLeftCornerPosition = new Vector2();

    var dragHandler = new SimpleDragHandler( {

      // when dragging across it in a mobile device, pick it up
      allowTouchSnag: true,

      start: function() {
        expression.userControlled = true;
        unboundedUpperLeftCornerPosition.set( expression.upperLeftCorner );
        boundedUpperLeftCornerPosition.set( unboundedUpperLeftCornerPosition );
      },

      translate: function( translationParams ) {
        unboundedUpperLeftCornerPosition.setXY(
          unboundedUpperLeftCornerPosition.x + translationParams.delta.x,
          unboundedUpperLeftCornerPosition.y + translationParams.delta.y
        );

        expression.setPositionAndDestination( new Vector2(
          Util.clamp( unboundedUpperLeftCornerPosition.x, dragBounds.minX, dragBounds.maxX - expression.width ),
          Util.clamp( unboundedUpperLeftCornerPosition.y, dragBounds.minY, dragBounds.maxY - expression.height )
        ) );
      },

      end: function() {
        expression.userControlled = false;
      }

    } );

    // the drag handler is removed if an animation is in progress to prevent problematic race conditions
    expression.inProgressAnimationProperty.link( function( inProgressAnimation ) {
      if ( inProgressAnimation ) {
        self.removeInputListener( dragHandler );
      }
      else {
        self.addInputListener( dragHandler );
      }
    } );
  }

  expressionExchange.register( 'ExpressionOverlayNode', ExpressionOverlayNode );

  return inherit( Node, ExpressionOverlayNode );
} );