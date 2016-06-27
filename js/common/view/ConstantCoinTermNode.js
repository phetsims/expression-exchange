// Copyright 2016, University of Colorado Boulder

/**
 * a Scenery node that represents a coin term whose underlying value can vary in the view
 * TODO: put this and VariableCoinTermNode in a hierarchy where common code is shared.
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Timer = require( 'PHET_CORE/Timer' );
  var Util = require( 'DOT/Util' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var VALUE_FONT = new PhetFont( { size: 34 } );
  var FADE_TIME = 0.75; // in seconds
  var NUM_FADE_STEPS = 10; // number of steps for fade out to occur
  var MIN_RELATIVE_BOUNDS_WIDTH = 45; // empirically determined to be similar to variable coin term widths

  /**
   * @param {CoinTerm} constantCoinTerm - model of a coin
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @param {Object} options
   * @constructor
   */
  function ConstantCoinTermNode( constantCoinTerm, viewModeProperty, options ) {

    assert && assert( constantCoinTerm.isConstant, 'must use a constant coin term with this node' );

    options = _.extend( {}, {
      addDragHandler: true,
      dragBounds: Bounds2.EVERYTHING
    }, options );

    var self = this;
    Node.call( this, { pickable: true, cursor: 'pointer' } );

    // As of this writing, constant coin terms are never used on a screen where a coin is shown.  There is no
    // fundamental reason why not, that's just how the design worked out.  This node therefore does not support
    // depicting constant coin terms as coins, so it throws an error if the view mode gets set to "COINS".
    viewModeProperty.link( function( viewMode ){
      if ( viewMode !== ViewMode.VARIABLES ){
        throw new Error( 'view mode not supported' );
      }
    } );

    // Add a 'top' node so that the bounds can be easily monitored for changes in size without getting triggered by
    // changes in position.
    var topNode = new Node();
    this.addChild( topNode );

    // add the value text
    var valueText = new Text( '', { font: VALUE_FONT } );
    topNode.addChild( valueText );

    // helper function to take the view bounds information and communicate it to the model
    function updateBoundsInModel() {

      // make the bounds relative to (0,0), which is where the center of this node is maintained
      var relativeVisibleBounds = topNode.visibleLocalBounds;

      // In order to be consistent with the behavior of the variable coin terms, the bounds need to be a minimum width,
      // see https://github.com/phetsims/expression-exchange/issues/10.
      if ( relativeVisibleBounds.width < MIN_RELATIVE_BOUNDS_WIDTH ){
        relativeVisibleBounds = relativeVisibleBounds.dilatedX(
          ( MIN_RELATIVE_BOUNDS_WIDTH - relativeVisibleBounds.width ) / 2
        );
      }

      // only update if the bounds have changed in order to avoid unnecessary updates in other portions of the code
      if ( !constantCoinTerm.relativeViewBounds || !constantCoinTerm.relativeViewBounds.equals( relativeVisibleBounds ) ) {
        constantCoinTerm.relativeViewBounds = relativeVisibleBounds;
      }
    }

    // function that updates the text and repositions it
    function updateAppearance() {

      // update value text
      if ( constantCoinTerm.showMinusSignWhenNegative ){
        valueText.text = constantCoinTerm.valueProperty.value * constantCoinTerm.combinedCountProperty.value;
      }
      else{
        valueText.text = Math.abs( constantCoinTerm.valueProperty.value * constantCoinTerm.combinedCountProperty.value );
      }

      // update position
      valueText.center = Vector2.ZERO;

      // update the bounds that are registered with the model
      updateBoundsInModel();
    }

    // update the appearance when model properties that affect it change
    // TODO: Need to dispose of this, unlink it, or whatever, to avoid memory leaks
    Property.multilink(
      [ constantCoinTerm.combinedCountProperty, constantCoinTerm.showMinusSignWhenNegativeProperty ],
      updateAppearance
    );

    // move this node as the model representation moves
    constantCoinTerm.positionProperty.link( function( position ) {
      self.center = position;
    } );

    if ( options.addDragHandler ) {

      // vector for calculations, allocated here to avoid an allocation on every drag event
      var unboundedPosition = new Vector2();

      // Add the listener that will allow the user to drag the coin around.  This is added only to the node that
      // contains the term elements, not the button, so that the button won't affect userControlled or be draggable.
      topNode.addInputListener( new SimpleDragHandler( {

          // allow moving a finger (touch) across a node to pick it up
          allowTouchSnag: true,

          start: function( event, trail ) {
            constantCoinTerm.userControlled = true;
            unboundedPosition.set( constantCoinTerm.position );
          },

          // handler that moves the shape in model space
          translate: function( translationParams ) {

            unboundedPosition.setXY(
              unboundedPosition.x + translationParams.delta.x,
              unboundedPosition.y + translationParams.delta.y
            );

            constantCoinTerm.setPositionAndDestination( new Vector2(
              Util.clamp( unboundedPosition.x, options.dragBounds.minX, options.dragBounds.maxX ),
              Util.clamp( unboundedPosition.y, options.dragBounds.minY, options.dragBounds.maxY )
            ) );

            return translationParams.position;
          },

          end: function( event, trail ) {
            constantCoinTerm.userControlled = false;
          }
        }
      ) );
    }

    // add a listener that will pop this node to the front when selected by the user
    constantCoinTerm.userControlledProperty.onValue( true, function() { self.moveToFront(); } );

    // add a listener that will pop this node to the front when another constant coin term is combined with it
    constantCoinTerm.combinedCountProperty.link( function( newCount, oldCount ) {
      if ( newCount > oldCount ) {
        self.moveToFront();
      }
    } );

    // Add a listener that will make this node non-pickable when animating, which solves a lot of multi-touch and fuzz
    // testing issues.
    constantCoinTerm.inProgressAnimationProperty.link( function( inProgressAnimation ) {
      self.pickable = inProgressAnimation === null;
    } );
  }

  expressionExchange.register( 'ConstantCoinTermNode', ConstantCoinTermNode );

  return inherit( Node, ConstantCoinTermNode, {

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