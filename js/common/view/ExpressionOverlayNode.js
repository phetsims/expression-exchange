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
  var EditExpressionButton = require( 'EXPRESSION_EXCHANGE/common/view/EditExpressionButton' );
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
  var DRAG_DISTANCE_HIDE_THRESHOLD = 10; // in screen coords, determined empirically

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

    // add the parent node that will contain the pop-up buttons
    var popUpButtonsNode = new Node( { visible: false } );
    this.addChild( popUpButtonsNode );

    // add the button used to break apart the expression
    var breakApartButton = new BreakApartButton();
    popUpButtonsNode.addChild( breakApartButton );

    // add the button used to put the expression into edit mode
    var editExpressionButton = new EditExpressionButton( { left: breakApartButton.right + 5 } );
    popUpButtonsNode.addChild( editExpressionButton );

    function showPopUpButtons( xLocation ) {
      popUpButtonsNode.visible = true;
      popUpButtonsNode.centerX = xLocation;
      popUpButtonsNode.bottom = -2;
    }

    function hidePopUpButtons() {
      popUpButtonsNode.visible = false;

      // put the pop up buttons in a place where they don't affect the overall bounds
      popUpButtonsNode.x = 0;
      popUpButtonsNode.y = 0;
    }

    // timer used to hide the button
    var hideButtonsTimer = null;

    // define helper functions for managing the button timer
    function clearHideButtonsTimer() {
      if ( hideButtonsTimer ) {
        Timer.clearTimeout( hideButtonsTimer );
        hideButtonsTimer = null;
      }
    }

    function startHideButtonsTimer() {
      clearHideButtonsTimer(); // just in case one is already running
      hideButtonsTimer = Timer.setTimeout( function() {
        hidePopUpButtons();
        hideButtonsTimer = null;
      }, 2000 );
    }

    // keep the button showing if the user is over it
    breakApartButton.buttonModel.overProperty.lazyLink( function( overButton ) {
      if ( overButton ) {
        assert && assert( !!hideButtonsTimer, 'should not be over button without hide timer running' );
        clearHideButtonsTimer();
      }
      else {
        startHideButtonsTimer();
      }
    } );

    // add the listener that will initiate the break apart, and will also hide the button and cancel the timer
    breakApartButton.addListener( function() {
      expression.breakApart();
      hidePopUpButtons();
      clearHideButtonsTimer();
    } );

    // pre-allocated vectors, used for calculating allowable locations for the expression
    var unboundedUpperLeftCornerPosition = new Vector2();
    var boundedUpperLeftCornerPosition = new Vector2();

    // TODO: doc
    var dragDistance = 0;

    // add the handler that will allow the expression to be dragged and will hide and show the buttons
    var dragHandler = new SimpleDragHandler( {

      // when dragging across it in a mobile device, pick it up
      allowTouchSnag: true,

      start: function( event ) {
        expression.userControlled = true;
        dragDistance = 0;
        unboundedUpperLeftCornerPosition.set( expression.upperLeftCorner );
        boundedUpperLeftCornerPosition.set( unboundedUpperLeftCornerPosition );
        showPopUpButtons( self.globalToLocalPoint( event.pointer.point ).x );
        clearHideButtonsTimer(); // in case it's running
      },

      translate: function( translationParams ) {

        // figure out where the expression would go if unbounded
        unboundedUpperLeftCornerPosition.setXY(
          unboundedUpperLeftCornerPosition.x + translationParams.delta.x,
          unboundedUpperLeftCornerPosition.y + translationParams.delta.y
        );

        // set the expression position, but bound it so the user doesn't drag it outside of the usable area
        expression.setPositionAndDestination( new Vector2(
          Util.clamp( unboundedUpperLeftCornerPosition.x, dragBounds.minX, dragBounds.maxX - expression.width ),
          Util.clamp( unboundedUpperLeftCornerPosition.y, dragBounds.minY, dragBounds.maxY - expression.height )
        ) );

        // update the drag distance and hide the button if the drag threshold is reached
        dragDistance += translationParams.delta.magnitude();
        if ( dragDistance > DRAG_DISTANCE_HIDE_THRESHOLD && breakApartButton.visible ) {
          hidePopUpButtons();
        }
      },

      end: function() {
        expression.userControlled = false;
        assert && assert( hideButtonsTimer === null, 'a timer for hiding the buttons was running at end of drag' );
        if ( breakApartButton.visible ) {
          startHideButtonsTimer();
        }
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