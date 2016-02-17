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
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );

  /**
   * @param {Expression} expression - model of an expression
   * @constructor
   */
  function ExpressionNode( expression ) {

    Node.call( this, { pickable: true, cursor: 'pointer' } );
    var self = this;

    // shape and path
    var shape;
    var path = null;

    function updateShape() {
      shape = new Shape.rect( 0, 0, expression.width, expression.height );
      if ( !path ){
        path = new Path( shape, { fill: 'pink' } );
        self.addChild( path );
      }
      else{
        path.shape = shape;
      }
    }

    Property.multilink( [ expression.widthProperty, expression.heightProperty ], updateShape );

    expression.upperLeftCornerProperty.link( function( upperLeftCorner ){
      self.left = upperLeftCorner.x;
      self.top = upperLeftCorner.y;
    } );
  }

  return inherit( Node, ExpressionNode );
} );