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
  var BreakApartButton = require( 'EXPRESSION_EXCHANGE/common/view/BreakApartButton' );
  var Emitter = require( 'AXON/Emitter' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var Timer = require( 'PHET_CORE/Timer' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var HIDE_BUTTON_TIMEOUT = 1500; // in milliseconds

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

    // define a function that will create or update the shape based on the width and height
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
      self.x = upperLeftCorner.x;
      self.y = upperLeftCorner.y;
    } );

    // add the button used to break apart the expression
    var breakApartButton = new BreakApartButton( {
      visible: false
    } );
    this.addChild( breakApartButton );

    function showBreakApartButton( xLocation ){
      breakApartButton.visible = true;
      breakApartButton.centerX = xLocation;
      breakApartButton.bottom = -2;
    }

    function hideBreakApartButton(){
      breakApartButton.visible = false;

      // put it in a place where it doesn't affect the overall bounds
      breakApartButton.x = 0;
      breakApartButton.y = 0;
    }

    // timer used to hide the button
    var hideButtonTimer = null;

    // add the listener that will initiate the break apart, and will also hide the button and cancel the timer
    breakApartButton.addListener( function(){
      expression.breakApart();
      hideBreakApartButton();
      if ( hideButtonTimer ){
        Timer.clearTimeout( hideButtonTimer );
        hideButtonTimer = null;
      }
    } );

    // pre-allocated vectors, used for calculating allowable locations for the expression
    var unboundedUpperLeftCornerPosition = new Vector2();
    var boundedUpperLeftCornerPosition = new Vector2();

    var dragHandler = new SimpleDragHandler( {

      // when dragging across it in a mobile device, pick it up
      allowTouchSnag: true,

      start: function( event ) {
        expression.userControlled = true;
        unboundedUpperLeftCornerPosition.set( expression.upperLeftCorner );
        boundedUpperLeftCornerPosition.set( unboundedUpperLeftCornerPosition );
        showBreakApartButton( self.globalToLocalPoint( event.pointer.point ).x );
        if ( hideButtonTimer ){
          Timer.clearTimeout( hideButtonTimer );
          hideButtonTimer = null;
        }
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
        assert && assert( breakApartButton.visible, 'break apart button should be visible at end of drag' );
        assert && assert( hideButtonTimer === null, 'a timer for hiding the buttons was running at end of drag' );
        hideButtonTimer = Timer.setTimeout( hideBreakApartButton, HIDE_BUTTON_TIMEOUT );
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