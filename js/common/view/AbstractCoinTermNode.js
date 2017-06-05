// Copyright 2016, University of Colorado Boulder

/**
 * base type for the nodes that represent coin terms in the view, this exists primarily to avoid code duplication
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var BreakApartButton = require( 'EXPRESSION_EXCHANGE/common/view/BreakApartButton' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Timer = require( 'PHET_CORE/Timer' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var BACKGROUND_CORNER_ROUNDING = 5;
  var TOUCH_DRAG_Y_OFFSET = -30; // empirically determined

  /**
   * @param {CoinTerm} coinTerm - model of a coin term
   * @param {Object} [options]
   * @constructor
   */
  function AbstractCoinTermNode( coinTerm, options ) {
    //REVIEW: Would highly recommend changing this to set more properties on the object and used methods.
    // A 240+ line constructor with 12 functions that would be methods typically would be cleaner if broken up.

    options = _.extend( {
      addDragHandler: true,
      dragBounds: Bounds2.EVERYTHING,
      breakApartButtonMode: 'normal'
    }, options );

    var self = this;
    Node.call( this, { pickable: true, cursor: 'pointer' } );

    // @public {CoinTerm} (read only)
    this.coinTerm = coinTerm;

    // @protected {Rectangle}
    // Add the card-like background, initially tiny, will be set in subclasses by function that updates the
    // representation.
    this.cardLikeBackground = new Rectangle( -1, -1, 2, 2, {
      fill: EESharedConstants.CARD_BACKGROUND_COLOR,
      stroke: 'black',
      cornerRadius: BACKGROUND_CORNER_ROUNDING,
      visible: false
    } );
    this.addChild( this.cardLikeBackground );

    // @protected {Node}
    // Add a root node so that the bounds can be easily monitored for changes in size without getting triggered by
    // changes in position.
    this.coinAndTextRootNode = new Node();
    this.addChild( this.coinAndTextRootNode );

    // add a listener that will update the opacity based on the coin term's existence strength
    function handleExistenceStrengthChanged( existenceStrength ) {
      assert && assert( existenceStrength >= 0 && existenceStrength <= 1, 'existence strength must be between 0 and 1' );
      self.opacity = existenceStrength;
      self.pickable = existenceStrength === 1; // prevent interaction with fading coin term
    }

    coinTerm.existenceStrengthProperty.link( handleExistenceStrengthChanged );

    // timer that will be used to hide the break apart button if user doesn't use it
    var hideButtonTimer = null;

    // Add the button that will allow composite coins to be decomposed.  This is done outside of the root node so that
    // it doesn't affect the bounds used in the model.
    var breakApartButton = new BreakApartButton( { visible: false, mode: options.breakApartButtonMode } );
    this.addChild( breakApartButton );

    // adjust the touch area of the break apart button to make it easier to use on touch devices
    breakApartButton.touchArea = breakApartButton.localBounds.dilatedX( breakApartButton.width / 2 )
      .withOffsets( 0, breakApartButton.height, 0, 0 );

    // define helper functions for managing the button timers
    function clearHideButtonTimer() {
      if ( hideButtonTimer ) {
        Timer.clearTimeout( hideButtonTimer );
        hideButtonTimer = null;
      }
    }

    function startHideButtonTimer() {
      clearHideButtonTimer(); // just in case one is already running
      hideButtonTimer = Timer.setTimeout( function() {
        hideBreakApartButton();
        hideButtonTimer = null;
      }, EESharedConstants.POPUP_BUTTON_SHOW_TIME * 1000 );
    }

    // add the listener to the break apart button
    breakApartButton.addListener( function() {
      coinTerm.breakApart();

      // hide the button after clicking
      hideBreakApartButton();

      // cancel timer if running
      clearHideButtonTimer();
    } );

    // keep the button showing if the user is over it
    function handleOverBreakApartButtonChanged( overButton ) {

      // make sure the coin terms isn't user controlled (this helps prevent some multi-touch problems)
      if ( !coinTerm.userControlledProperty.get() ) {
        if ( overButton ) {

          // the mouse just moved over the button, so stop the timer in order to make sure the button stays visible
          assert && assert( !!hideButtonTimer, 'hide button timer should be running' );
          clearHideButtonTimer();
        }
        else {

          // the mouse just moved away from the button, so start a timer to hide it
          startHideButtonTimer();
        }
      }
    }

    breakApartButton.buttonModel.overProperty.lazyLink( handleOverBreakApartButtonChanged );

    // define a function that will position and show the break apart button
    function showBreakApartButton() {
      breakApartButton.centerX = 0;
      breakApartButton.bottom = self.coinAndTextRootNode.visibleLocalBounds.minY - 3; // just above the coin term
      breakApartButton.visible = true;
    }

    // define a function that will position and hide the break apart button
    function hideBreakApartButton() {
      breakApartButton.center = Vector2.ZERO; // position within coin term so bounds aren't affected
      breakApartButton.visible = false;
    }

    // move this node as the model representation moves
    function handlePositionChanged( position ) {
      // the intent here is to position the center of the coin at the position, NOT the center of the node
      self.translation = position;
    }

    coinTerm.positionProperty.link( handlePositionChanged );

    // update the state of the break apart button when the userControlled state changes
    function handleUserControlledChanged( userControlled ) {
      if ( Math.abs( coinTerm.composition.length ) > 1 && coinTerm.breakApartAllowedProperty.get() ) {

        if ( userControlled ) {
          clearHideButtonTimer(); // called in case the timer was running
          showBreakApartButton();
        }
        else if ( breakApartButton.visible ) {

          // the userControlled flag transitioned to false while the button was visible, start the time to hide it
          startHideButtonTimer();
        }
      }
    }

    coinTerm.userControlledProperty.lazyLink( handleUserControlledChanged );

    // hide the break apart button if break apart becomes disabled, generally if the coin term joins an expression
    function handleBreakApartAllowedChanged( breakApartAllowed ) {
      if ( breakApartButton.visible && !breakApartAllowed ) {
        clearHideButtonTimer();
        hideBreakApartButton();
      }
    }

    coinTerm.breakApartAllowedProperty.link( handleBreakApartAllowedChanged );

    if ( options.addDragHandler ) {

      // create a position property and link it to the coin term, necessary because coin term has both position and
      // destination properties, both of which must be set when dragging occurs
      var coinTermPositionAndDestination = new Property( coinTerm.positionProperty.get() );
      coinTermPositionAndDestination.lazyLink( function( positionAndDestination ) {
        coinTerm.setPositionAndDestination( positionAndDestination );
      } );

      // @public - drag handler, public in support of even forwarding from creator nodes
      this.dragHandler = new MovableDragHandler( coinTermPositionAndDestination, {

        // allow moving a finger (touch) across a node to pick it up
        allowTouchSnag: true,

        // bound the area where the coin terms can go
        dragBounds: options.dragBounds,

        // set the target node so that MovableDragHandler knows where to get the coordinate transform, supports event
        // forwarding
        targetNode: this,

        startDrag: function( event ) {

          // offset things a little in touch mode for better visibility while dragging
          if ( event.pointer.isTouch ) {
            var position = self.globalToParentPoint( event.pointer.point );
            coinTermPositionAndDestination.set( position.plusXY( 0, TOUCH_DRAG_Y_OFFSET ) );
          }
          else {
            coinTermPositionAndDestination.set( coinTerm.positionProperty.get() );
          }
          coinTerm.userControlledProperty.set( true );
        },

        endDrag: function() {
          coinTerm.userControlledProperty.set( false );
        }
      } );

      // Add the listener that will allow the user to drag the coin around.  This is added only to the node that
      // contains the term elements, not the button, so that the button won't affect userControlled or be draggable.
      this.coinAndTextRootNode.addInputListener( this.dragHandler );
    }

    // add a listener that will pop this node to the front when selected by the user
    coinTerm.userControlledProperty.onValue( true, function() { self.moveToFront(); } );

    // add a listener that will pop this node to the front when another coin term is combined with it
    function handleCombinedCountChanged( newCount, oldCount ) {
      if ( newCount > oldCount ) {
        self.moveToFront();
      }

      if ( breakApartButton.visible && Math.abs( newCount ) < 2 ) {

        // if combined count was reduced through cancellation while the break apart button was visible, hide it, see
        // https://github.com/phetsims/expression-exchange/issues/29
        hideBreakApartButton();
      }
    }

    coinTerm.totalCountProperty.link( handleCombinedCountChanged );

    // Add a listener that will make this node non-pickable when animating or when collected.  Doing this when
    // animating prevents a number of multi-touch issues.
    function updatePickability() {
      self.pickable = ( coinTerm.inProgressAnimationProperty.get() === null && !coinTerm.collectedProperty.get() );
    }

    coinTerm.inProgressAnimationProperty.link( updatePickability );
    coinTerm.collectedProperty.link( updatePickability );

    // internal dispose function, reference in inherit block
    this.disposeAbstractCoinTermNode = function() {
      coinTerm.positionProperty.unlink( handlePositionChanged );
      coinTerm.existenceStrengthProperty.unlink( handleExistenceStrengthChanged );
      breakApartButton.buttonModel.overProperty.unlink( handleOverBreakApartButtonChanged );
      coinTerm.userControlledProperty.unlink( handleUserControlledChanged );
      coinTerm.breakApartAllowedProperty.unlink( handleBreakApartAllowedChanged );
      coinTerm.totalCountProperty.unlink( handleCombinedCountChanged );
      coinTerm.inProgressAnimationProperty.unlink( updatePickability );
    };

    this.mutate( options );
  }

  expressionExchange.register( 'AbstractCoinTermNode', AbstractCoinTermNode );

  return inherit( Node, AbstractCoinTermNode, {

    // @public
    dispose: function() {
      this.disposeAbstractCoinTermNode();
      Node.prototype.dispose.call( this );
    }
  }, {

    // To look correct in equations, the text all needs to be on the same baseline.  The value was empirically
    // determined and may need to change if font sizes change.
    TEXT_BASELINE_Y_OFFSET: 12
  } );
} );