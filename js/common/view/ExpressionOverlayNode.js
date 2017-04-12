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
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
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
  var MIN_EXPRESSION_IN_BOUNDS_WIDTH = 70; // in screen coords, min horizontal amount of expression that must stay in bounds
  var BUTTON_SPACING = 11; // in screen coordinates

  /**
   * @param {Expression} expression - model of an expression
   * @param {Bounds2} layoutBounds - bounds of the main view layout
   * @constructor
   */
  function ExpressionOverlayNode( expression, layoutBounds ) {

    Node.call( this, { pickable: true, cursor: 'pointer' } );
    var self = this;

    // shape and path
    var shape = new Shape.rect( 0, 0, 0.1, 0.1 ); // tiny rect, will be set in update function
    var expressionShapeNode = new Path( shape, { fill: 'rgba( 255, 255, 255, 0.01 )' } ); // TODO: this works great, but review with JO to see if there is a better way;
    this.addChild( expressionShapeNode );

    // define a function that will create or update the shape based on the width and height
    function updateShape() {
      shape = new Shape.rect( 0, 0, expression.widthProperty.get(), expression.heightProperty.get() );
      expressionShapeNode.shape = shape;
    }

    // update the shape if the height or width change
    var updateShapeMultilink = Property.multilink( [ expression.widthProperty, expression.heightProperty ], updateShape );

    // update the position as the expression moves
    function updatePosition( upperLeftCorner ) {
      self.x = upperLeftCorner.x;
      self.y = upperLeftCorner.y;
    }
    expression.upperLeftCornerProperty.link( updatePosition );

    // become invisible if the expression goes into edit mode so that the user can interact with the coin terms within
    function updateVisibility( inEditMode ) {
      self.visible = !inEditMode;
    }
    expression.inEditModeProperty.link( updateVisibility );

    // add the parent node that will contain the pop-up buttons
    var popUpButtonsNode = new Node( { visible: false } );
    this.addChild( popUpButtonsNode );

    // add the button used to break apart the expression
    var breakApartButton = new BreakApartButton();
    popUpButtonsNode.addChild( breakApartButton );

    // adjust the touch area for the break apart button so that is is easy to touch but doesn't overlap other button
    var breakApartButtonTouchArea = breakApartButton.localBounds.copy();
    breakApartButtonTouchArea.minX = breakApartButtonTouchArea.minX - breakApartButton.width;
    breakApartButtonTouchArea.maxX = breakApartButtonTouchArea.maxX + BUTTON_SPACING * 0.3;
    breakApartButtonTouchArea.minY = breakApartButtonTouchArea.minY - breakApartButton.height;
    breakApartButton.touchArea = breakApartButtonTouchArea;

    // add the button used to put the expression into edit mode
    var editExpressionButton = new EditExpressionButton( { left: breakApartButton.right + BUTTON_SPACING } );
    popUpButtonsNode.addChild( editExpressionButton );

    // adjust the touch area for the edit button so that is is easy to touch but doesn't overlap other button
    var editExpressionButtonTouchArea = editExpressionButton.localBounds.copy();
    editExpressionButtonTouchArea.minX = editExpressionButtonTouchArea.minX - BUTTON_SPACING * 0.3;
    editExpressionButtonTouchArea.maxX = editExpressionButtonTouchArea.maxX + editExpressionButton.width;
    editExpressionButtonTouchArea.minY = editExpressionButtonTouchArea.minY - editExpressionButton.height;
    editExpressionButton.touchArea = editExpressionButtonTouchArea;

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
      }, EESharedConstants.POPUP_BUTTON_SHOW_TIME * 1000 );
    }

    // add a listener to the pop up button node to prevent it from disappearing if the user is hovering over it
    popUpButtonsNode.addInputListener( {
      enter: function() {
        if ( !expression.userControlledProperty.get() ){
          assert && assert( hideButtonsTimer !== null, 'hide button timer should be running if pop up buttons are visible' );
          clearHideButtonsTimer();
        }
      },
      exit: function() {
        if ( !expression.userControlledProperty.get() ) {
          startHideButtonsTimer();
        }
      }
    } );

    // add the listener that will initiate the break apart, and will also hide the buttons
    breakApartButton.addListener( function() {
      expression.breakApart();
      hidePopUpButtons();
      clearHideButtonsTimer();
    } );

    // add the listener that will put the expression into edit mode, and will also hide the buttons
    editExpressionButton.addListener( function() {
      expression.enterEditMode();
      hidePopUpButtons();
      clearHideButtonsTimer();
    } );

    // pre-allocated vectors, used for calculating allowable locations for the expression
    var unboundedUpperLeftCornerPosition = new Vector2();
    var boundedUpperLeftCornerPosition = new Vector2();

    // add the handler that will allow the expression to be dragged and will hide and show the buttons
    var dragHandler = new SimpleDragHandler( {

      allowTouchSnag: true,

      start: function( event ) {
        expression.userControlledProperty.set( true );
        unboundedUpperLeftCornerPosition.set( expression.upperLeftCornerProperty.get() );
        boundedUpperLeftCornerPosition.set( unboundedUpperLeftCornerPosition );
        clearHideButtonsTimer(); // in case it's running
        showPopUpButtons( self.globalToLocalPoint( event.pointer.point ).x );
      },

      translate: function( translationParams ) {

        // figure out where the expression would go if unbounded
        unboundedUpperLeftCornerPosition.setXY(
          unboundedUpperLeftCornerPosition.x + translationParams.delta.x,
          unboundedUpperLeftCornerPosition.y + translationParams.delta.y
        );

        // set the expression position, but bound it so the user doesn't drag it completely out of the usable area
        expression.setPositionAndDestination( new Vector2(
          Util.clamp(
            unboundedUpperLeftCornerPosition.x,
            layoutBounds.minX - expression.widthProperty.get() + MIN_EXPRESSION_IN_BOUNDS_WIDTH,
            layoutBounds.maxX - MIN_EXPRESSION_IN_BOUNDS_WIDTH
          ),
          Util.clamp(
            unboundedUpperLeftCornerPosition.y,
            layoutBounds.minY,
            layoutBounds.maxY - expression.heightProperty.get()
          )
        ) );
      },

      end: function() {
        expression.userControlledProperty.set( false );
        assert && assert( hideButtonsTimer === null, 'a timer for hiding the buttons was running at end of drag' );
        if ( breakApartButton.visible ) {
          startHideButtonsTimer();
        }
      }
    } );
    var dragHandlerAttached = false;

    // Helper function that adds the drag handler when we want this expression to be draggable and removes it when we
    // don't.  This is done instead of setting pickability because we need to prevent interaction with the coin terms
    // underneath this overlay node.
    function updateDragHandlerAttachmentState( inProgressAnimation, collected ) {
      if ( !dragHandlerAttached && inProgressAnimation === null && !collected ) {
        expressionShapeNode.addInputListener( dragHandler );
        dragHandlerAttached = true;
        self.cursor = 'pointer';
      }
      else if ( dragHandlerAttached && ( inProgressAnimation || collected ) ) {
        expressionShapeNode.removeInputListener( dragHandler );
        dragHandlerAttached = false;
        self.cursor = null;
      }
    }

    var updateDragHandlerAttachmentMultilink = Property.multilink(
      [ expression.inProgressAnimationProperty, expression.collectedProperty ],
      updateDragHandlerAttachmentState
    );

    // update popup button visibility whenever the expression is added to or removed from a collection area
    expression.collectedProperty.lazyLink( function( collected ) {
      if ( collected ) {
        hidePopUpButtons();
      }
    } );

    // create a dispose function
    this.disposeExpressionNode = function(){
      expression.upperLeftCornerProperty.unlink( updatePosition );
      expression.inProgressAnimationProperty.unlink( updateDragHandlerAttachmentState );
      expression.inEditModeProperty.unlink( updateVisibility );
      updateShapeMultilink.dispose();
      updateDragHandlerAttachmentMultilink.dispose();
    };
  }

  expressionExchange.register( 'ExpressionOverlayNode', ExpressionOverlayNode );

  return inherit( Node, ExpressionOverlayNode, {

    // @public
    dispose: function(){
      this.disposeExpressionNode();
      Node.prototype.dispose.call( this );
    }
  } );
} );