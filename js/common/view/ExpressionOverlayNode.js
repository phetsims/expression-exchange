// Copyright 2016-2019, University of Colorado Boulder

/**
 * a node that is placed on the top layer of an expression to allow it to be dragged and to prevent input events from
 * getting to the constituents of the expression
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const BreakApartButton = require( 'EXPRESSION_EXCHANGE/common/view/BreakApartButton' );
  const EditExpressionButton = require( 'EXPRESSION_EXCHANGE/common/view/EditExpressionButton' );
  const EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Property = require( 'AXON/Property' );
  const Shape = require( 'KITE/Shape' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const timer = require( 'AXON/timer' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const MIN_EXPRESSION_IN_BOUNDS_WIDTH = 70; // in screen coords, min horizontal amount of expression that must stay in bounds
  const BUTTON_SPACING = 11; // in screen coordinates

  /**
   * @param {Expression} expression - model of an expression
   * @param {Bounds2} layoutBounds - bounds of the main view layout
   * @constructor
   */
  function ExpressionOverlayNode( expression, layoutBounds ) {

    Node.call( this, { pickable: true, cursor: 'pointer' } );
    const self = this;

    // shape and path for the overlay
    const expressionShapeNode = new Path( null, { fill: 'transparent' } ); // essentially invisible
    this.addChild( expressionShapeNode );

    // update the shape if the height or width change
    const updateShapeMultilink = Property.multilink(
      [ expression.widthProperty, expression.heightProperty ],
      function() {
        expressionShapeNode.shape = new Shape.rect( 0, 0, expression.widthProperty.get(), expression.heightProperty.get() );
      }
    );

    // update the expression's position as this node moves
    const translationLinkHandle = expression.upperLeftCornerProperty.linkAttribute( this, 'translation' );

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
      enter: function() {
        if ( !expression.userControlledProperty.get() ) {
          self.clearHideButtonsTimer();
        }
      },
      exit: function() {
        if ( !expression.userControlledProperty.get() ) {
          self.startHideButtonsTimer();
        }
      }
    } );

    // add the listener that will initiate the break apart, and will also hide the buttons
    breakApartButton.addListener( function() {
      expression.breakApart();
      self.hidePopUpButtons();
      self.clearHideButtonsTimer();
    } );

    // add the listener that will put the expression into edit mode, and will also hide the buttons
    editExpressionButton.addListener( function() {

      if ( !expression.userControlledProperty.get() ) {
        expression.inEditModeProperty.set( true );
        self.hidePopUpButtons();
        self.clearHideButtonsTimer();
      }
    } );

    // pre-allocated vectors, used for calculating allowable locations for the expression
    const unboundedUpperLeftCornerPosition = new Vector2( 0, 0 );
    const boundedUpperLeftCornerPosition = new Vector2( 0, 0 );

    // add the handler that will allow the expression to be dragged and will hide and show the buttons
    const dragHandler = new SimpleDragHandler( {

      allowTouchSnag: true,

      start: function( event ) {
        expression.userControlledProperty.set( true );
        unboundedUpperLeftCornerPosition.set( expression.upperLeftCornerProperty.get() );
        boundedUpperLeftCornerPosition.set( unboundedUpperLeftCornerPosition );
        self.clearHideButtonsTimer(); // in case it's running
        self.showPopUpButtons( self.globalToLocalPoint( event.pointer.point ).x );
      },

      translate: function( translationParams ) {

        // figure out where the expression would go if unbounded
        unboundedUpperLeftCornerPosition.add( translationParams.delta );

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
        assert && assert( self.hideButtonsTimerCallback === null, 'a timer for hiding the buttons was running at end of drag' );
        if ( breakApartButton.visible ) {
          self.startHideButtonsTimer();
        }
      }
    } );
    let dragHandlerAttached = false;

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

    const updateDragHandlerAttachmentMultilink = Property.multilink(
      [ expression.inProgressAnimationProperty, expression.collectedProperty ],
      updateDragHandlerAttachmentState
    );

    // update popup button visibility whenever the expression is added to or removed from a collection area
    expression.collectedProperty.lazyLink( function( collected ) {
      if ( collected ) {
        self.hidePopUpButtons();
      }
    } );

    // create a dispose function
    this.disposeExpressionOverlayNode = function() {
      editExpressionButton.dispose();
      breakApartButton.dispose();
      expression.upperLeftCornerProperty.unlinkAttribute( translationLinkHandle );
      expression.inEditModeProperty.unlink( updateVisibility );
      updateShapeMultilink.dispose();
      updateDragHandlerAttachmentMultilink.dispose();
    };
  }

  expressionExchange.register( 'ExpressionOverlayNode', ExpressionOverlayNode );

  return inherit( Node, ExpressionOverlayNode, {

    /**
     * @param {number} xLocation
     * @private
     */
    showPopUpButtons: function( xLocation ) {
      this.popUpButtonsNode.visible = true;
      this.popUpButtonsNode.centerX = xLocation;
      this.popUpButtonsNode.bottom = -2;
    },

    /**
     * @param {number} xLocation
     * @private
     */
    hidePopUpButtons: function() {
      this.popUpButtonsNode.visible = false;
      this.popUpButtonsNode.translation = Vector2.ZERO;
    },

    /**
     * clear the button used to hide the timer
     * @private
     */
    clearHideButtonsTimer: function() {
      if ( this.hideButtonsTimerCallback ) {
        timer.clearTimeout( this.hideButtonsTimerCallback );
        this.hideButtonsTimerCallback = null;
      }
    },

    startHideButtonsTimer: function() {
      const self = this;
      this.clearHideButtonsTimer(); // just in case one is already running
      this.hideButtonsTimerCallback = timer.setTimeout( function() {
        self.hidePopUpButtons();
        self.hideButtonsTimerCallback = null;
      }, EESharedConstants.POPUP_BUTTON_SHOW_TIME * 1000 );
    },

    // @public
    dispose: function() {
      this.disposeExpressionOverlayNode();
      Node.prototype.dispose.call( this );
    }
  } );
} );