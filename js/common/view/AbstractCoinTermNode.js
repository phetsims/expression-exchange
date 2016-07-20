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
  var Node = require( 'SCENERY/nodes/Node' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Timer = require( 'PHET_CORE/Timer' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {CoinTerm} coinTerm - model of a coin term
   * @param {Object} options
   * @constructor
   */
  function AbstractCoinTermNode( coinTerm, options ) {

    options = _.extend( {}, {
      addDragHandler: true,
      dragBounds: Bounds2.EVERYTHING
    }, options );

    var self = this;
    Node.call( this, { pickable: true, cursor: 'pointer' } );

    // Add a root node so that the bounds can be easily monitored for changes in size without getting triggered by
    // changes in position.
    this.coinAndTextRootNode = new Node();
    this.addChild( this.coinAndTextRootNode );

    // add a listener that will update the opacity based on the coin term's existence strength
    coinTerm.existenceStrengthProperty.link( function( existenceStrength ){
      assert && assert( existenceStrength >= 0 && existenceStrength <= 1, 'existence strength must be between 0 and 1' );
      self.opacity = existenceStrength;
      self.pickable = existenceStrength === 1; // prevent interaction with fading coin term
    } );

    // timer that will be used to hide the break apart button if user doesn't use it
    var hideButtonTimer = null;

    // Add the button that will allow combined coins to be un-combined.  This is done outside of the rootnode so that it
    // doesn't affect the bounds used in the model.
    // TODO: There's a lot of code in here for the break apart button.  Can this be consolidated into a class that
    // TODO: encapsulates a lot of this behavior, such as hiding automatically after a given time, managing the timers,
    // TODO: handling hover?  Seems like a good idea.
    var breakApartButton = new BreakApartButton( { visible: false } );
    this.addChild( breakApartButton );

    // adjust the touch area of the break apart button to make it easier to use on touch devices
    var breakApartButtonTouchArea = breakApartButton.localBounds.copy();
    breakApartButtonTouchArea.minX = breakApartButtonTouchArea.minX - breakApartButton.width / 2;
    breakApartButtonTouchArea.maxX = breakApartButtonTouchArea.maxX + breakApartButton.width / 2;
    breakApartButtonTouchArea.minY = breakApartButtonTouchArea.minY - breakApartButton.height;
    breakApartButton.touchArea = breakApartButtonTouchArea;

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
    breakApartButton.buttonModel.overProperty.lazyLink( function( overButton ) {
      if ( overButton ) {
        if ( !coinTerm.userControlled ) {
          assert && assert( !!hideButtonTimer, 'should not be over button without hide timer running' );
          clearHideButtonTimer();
        }
      }
      else {
        if ( !coinTerm.userControlled ) {
          startHideButtonTimer();
        }
      }
    } );

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
    coinTerm.positionProperty.link( function( position ) {
      // the intent here is to position the center of the coin at the position, NOT the center of the node
      self.x = position.x;
      self.y = position.y;
    } );

    // update the state of the break apart button when the userControlled state changes
    coinTerm.userControlledProperty.lazyLink( function( userControlled ) {
      if ( Math.abs( coinTerm.combinedCount ) > 1 && coinTerm.breakApartAllowed ) {

        if ( userControlled ) {
          clearHideButtonTimer(); // called in case the timer was running
          showBreakApartButton();
        }
        else if ( breakApartButton.visible ) {

          // the userControlled flag transitioned to false while the button was visible, start the time to hide it
          startHideButtonTimer();
        }
      }
    } );

    // hide the break apart button if break apart becomes disabled, generally if the coin term joins an expression
    coinTerm.breakApartAllowedProperty.link( function( breakApartAllowed ) {
      if ( breakApartButton.visible && !breakApartAllowed ) {
        clearHideButtonTimer();
        hideBreakApartButton();
      }
    } );

    if ( options.addDragHandler ) {

      // vector for calculations, allocated here to avoid an allocation on every drag event
      var unboundedPosition = new Vector2();

      // Add the listener that will allow the user to drag the coin around.  This is added only to the node that
      // contains the term elements, not the button, so that the button won't affect userControlled or be draggable.
      this.coinAndTextRootNode.addInputListener( new SimpleDragHandler( {

          // allow moving a finger (touch) across a node to pick it up
          allowTouchSnag: true,

          start: function( event, trail ) {
            coinTerm.userControlled = true;
            unboundedPosition.set( coinTerm.position );
          },

          // handler that moves the shape in model space
          translate: function( translationParams ) {

            unboundedPosition.setXY(
              unboundedPosition.x + translationParams.delta.x,
              unboundedPosition.y + translationParams.delta.y
            );

            coinTerm.setPositionAndDestination( new Vector2(
              Util.clamp( unboundedPosition.x, options.dragBounds.minX, options.dragBounds.maxX ),
              Util.clamp( unboundedPosition.y, options.dragBounds.minY, options.dragBounds.maxY )
            ) );

            return translationParams.position;
          },

          end: function( event, trail ) {
            coinTerm.userControlled = false;
          }
        }
      ) );
    }

    // add a listener that will pop this node to the front when selected by the user
    coinTerm.userControlledProperty.onValue( true, function() { self.moveToFront(); } );

    // add a listener that will pop this node to the front when another coin term is combined with it
    coinTerm.combinedCountProperty.link( function( newCount, oldCount ) {
      if ( newCount > oldCount ) {
        self.moveToFront();
      }

      if ( breakApartButton.visible && Math.abs( newCount ) < 2 ) {

        // if combined count was reduced through cancellation while the break apart button was visible, hide it, see
        // https://github.com/phetsims/expression-exchange/issues/29
        hideBreakApartButton();
      }
    } );

    // Add a listener that will make this node non-pickable when animating, which solves a lot of multi-touch and fuzz
    // testing issues.
    coinTerm.inProgressAnimationProperty.link( function( inProgressAnimation ) {
      self.pickable = inProgressAnimation === null;
    } );
  }

  expressionExchange.register( 'AbstractCoinTermNode', AbstractCoinTermNode );

  return inherit( Node, AbstractCoinTermNode, {}, {

    // To look correct in equations, the text all needs to be on the same baseline.  The value was empirically
    // determined and may need to change if font sizes change.
    TEXT_BASELINE_Y_OFFSET: 12
  } );
} );