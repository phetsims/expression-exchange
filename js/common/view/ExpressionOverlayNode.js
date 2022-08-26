// Copyright 2016-2022, University of Colorado Boulder

/**
 * a node that is placed on the top layer of an expression to allow it to be dragged and to prevent input events from
 * getting to the constituents of the expression
 *
 * @author John Blanco
 */

import Multilink from '../../../../axon/js/Multilink.js';
import stepTimer from '../../../../axon/js/stepTimer.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { DragListener, Node, Path } from '../../../../scenery/js/imports.js';
import expressionExchange from '../../expressionExchange.js';
import EESharedConstants from '../EESharedConstants.js';
import BreakApartButton from './BreakApartButton.js';
import EditExpressionButton from './EditExpressionButton.js';

// constants
const MIN_EXPRESSION_IN_BOUNDS_WIDTH = 70; // in screen coords, min horizontal amount of expression that must stay in bounds
const BUTTON_SPACING = 11; // in screen coordinates

class ExpressionOverlayNode extends Node {

  /**
   * @param {Expression} expression - model of an expression
   * @param {Bounds2} layoutBounds - bounds of the main view layout
   */
  constructor( expression, layoutBounds ) {

    super( { pickable: true, cursor: 'pointer' } );
    const self = this;

    // shape and path for the overlay
    const expressionShapeNode = new Path( null, { fill: 'transparent' } ); // essentially invisible
    this.addChild( expressionShapeNode );

    // update the shape if the height or width change
    const updateShapeMultilink = Multilink.multilink(
      [ expression.widthProperty, expression.heightProperty ],
      () => {
        expressionShapeNode.shape = Shape.rect( 0, 0, expression.widthProperty.get(), expression.heightProperty.get() );
      }
    );

    // update the expression's position as this node moves
    const translationLinkHandle = position => {this.translation = position;};
    expression.upperLeftCornerProperty.link( translationLinkHandle );

    // become invisible if the expression goes into edit mode so that the user can interact with the coin terms within
    function updateVisibility( inEditMode ) {
      self.visible = !inEditMode;
    }

    expression.inEditModeProperty.link( updateVisibility );

    // add the parent node that will contain the pop-up buttons
    this.popUpButtonsNode = new Node( { visible: false } ); // @private
    this.addChild( this.popUpButtonsNode );

    // add the button used to break apart the expression
    const breakApartButton = new BreakApartButton();
    this.popUpButtonsNode.addChild( breakApartButton );

    // adjust the touch area for the break apart button so that is is easy to touch but doesn't overlap other button
    const breakApartButtonTouchArea = breakApartButton.localBounds.copy();
    breakApartButtonTouchArea.minX = breakApartButtonTouchArea.minX - breakApartButton.width;
    breakApartButtonTouchArea.maxX = breakApartButtonTouchArea.maxX + BUTTON_SPACING * 0.3;
    breakApartButtonTouchArea.minY = breakApartButtonTouchArea.minY - breakApartButton.height;
    breakApartButton.touchArea = breakApartButtonTouchArea;

    // add the button used to put the expression into edit mode
    const editExpressionButton = new EditExpressionButton( { left: breakApartButton.right + BUTTON_SPACING } );
    this.popUpButtonsNode.addChild( editExpressionButton );

    // adjust the touch area for the edit button so that is is easy to touch but doesn't overlap other button
    const editExpressionButtonTouchArea = editExpressionButton.localBounds.copy();
    editExpressionButtonTouchArea.minX = editExpressionButtonTouchArea.minX - BUTTON_SPACING * 0.3;
    editExpressionButtonTouchArea.maxX = editExpressionButtonTouchArea.maxX + editExpressionButton.width;
    editExpressionButtonTouchArea.minY = editExpressionButtonTouchArea.minY - editExpressionButton.height;
    editExpressionButton.touchArea = editExpressionButtonTouchArea;

    // @private {function} - timer used to hide the button
    this.hideButtonsTimerCallback = null;

    // add a listener to the pop up button node to prevent it from disappearing if the user is hovering over it
    this.popUpButtonsNode.addInputListener( {
      enter: () => {
        if ( !expression.userControlledProperty.get() ) {
          this.clearHideButtonsTimer();
        }
      },
      exit: () => {
        if ( !expression.userControlledProperty.get() ) {
          this.startHideButtonsTimer();
        }
      }
    } );

    // add the listener that will initiate the break apart, and will also hide the buttons
    breakApartButton.addListener( () => {
      expression.breakApart();
      this.hidePopUpButtons();
      this.clearHideButtonsTimer();
    } );

    // add the listener that will put the expression into edit mode, and will also hide the buttons
    editExpressionButton.addListener( () => {

      if ( !expression.userControlledProperty.get() ) {
        expression.inEditModeProperty.set( true );
        this.hidePopUpButtons();
        this.clearHideButtonsTimer();
      }
    } );

    // pre-allocated vectors, used for calculating allowable positions for the expression
    const unboundedUpperLeftCornerPosition = Vector2.ZERO.copy();
    const boundedUpperLeftCornerPosition = Vector2.ZERO.copy();
    const dragOffset = Vector2.ZERO.copy();

    // add the handler that will allow the expression to be dragged and will hide and show the buttons
    const dragListener = new DragListener( {

      allowTouchSnag: true,

      start: event => {
        expression.userControlledProperty.set( true );
        unboundedUpperLeftCornerPosition.set( expression.upperLeftCornerProperty.value );
        boundedUpperLeftCornerPosition.set( unboundedUpperLeftCornerPosition );
        dragOffset.set( this.globalToParentPoint( event.pointer.point ).minus( expression.upperLeftCornerProperty.value ) );
        this.clearHideButtonsTimer(); // in case it's running
        this.showPopUpButtons( this.globalToLocalPoint( event.pointer.point ).x );
      },

      drag: event => {

        // figure out where the expression would go if unbounded
        unboundedUpperLeftCornerPosition.set( this.globalToParentPoint( event.pointer.point ).minus( dragOffset ) );

        // set the expression position, but bound it so the user doesn't drag it completely out of the usable area
        expression.setPositionAndDestination( new Vector2(
          Utils.clamp(
            unboundedUpperLeftCornerPosition.x,
            layoutBounds.minX - expression.widthProperty.get() + MIN_EXPRESSION_IN_BOUNDS_WIDTH,
            layoutBounds.maxX - MIN_EXPRESSION_IN_BOUNDS_WIDTH
          ),
          Utils.clamp(
            unboundedUpperLeftCornerPosition.y,
            layoutBounds.minY,
            layoutBounds.maxY - expression.heightProperty.get()
          )
        ) );
      },

      end: () => {
        expression.userControlledProperty.set( false );
        assert && assert( this.hideButtonsTimerCallback === null, 'a timer for hiding the buttons was running at end of drag' );
        if ( breakApartButton.visible ) {
          this.startHideButtonsTimer();
        }
      }
    } );
    let dragHandlerAttached = false;

    // Helper function that adds the drag handler when we want this expression to be draggable and removes it when we
    // don't.  This is done instead of setting pickability because we need to prevent interaction with the coin terms
    // underneath this overlay node.
    function updateDragHandlerAttachmentState( inProgressAnimation, collected ) {
      if ( !dragHandlerAttached && inProgressAnimation === null && !collected ) {
        expressionShapeNode.addInputListener( dragListener );
        dragHandlerAttached = true;
        self.cursor = 'pointer';
      }
      else if ( dragHandlerAttached && ( inProgressAnimation || collected ) ) {
        expressionShapeNode.removeInputListener( dragListener );
        dragListener.clearOverPointers(); // done so that state errors don't occur when added back, see #146
        dragHandlerAttached = false;
        self.cursor = null;
      }
    }

    const updateDragHandlerAttachmentMultilink = Multilink.multilink(
      [ expression.inProgressAnimationProperty, expression.collectedProperty ],
      updateDragHandlerAttachmentState
    );

    // update popup button visibility whenever the expression is added to or removed from a collection area
    expression.collectedProperty.lazyLink( collected => {
      if ( collected ) {
        this.hidePopUpButtons();
      }
    } );

    // create a dispose function
    this.disposeExpressionOverlayNode = () => {
      editExpressionButton.dispose();
      breakApartButton.dispose();
      expression.upperLeftCornerProperty.unlink( translationLinkHandle );
      expression.inEditModeProperty.unlink( updateVisibility );
      updateShapeMultilink.dispose();
      updateDragHandlerAttachmentMultilink.dispose();
    };
  }

  /**
   * @param {number} xPosition
   * @private
   */
  showPopUpButtons( xPosition ) {
    this.popUpButtonsNode.visible = true;
    this.popUpButtonsNode.centerX = xPosition;
    this.popUpButtonsNode.bottom = -2;
  }

  /**
   * @private
   */
  hidePopUpButtons() {
    this.popUpButtonsNode.visible = false;
    this.popUpButtonsNode.translation = Vector2.ZERO;
  }

  /**
   * clear the button used to hide the timer
   * @private
   */
  clearHideButtonsTimer() {
    if ( this.hideButtonsTimerCallback ) {
      stepTimer.clearTimeout( this.hideButtonsTimerCallback );
      this.hideButtonsTimerCallback = null;
    }
  }

  /**
   * @private
   */
  startHideButtonsTimer() {
    this.clearHideButtonsTimer(); // just in case one is already running
    this.hideButtonsTimerCallback = stepTimer.setTimeout( () => {
      this.hidePopUpButtons();
      this.hideButtonsTimerCallback = null;
    }, EESharedConstants.POPUP_BUTTON_SHOW_TIME * 1000 );
  }

  // @public
  dispose() {
    this.disposeExpressionOverlayNode();
    super.dispose();
  }
}

expressionExchange.register( 'ExpressionOverlayNode', ExpressionOverlayNode );

export default ExpressionOverlayNode;
