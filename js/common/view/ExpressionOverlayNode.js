// Copyright 2016, University of Colorado Boulder

/**
 * a node that is placed on the top layer of an expression to allow it to be dragged
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );

  /**
   * @param {Expression} expression - model of an expression
   * @param {Bounds2} layoutBounds
 * @constructor
   */
  function ExpressionOverlayNode( expression, layoutBounds ) {

    Node.call( this, { pickable: true, cursor: 'pointer' } );
    var self = this;

    // shape and path
    var shape;
    var path = null;

    function updateShape() {
      shape = new Shape.rect( 0, 0, expression.width, expression.height );
      if ( !path ){
        path = new Path( shape, { fill: 'rgba( 255, 255, 255, 0.01 )' } ); // TODO: this works great, but review with JO to see if there is a better way
        self.addChild( path );
      }
      else{
        path.shape = shape;
      }
    }

    // update the shape if the height or width change
    Property.multilink( [ expression.widthProperty, expression.heightProperty ], updateShape );

    // update the position
    expression.upperLeftCornerProperty.link( function( upperLeftCorner ){
      self.left = upperLeftCorner.x;
      self.top = upperLeftCorner.y;
    } );

    // add the listener that implement the dragging behavior
    this.addInputListener( new SimpleDragHandler( {

      //When dragging across it in a mobile device, pick it up
      allowTouchSnag: true,

      startDrag: function() {
        expression.userControlled = true;
      },
      translate: function( translateParams ){
        expression.translate( translateParams.delta.x, translateParams.delta.y );
      },
      endDrag: function() {
        expression.userControlled = false;
      }
    } ));
  }

  return inherit( Node, ExpressionOverlayNode );
} );