// Copyright 2016, University of Colorado Boulder

/**
 * a Scenery node that represents a coin in the view
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var Util = require( 'DOT/Util' );
  var EEQueryParameters = require( 'EXPRESSION_EXCHANGE/common/EEQueryParameters' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Timer = require( 'PHET_CORE/Timer' );
  var ViewModeEnum = require( 'EXPRESSION_EXCHANGE/common/model/ViewModeEnum' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var breakApartIconImage = require( 'image!EXPRESSION_EXCHANGE/break-apart-icon.png' );

  // constants
  var TERM_AND_VALUE_FONT = new PhetFont( { family: '"Times New Roman", serif', size: 34 } );
  var COEFFICIENT_FONT = new PhetFont( { size: 34 } );
  var COEFFICIENT_X_SPACING = 3;
  var DRAG_BEFORE_BREAK_BUTTON_FADES = 10;

  /**
   * @param {CoinTerm} coinTerm - model of a coin
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @param {Property.<boolean>} showCoinValuesProperty - controls whether or not coin value is shown
   * @param {Property.<boolean>} showVariableValuesProperty - controls whether or not variable values are shown
   * @param {Property.<boolean>} showAllCoefficientsProperty - controls whether 1 is shown for non-combined coins
   * @param {boolean} addDragHandler - controls whether drag handler hooked up, useful for creator nodes
   * @constructor
   */
  function CoinTermNode( coinTerm, viewModeProperty, showCoinValuesProperty, showVariableValuesProperty,
                         showAllCoefficientsProperty, options ) {

    options = _.extend( {}, {
      addDragHandler: true,
      dragBounds: Bounds2.EVERYTHING
    }, options );

    var self = this;
    Node.call( this, { pickable: true, cursor: 'pointer' } );

    // Add a root node so that the bounds can be easily monitored for changes in size without getting triggered by
    // changes in position.
    var rootNode = new Node();
    this.addChild( rootNode );

    // add the image that represents the front of the coin
    var image = coinTerm.coinFrontImage;
    var coinImageNode = new Image( image );
    coinImageNode.scale( coinTerm.coinDiameter / coinImageNode.width );
    rootNode.addChild( coinImageNode );

    // control front coin image visibility
    viewModeProperty.link( function( representationMode ) {
      coinImageNode.visible = representationMode === ViewModeEnum.COINS;
    } );

    // convenience variable for positioning the textual labels created below
    var coinCenter = new Vector2( coinImageNode.width / 2, coinImageNode.height / 2 );

    // TODO: There are a number of individual update functions that update the various representations, all of which
    // TODO: always exist and their visibility is switched on and off.  This has grown in complexity, and I'm starting
    // TODO: to that that a single update function would make more sense.  Having separate nodes for the different
    // TODO: representations probably still makes sense so we're not having to add and remove nodes all the time.

    // add the coin value text
    var coinValueText = new Text( coinTerm.coinValue, { font: TERM_AND_VALUE_FONT, center: coinCenter } );
    rootNode.addChild( coinValueText );

    // control the coin value text visibility
    var coinValueVisibleProperty = new DerivedProperty(
      [ viewModeProperty, showCoinValuesProperty ],
      function( viewMode, showCoinValues ) {
        return ( viewMode === ViewModeEnum.COINS && showCoinValues );
      }
    );
    coinValueVisibleProperty.linkAttribute( coinValueText, 'visible' );

    // add the 'term' text, e.g. xy
    var termText = new SubSupText( 'temp', { font: TERM_AND_VALUE_FONT } );
    // TODO: Can I dilate the mouse and touch areas in the constructor?
    rootNode.addChild( termText );

    // create a helper function to update the termText - this basically adds/removes the minus sign
    function updateTermText( coefficientVisible ){
      if ( coinTerm.combinedCount < 0 && !coefficientVisible ){
        termText.text = '-' + coinTerm.termText;
      }
      else{
        termText.text = coinTerm.termText;
      }
      termText.center = coinCenter;
      termText.mouseArea = termText.localBounds.dilated( 10 );
      termText.touchArea = termText.localBounds.dilated( 10 );
    }

    // control the term text visibility
    var termTextVisibleProperty = new DerivedProperty(
      [ viewModeProperty, showVariableValuesProperty ],
      function( viewMode, showVariableValues ) {
        return ( viewMode === ViewModeEnum.VARIABLES && !showVariableValues );
      }
    );
    termTextVisibleProperty.linkAttribute( termText, 'visible' );

    // Add the text that includes the variable values.  This can change, so it starts off blank.
    var termWithVariableValuesText = new SubSupText( ' ', { font: TERM_AND_VALUE_FONT } );
    rootNode.addChild( termWithVariableValuesText );

    // create a helper function to update the term value text
    function updateTermValueText() {
      var termValueText = coinTerm.termValueTextProperty.value;
      if ( coinTerm.combinedCount === -1 && !showAllCoefficientsProperty.value ){
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
    }

    // update the variable text when it changes, which is triggered by changes to the underlying variable values
    coinTerm.termValueTextProperty.link( updateTermValueText );

    // control the visibility of the value text
    var variableTextVisibleProperty = new DerivedProperty(
      [ viewModeProperty, showVariableValuesProperty ],
      function( viewMode, showVariableValues ) {
        return ( viewMode === ViewModeEnum.VARIABLES && showVariableValues );
      }
    );
    variableTextVisibleProperty.linkAttribute( termWithVariableValuesText, 'visible' );

    // add the coefficient value
    var coefficientText = new Text( '', {
      font: COEFFICIENT_FONT
    } );
    rootNode.addChild( coefficientText );

    // create a helper function for positioning the coefficient
    function updateCoefficientPosition() {
      if ( viewModeProperty.value === ViewModeEnum.COINS ) {
        coefficientText.right = coinImageNode.left - COEFFICIENT_X_SPACING;
        coefficientText.centerY = coinImageNode.centerY;
      }
      else if ( termTextVisibleProperty.value ) {
        coefficientText.right = termText.left - COEFFICIENT_X_SPACING;
        coefficientText.y = termText.y;
      }
      else {
        coefficientText.right = termWithVariableValuesText.left - COEFFICIENT_X_SPACING;
        coefficientText.y = termWithVariableValuesText.y;
      }
    }

    // update the coefficient text when the value changes
    coinTerm.combinedCountProperty.link( function( combinedCount ) {
      coefficientText.text = combinedCount;
      updateCoefficientPosition();
    } );

    // control the visibility of the coefficient text
    var coefficientVisibleProperty = new DerivedProperty( [
        coinTerm.combinedCountProperty,
        showAllCoefficientsProperty ],
      function( combinedCount, showAllCoefficients ) {
        return ( Math.abs( combinedCount ) !== 1 || showAllCoefficients );
      } );
    coefficientVisibleProperty.link( function( coefficientVisible ) {
      updateTermValueText();
      updateTermText( coefficientVisible );
      updateCoefficientPosition();
      coefficientText.visible = coefficientVisible;
    } );

    // position the coefficient to line up well with the text or the code
    Property.multilink( [ viewModeProperty, coinTerm.termValueTextProperty, termTextVisibleProperty ], updateCoefficientPosition );

    // helper function to take the view bounds information and communicate it to the model
    function updateBoundsInModel() {

      var relativeVisibleBounds = self.visibleLocalBounds.shifted( -coinTerm.coinDiameter / 2, -coinTerm.coinDiameter / 2 );

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

    // Update the model with the view's dimensions.  This breaks the whole model-view separation rule a bit, but in this
    // sim both the model and the view can be affected by the size of the coin terms, so this was a way to get it done.
    rootNode.on( 'bounds', function() {
      updateBoundsInModel();
    } );

    // TODO: This is a workaround because I couldn't figure out how to monitor visible bounds.  This should be removed when possible.
    coefficientVisibleProperty.link( updateBoundsInModel );

    // add the variables that will track the timers used as part of the break apart button visibility control
    var showButtonTimer = null;
    var hideButtonTimer = null;

    // Add the button that will allow combined coins to be un-combined.  This is done outside of the rootnode so that it
    // doesn't affect the bounds used in the model.
    // TODO: There's a lot of code in here for the break apart button.  Can this be consolidated into a class that
    // TODO: encapsulates a lot of this behavior, such as hiding automatically after a given time, managing the timers,
    // TODO: handling hover?  Seems like a good idea.
    var breakApartButton = new RectangularPushButton( {
      content: new Image( breakApartIconImage, { scale: 0.3 } ), // scale empirically determined
      xMargin: 3,
      yMargin: 3,
      baseColor: 'yellow',
      visible: false
    } );
    this.addChild( breakApartButton );

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
        showBreakApartButton( false );
        hideButtonTimer = null;
      }, 2000 );
    }

    function clearShowButtonTimer() {
      if ( showButtonTimer ) {
        Timer.clearTimeout( showButtonTimer );
      }
      showButtonTimer = null;
    }

    function startShowButtonTimer() {
      clearShowButtonTimer(); // just in case one is already running
      showButtonTimer = Timer.setTimeout( function() {
        showBreakApartButton( true );
        showButtonTimer = null;
        startHideButtonTimer();
      }, 500 );
    }

    // add the listener to the break apart button
    breakApartButton.addListener( function() {
      coinTerm.breakApart();

      // hide the button after clicking
      showBreakApartButton( false );

      // cancel any running timers
      clearShowButtonTimer();
      clearHideButtonTimer();
    } );

    // keep the button showing if the user is over it
    breakApartButton.buttonModel.overProperty.lazyLink( function( overButton ) {
      if ( overButton ) {
        assert && assert( !!hideButtonTimer, 'should not be over button without hide timer running' );
        clearHideButtonTimer();
      }
      else {
        startHideButtonTimer();
      }
    } );

    // define a function that will position and hide/show the break apart button
    function showBreakApartButton( show ) {
      if ( show ) {
        breakApartButton.centerX = coinCenter.x;
        breakApartButton.bottom = -3; // just above the coin, empirically determined
        breakApartButton.visible = true;
      }
      else {
        // TODO: moving this inside the coin term to keep bounds confined.  Is this necessary?  Simplify if possible.
        breakApartButton.center = coinCenter;
        breakApartButton.visible = false;
      }
      updateBoundsInModel();
    }

    // move this node as the model representation moves
    coinTerm.positionProperty.link( function( position ) {
      // the intent here is to position the center of the coin at the position, NOT the center of the node
      self.x = position.x - coinCenter.x;
      self.y = position.y - coinCenter.y;
    } );

    if ( options.addDragHandler ) {

      // variable to track where drag started
      var dragStartPosition;

      // vector for calculations, allocated here to avoid an allocation on every drag event
      var unboundedPosition = new Vector2();

      // Add the listener that will allow the user to drag the coin around.  This is added only to the node that
      // contains the term elements, not the button, so that the button won't affect userControlled or be draggable.
      rootNode.addInputListener( new SimpleDragHandler( {

          // allow moving a finger (touch) across a node to pick it up
          allowTouchSnag: true,

          start: function( event, trail ) {
            coinTerm.userControlled = true;
            dragStartPosition = coinTerm.position;
            unboundedPosition.set( dragStartPosition );

            // if this is a multi-count coin term, start a timer to show the break apart button
            if ( Math.abs( coinTerm.combinedCount > 1 ) ) {

              // clear any timers that are running already
              clearHideButtonTimer();
              clearShowButtonTimer();

              // start a timer to show the button if the user presses and holds
              startShowButtonTimer();
            }
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

            // update the state of the break apart button and associated timers
            if ( Math.abs( coinTerm.combinedCount ) > 1 &&
                 coinTerm.position.distance( dragStartPosition ) > DRAG_BEFORE_BREAK_BUTTON_FADES ) {

              if ( breakApartButton.visible ) {

                // the button was already visible, so hide it
                showBreakApartButton( false );
                clearHideButtonTimer();
              }
              else if ( showButtonTimer ) {
                clearShowButtonTimer();
              }
            }

            return translationParams.position;
          },

          end: function( event, trail ) {
            coinTerm.userControlled = false;

            if ( Math.abs( coinTerm.combinedCount ) > 1 &&
                 coinTerm.position.distance( dragStartPosition ) < DRAG_BEFORE_BREAK_BUTTON_FADES ) {

              // the user clicked on the coin term without moving it (much), so show the break apart button
              showBreakApartButton( true );

              // cancel timer for showing button if active
              clearShowButtonTimer();

              // start a timer to hide the button if not interacted with
              startHideButtonTimer();
            }
          }
        }
      ) );
    }

    // add a listener that will pop this coin to the front when selected by the user
    coinTerm.userControlledProperty.onValue( true, function() { self.moveToFront(); } );

    // add a listener that will pop this coin to the front when another coin is combined with it
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

  expressionExchange.register( 'CoinTermNode', CoinTermNode );

  return inherit( Node, CoinTermNode );
} )
;