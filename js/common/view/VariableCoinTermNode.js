// Copyright 2016, University of Colorado Boulder

/**
 * a Scenery node that represents a coin term whose underlying value can vary in the view
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var BreakApartButton = require( 'EXPRESSION_EXCHANGE/common/view/BreakApartButton' );
  var CoinNodeFactory = require( 'EXPRESSION_EXCHANGE/common/view/CoinNodeFactory' );
  var EEQueryParameters = require( 'EXPRESSION_EXCHANGE/common/EEQueryParameters' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Timer = require( 'PHET_CORE/Timer' );
  var Util = require( 'DOT/Util' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var VALUE_FONT = new PhetFont( { size: 34 } );
  var VARIABLE_FONT = new MathSymbolFont( 36 );
  var COEFFICIENT_FONT = new PhetFont( { size: 34 } );
  var COEFFICIENT_X_SPACING = 3;
  var FADE_TIME = 0.75; // in seconds
  var NUM_FADE_STEPS = 10; // number of steps for fade out to occur

  /**
   * @param {CoinTerm} coinTerm - model of a coin
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @param {Property.<boolean>} showCoinValuesProperty - controls whether or not coin value is shown
   * @param {Property.<boolean>} showVariableValuesProperty - controls whether or not variable values are shown
   * @param {Property.<boolean>} showAllCoefficientsProperty - controls whether 1 is shown for non-combined coins
   * @param {Property.<boolean>} simplifyNegativesProperty - controls whether minus sign is shown when in an expression
   * @param {Object} options
   * @constructor
   */
  function VariableCoinTermNode(
    coinTerm,
    viewModeProperty,
    showCoinValuesProperty,
    showVariableValuesProperty,
    showAllCoefficientsProperty,
    simplifyNegativesProperty,
    options
  ) {

    options = _.extend( {}, {
      addDragHandler: true,
      dragBounds: Bounds2.EVERYTHING
    }, options );

    var self = this;
    Node.call( this, { pickable: true, cursor: 'pointer' } );

    // Add a root node so that the bounds can be easily monitored for changes in size without getting triggered by
    // changes in position.
    var coinAndTextRootNode = new Node();
    this.addChild( coinAndTextRootNode );

    // add the image that represents the front of the coin
    var coinImageNode = CoinNodeFactory.createFrontImageNode( coinTerm.typeID, coinTerm.coinRadius );
    coinAndTextRootNode.addChild( coinImageNode );

    // convenience variable for positioning the textual labels created below
    var coinCenter = new Vector2( coinImageNode.width / 2, coinImageNode.height / 2 );

    // add the coin value text
    var coinValueText = new Text( '', { font: VALUE_FONT } );
    coinAndTextRootNode.addChild( coinValueText );

    // add the 'term' text, e.g. xy
    var termText = new SubSupText( 'temp', { font: VARIABLE_FONT } );
    coinAndTextRootNode.addChild( termText );

    // Add the text that includes the variable values.  This can change, so it starts off blank.
    var termWithVariableValuesText = new SubSupText( ' ', { font: VARIABLE_FONT } );
    coinAndTextRootNode.addChild( termWithVariableValuesText );

    // add the coefficient value
    var coefficientText = new Text( '', {
      font: COEFFICIENT_FONT
    } );
    coinAndTextRootNode.addChild( coefficientText );

    // helper function to take the view bounds information and communicate it to the model
    function updateBoundsInModel() {

      // make the bounds relative to the coin term's position, which corresponds to the center of the coin
      var relativeVisibleBounds = coinAndTextRootNode.visibleLocalBounds.shifted( -coinTerm.coinRadius, -coinTerm.coinRadius );

      // TODO:  The following is some temporary code to try out making the overall bounds remain the same for the two
      // TODO:  different view modes so that the expressions don't expand/collapse as the modes change.  This will need
      // TODO:  to be moved out or kept based on the feedback we get.  See
      // TODO:  https://github.com/phetsims/expression-exchange/issues/10
      if ( !EEQueryParameters.ADJUST_EXPRESSION_WIDTH ) {

        var width = Math.max( coinImageNode.width, termText.width, termWithVariableValuesText.width );

        if ( coefficientText.visible || Math.abs( coinTerm.combinedCount ) > 1 ) {
          width += coefficientText.width + COEFFICIENT_X_SPACING;
        }

        // set the view bounds such that the non-coefficient portion is always the same width
        relativeVisibleBounds = relativeVisibleBounds.dilatedX( ( width - relativeVisibleBounds.width ) / 2 );
      }

      // only update if the bounds have changed in order to avoid unnecessary updates in other portions of the code
      if ( !coinTerm.relativeViewBounds || !coinTerm.relativeViewBounds.equals( relativeVisibleBounds ) ) {
        coinTerm.relativeViewBounds = relativeVisibleBounds;
      }
    }

    // function that updates all nodes that comprise this composite node
    function updateAppearance() {

      // TODO: This is originally being written with no thought given to performance, may need to optimize

      // control front coin image visibility
      coinImageNode.visible = viewModeProperty.value === ViewMode.COINS;

      // update coin value text
      coinValueText.text = coinTerm.valueProperty.value;
      coinValueText.center = coinCenter;
      coinValueText.visible = viewModeProperty.value === ViewMode.COINS && showCoinValuesProperty.value;

      // determine if the coefficient is visible, since this will be used several times below
      var coefficientVisible = Math.abs( coinTerm.combinedCountProperty.value ) !== 1 ||
                               showAllCoefficientsProperty.value;

      // update the term text, which only changes if it switches from positive to negative
      if ( coinTerm.combinedCount < 0 && !coefficientVisible ) {
        termText.text = '-' + coinTerm.termText;
      }
      else {
        termText.text = coinTerm.termText;
      }
      termText.center = coinCenter;
      termText.mouseArea = termText.localBounds.dilated( 10 );
      termText.touchArea = termText.localBounds.dilated( 10 );
      termText.visible = viewModeProperty.value === ViewMode.VARIABLES && !showVariableValuesProperty.value;

      // term value text, which shows the variable values and operators such as exponents
      var termValueText = coinTerm.termValueTextProperty.value;
      if ( coinTerm.combinedCount === -1 && !showAllCoefficientsProperty.value ) {
        // prepend a minus sign
        termValueText = '-' + termValueText;
      }
      if ( Math.abs( coinTerm.combinedCount ) > 1 || showAllCoefficientsProperty.value ) { // wrap the term value text in parentheses
        termValueText = '(' + termValueText + ')';
      }
      termWithVariableValuesText.text = termValueText;
      termWithVariableValuesText.center = coinCenter;
      termWithVariableValuesText.mouseArea = termWithVariableValuesText.localBounds.dilated( 10 );
      termWithVariableValuesText.touchArea = termWithVariableValuesText.localBounds.dilated( 10 );
      termWithVariableValuesText.visible = viewModeProperty.value === ViewMode.VARIABLES &&
                                           showVariableValuesProperty.value;

      // coefficient value and visibility
      coefficientText.text = coinTerm.combinedCount;
      coefficientText.visible = coefficientVisible;

      // position the coefficient
      if ( viewModeProperty.value === ViewMode.COINS ) {
        coefficientText.right = coinImageNode.left - COEFFICIENT_X_SPACING;
        coefficientText.centerY = coinImageNode.centerY;
      }
      else if ( termText.visible ) {
        coefficientText.right = termText.left - COEFFICIENT_X_SPACING;
        coefficientText.y = termText.y;
      }
      else {
        coefficientText.right = termWithVariableValuesText.left - COEFFICIENT_X_SPACING;
        coefficientText.y = termWithVariableValuesText.y;
      }

      // update the bounds that are registered with the model
      updateBoundsInModel();
    }

    // if anything about the coin term's values changes or any of the display mode, the appearance needs to be update
    // TODO: Need to dispose of this, unlink it, or whatever, to avoid memory leaks
    Property.multilink(
      [
        coinTerm.combinedCountProperty,
        coinTerm.valueProperty,
        coinTerm.termValueTextProperty,
        viewModeProperty,
        showCoinValuesProperty,
        showVariableValuesProperty,
        showAllCoefficientsProperty
      ],
      updateAppearance
    );

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
      breakApartButton.centerX = coinCenter.x;
      breakApartButton.bottom = -3; // just above the coin, empirically determined
      breakApartButton.visible = true;
    }

    // define a function that will position and hide the break apart button
    function hideBreakApartButton() {
      breakApartButton.center = coinCenter; // position within coin term so bounds aren't affected
      breakApartButton.visible = false;
    }

    // move this node as the model representation moves
    coinTerm.positionProperty.link( function( position ) {
      // the intent here is to position the center of the coin at the position, NOT the center of the node
      self.x = position.x - coinCenter.x;
      self.y = position.y - coinCenter.y;
    } );

    // update the state of the break apart button when the userControlled state changes
    coinTerm.userControlledProperty.link( function( userControlled ) {
      if ( Math.abs( coinTerm.combinedCount ) > 1 && !coinTerm.inExpression ) {
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

    // hide the break apart button if the coin term becomes part of an expression
    coinTerm.inExpressionProperty.link( function( inExpression ) {
      if ( inExpression && breakApartButton.visible ) {
        clearHideButtonTimer();
        hideBreakApartButton();
      }
    } );

    if ( options.addDragHandler ) {

      // vector for calculations, allocated here to avoid an allocation on every drag event
      var unboundedPosition = new Vector2();

      // Add the listener that will allow the user to drag the coin around.  This is added only to the node that
      // contains the term elements, not the button, so that the button won't affect userControlled or be draggable.
      coinAndTextRootNode.addInputListener( new SimpleDragHandler( {

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
    } );

    // Add a listener that will make this node non-pickable when animating, which solves a lot of multi-touch and fuzz
    // testing issues.
    coinTerm.inProgressAnimationProperty.link( function( inProgressAnimation ) {
      self.pickable = inProgressAnimation === null;
    } );
  }

  expressionExchange.register( 'VariableCoinTermNode', VariableCoinTermNode );

  return inherit( Node, VariableCoinTermNode, {

    /**
     * cause this node to fade away (by reducing opacity) and then remove itself from the scene graph
     * @public
     */
    fadeAway: function() {
      var self = this;
      var fadeOutCount = 0;

      // prevent any further interaction
      this.pickable = false;

      // start the periodic timer that will cause the fade
      var timerInterval = Timer.setInterval( function() {
        fadeOutCount++;
        if ( fadeOutCount < NUM_FADE_STEPS ) {
          // reduce opacity
          self.opacity = 1 - fadeOutCount / NUM_FADE_STEPS;
        }
        else {
          // remove this node from the scene graph
          self.getParents().forEach( function( parent ) {
            parent.removeChild( self );
          } );

          // stop the timer
          Timer.clearInterval( timerInterval );
        }
      }, Math.max( FADE_TIME / NUM_FADE_STEPS * 1000, 1 / 60 * 1000 ) ); // interval should be at least one animation frame
    }
  } );
} );