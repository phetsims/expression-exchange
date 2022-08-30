// Copyright 2016-2022, University of Colorado Boulder

/**
 * base type for the nodes that represent coin terms in the view, this exists primarily to avoid code duplication
 *
 * @author John Blanco
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import stepTimer from '../../../../axon/js/stepTimer.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { DragListener, Node, Rectangle } from '../../../../scenery/js/imports.js';
import expressionExchange from '../../expressionExchange.js';
import EESharedConstants from '../EESharedConstants.js';
import BreakApartButton from './BreakApartButton.js';

// constants
const BACKGROUND_CORNER_ROUNDING = 5;
const TOUCH_DRAG_OFFSET = new Vector2( 0, -30 ); // empirically determined

class AbstractCoinTermNode extends Node {

  /**
   * @param {CoinTerm} coinTerm - model of a coin term
   * @param {Object} [options]
   */
  constructor( coinTerm, options ) {

    options = merge( {
      addDragHandler: true,
      dragBounds: Bounds2.EVERYTHING,
      breakApartButtonMode: 'normal' // valid values are 'normal' and 'inverted'
    }, options );

    super( { pickable: true, cursor: 'pointer' } );

    // @public (read-only) {CoinTerm}
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

    // @private {String} - make option visible to methods
    this.breakApartButtonMode = options.breakApartButtonMode;

    // add a listener that will adjust opacity as existence strength changes
    const existenceStrengthListener = this.handleExistenceStrengthChanged.bind( this );
    coinTerm.existenceStrengthProperty.link( existenceStrengthListener );

    // @private {function} - timer callback will be used to hide the break apart button if user doesn't use it
    this.hideButtonTimer = null;

    // @private {BreakApartButton} - the button that will allow composite coins to be decomposed, added lazily in order
    // to conserve memory
    this.breakApartButton = null;

    // move this node as the model representation moves
    const handlePositionChanged = position => {

      // the intent here is to position the center of the coin at the position, NOT the center of the node
      this.translation = position;
    };

    coinTerm.positionProperty.link( handlePositionChanged );

    // add a listener for updating the break apart button state based on the user controlled state of this coin term
    const userControlledListener = this.handleUserControlledChanged.bind( this );
    coinTerm.userControlledProperty.lazyLink( userControlledListener );

    // add a listener to handle changes to the 'break apart allowed' state
    const breakApartAllowedListener = this.handleBreakApartAllowedChanged.bind( this );
    coinTerm.breakApartAllowedProperty.link( breakApartAllowedListener );

    // add a drag handler if specified
    if ( options.addDragHandler ) {
      this.addDragHandler( options.dragBounds );
    }

    // add a listener that will pop this node to the front when selected by the user
    coinTerm.userControlledProperty.link( userControlled => {
      if ( userControlled ) {
        this.moveToFront();
      }
    } );

    // add a listener that will pop this node to the front when another coin term is combined with it
    const totalCountListener = this.handleCombinedCountChanged.bind( this );
    coinTerm.totalCountProperty.link( totalCountListener );

    // function to update the pickability as the states change
    const updatePickability = () => {

      // There is some rare race condition where the code below was being called after the node was disposed.  I
      // (jbphet) was never able to track it down, largely because it was so hard to reproduce, so I just added the
      // 'if' statement as a guard.  See https://github.com/phetsims/expression-exchange/issues/147.
      if ( !this.isDisposed ) {
        const expression = coinTerm.expressionProperty.get();
        this.pickable = ( expression === null || expression.inEditModeProperty.get() )
                        && !coinTerm.inProgressAnimationProperty.get() && !coinTerm.collectedProperty.get();
      }
    };

    // update the pickability of this node
    const pickabilityUpdaterMultilink = Multilink.multilink(
      [ coinTerm.expressionProperty, coinTerm.inProgressAnimationProperty, coinTerm.collectedProperty ],
      updatePickability
    );

    // Hook up a listener that will allow the coin term to be pickable if the expression that it is in transitions into
    // edit mode.
    coinTerm.expressionProperty.link( ( expression, previousExpression ) => {
      if ( expression ) {
        expression.inEditModeProperty.link( updatePickability );
      }
      if ( previousExpression && previousExpression.inEditModeProperty.hasListener( updatePickability ) ) {
        previousExpression.inEditModeProperty.unlink( updatePickability );
      }
    } );

    // @private - internal dispose function
    this.disposeAbstractCoinTermNode = () => {
      this.clearHideButtonTimer();
      if ( this.breakApartButton ) {
        this.breakApartButton.buttonModel.looksOverProperty.unlink( this.breakApartButtonOverListener );
        this.breakApartButton.removeListener( this.breakApartButtonListener );
        this.breakApartButton.dispose();
      }
      coinTerm.positionProperty.unlink( handlePositionChanged );
      coinTerm.existenceStrengthProperty.unlink( existenceStrengthListener );
      coinTerm.userControlledProperty.unlink( userControlledListener );
      coinTerm.breakApartAllowedProperty.unlink( breakApartAllowedListener );
      coinTerm.totalCountProperty.unlink( totalCountListener );
      if ( coinTerm.expressionProperty.value ) {
        coinTerm.expressionProperty.value.inEditModeProperty.unlink( updatePickability );
      }
      pickabilityUpdaterMultilink.dispose();
      this.removeAllChildren();
    };

    this.mutate( options );
  }

  // add a listener that will update the opacity based on the coin term's existence strength
  /**
   * listener function that will adjust opacity as existence strength changes
   * @param existenceStrength
   * @private
   */
  handleExistenceStrengthChanged( existenceStrength ) {
    assert && assert( existenceStrength >= 0 && existenceStrength <= 1, 'existence strength must be between 0 and 1' );
    if ( !this.isDisposed ) {
      this.pickable = existenceStrength === 1; // prevent interaction with fading coin term
      this.opacity = existenceStrength;
    }
  }

  /**
   * @private
   */
  clearHideButtonTimer() {
    if ( this.hideButtonTimer ) {
      stepTimer.clearTimeout( this.hideButtonTimer );
      this.hideButtonTimer = null;
    }
  }

  /**
   * start the timer for hiding the break-apart button
   * @private
   */
  startHideButtonTimer() {
    this.clearHideButtonTimer(); // just in case one is already running
    this.hideButtonTimer = stepTimer.setTimeout( () => {
      this.hideBreakApartButton();
      this.hideButtonTimer = null;
    }, EESharedConstants.POPUP_BUTTON_SHOW_TIME * 1000 );
  }

  /**
   * position and show the break apart button
   * @private
   */
  showBreakApartButton() {
    if ( !this.breakApartButton ) {
      this.addBreakApartButton();
    }
    this.breakApartButton.centerX = 0;
    this.breakApartButton.bottom = this.coinAndTextRootNode.visibleLocalBounds.minY - 3; // just above the coin term
    this.breakApartButton.visible = true;
  }

  /**
   * position the break apart button such that the bounds are within the bounds of the coin term node and hide it
   * @private
   */
  hideBreakApartButton() {
    if ( this.breakApartButton ) {
      this.breakApartButton.center = Vector2.ZERO; // position within coin term so bounds aren't affected
      this.breakApartButton.visible = false;
    }
  }

  /**
   * add the break apart button, generally not done until needed in order to conserve memory
   * @private
   */
  addBreakApartButton() {

    this.breakApartButton = new BreakApartButton( { visible: false, mode: this.breakApartButtonMode } );

    // Add the button outside of the root coin-and-text node so that it isn't included in the bounds that are shared
    // with the model.
    this.addChild( this.breakApartButton );

    // adjust the touch area of the break apart button to make it easier to use on touch devices
    this.breakApartButton.touchArea = this.breakApartButton.localBounds.dilatedX( this.breakApartButton.width / 2 )
      .withOffsets( 0, this.breakApartButton.height, 0, 0 );

    this.breakApartButtonListener = this.handleBreakApartButtonPressed.bind( this ); // @private, needed for disposal
    this.breakApartButton.addListener( this.breakApartButtonListener );

    // add a listener for changes to the 'break apart allowed' state
    this.breakApartButtonOverListener = this.handleOverBreakApartButtonChanged.bind( this ); // @private, needed for disposal
    this.breakApartButton.buttonModel.looksOverProperty.lazyLink( this.breakApartButtonOverListener );
  }

  /**
   * listener for the 'over' state of the break-apart button
   * @param {boolean} overButton
   * @private
   */
  handleOverBreakApartButtonChanged( overButton ) {

    // make sure the coin term isn't user controlled (this helps prevent some multi-touch problems)
    if ( !this.coinTerm.userControlledProperty.get() ) {
      if ( overButton ) {

        // the mouse just moved over the button, so stop the timer in order to make sure the button stays visible
        assert && assert( !!this.hideButtonTimer, 'hide button timer should be running' );
        this.clearHideButtonTimer();
      }
      else {

        // the mouse just moved away from the button, so start a timer to hide it
        this.startHideButtonTimer();
      }
    }
  }

  /**
   * listener that updates the state of the break-apart button when the user controlled state of the coin term changes
   * @param {boolean} userControlled
   * @private
   */
  handleUserControlledChanged( userControlled ) {
    if ( Math.abs( this.coinTerm.composition.length ) > 1 &&
         this.coinTerm.breakApartAllowedProperty.get() &&
         !this.isDisposed ) {

      if ( userControlled ) {
        this.clearHideButtonTimer(); // called in case the timer was running
        this.showBreakApartButton();
      }
      else if ( this.breakApartButton && this.breakApartButton.visible ) {

        // the userControlled flag transitioned to false while the button was visible, start the time to hide it
        this.startHideButtonTimer();
      }
    }
  }

  /**
   * listener that updates the state of the break-apart button when the breakApartAllowed state changes
   * @param {boolean} breakApartAllowed
   * @private
   */
  handleBreakApartAllowedChanged( breakApartAllowed ) {
    if ( this.breakApartButton && this.breakApartButton.visible && !breakApartAllowed ) {
      this.clearHideButtonTimer();
      this.hideBreakApartButton();
    }
  }

  /**
   * listener for handling changes to the combined count (i.e. the number of coin terms combined together)
   * @param {number} newCount
   * @param {number} oldCount
   * @private
   */
  handleCombinedCountChanged( newCount, oldCount ) {
    if ( newCount > oldCount ) {
      this.moveToFront();
    }

    if ( this.breakApartButton && this.breakApartButton.visible && Math.abs( newCount ) < 2 ) {

      // if combined count was reduced through cancellation while the break apart button was visible, hide it, see
      // https://github.com/phetsims/expression-exchange/issues/29
      this.hideBreakApartButton();
    }
  }

  /**
   * handler for pressing of the break apart button
   * @private
   */
  handleBreakApartButtonPressed() {

    // Interrupt any dragging that is in progress, which helps to prevent weird multi-touch problems.  See
    // https://github.com/phetsims/expression-exchange/issues/151.
    this.coinAndTextRootNode.interruptInput();

    // Break this composite coin term into separate ones.
    this.coinTerm.breakApart();

    // Hide the button, since it must have been pressed to get here.
    this.hideBreakApartButton();

    // Cancel timer (if running).
    this.clearHideButtonTimer();
  }

  /**
   * add a drag handler
   * {Bounds2} dragBounds
   * @private
   */
  addDragHandler( dragBounds ) {

    // Create a position property and link it to the coin term, necessary because coin term has both position and
    // destination properties, both of which must be set when dragging occurs.
    const coinTermPositionAndDestinationProperty = new Property( this.coinTerm.positionProperty.get() );
    coinTermPositionAndDestinationProperty.lazyLink( positionAndDestination => {
      this.coinTerm.setPositionAndDestination( positionAndDestination );
    } );

    // @public - drag handler, public in support of event forwarding from creator nodes
    this.dragHandler = new DragListener( {

      positionProperty: coinTermPositionAndDestinationProperty,

      // allow moving a finger (touch) across a node to pick it up
      allowTouchSnag: true,

      // bound the area where the coin terms can go
      dragBoundsProperty: new Property( dragBounds ),

      // set the target node so that DragListener knows where to get the coordinate transform, supports event
      // forwarding
      targetNode: this,

      // Offset the position a little if this is a touch pointer so that the finger doesn't cover the coin term.
      offsetPosition: ( viewPoint, dragListener ) => {
        return dragListener.pointer.isTouchLike() ? TOUCH_DRAG_OFFSET : Vector2.ZERO;
      },

      start: () => {
        this.coinTerm.userControlledProperty.set( true );
      },

      end: () => {
        this.coinTerm.userControlledProperty.set( false );
      }
    } );

    // Add the listener that will allow the user to drag the coin around.  This is added only to the node that
    // contains the term elements, not the button, so that the button won't affect userControlled or be draggable.
    this.coinAndTextRootNode.addInputListener( this.dragHandler );
  }

  /**
   * @public
   */
  dispose() {
    this.disposeAbstractCoinTermNode();
    super.dispose();
  }

}


// statics

// @public {number} - To look correct in equations, the text all needs to be on the same baseline.  The value was
// empirically determined and may need to change if font sizes change.
AbstractCoinTermNode.TEXT_BASELINE_Y_OFFSET = 12;

// @public {number} - Height of the background cards - these are fixed so that stacks of them that are side-by-side
// look good.  The values were empirically determined.
AbstractCoinTermNode.BACKGROUND_CARD_HEIGHT_TEXT_MODE = 70;
AbstractCoinTermNode.BACKGROUND_CARD_HEIGHT_COIN_MODE = 70;

// @public {number} - horizontal margin for card background
AbstractCoinTermNode.BACKGROUND_CARD_X_MARGIN = 15;

expressionExchange.register( 'AbstractCoinTermNode', AbstractCoinTermNode );

export default AbstractCoinTermNode;