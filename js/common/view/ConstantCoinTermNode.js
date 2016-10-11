// Copyright 2016, University of Colorado Boulder

/**
 * a Scenery node that represents a coin term whose underlying value can vary in the view
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AbstractCoinTermNode = require( 'EXPRESSION_EXCHANGE/common/view/AbstractCoinTermNode' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );

  // constants
  var VALUE_FONT = new PhetFont( { size: 34 } );
  var MIN_RELATIVE_BOUNDS_WIDTH = 45; // empirically determined to be similar to variable coin term widths

  /**
   * @param {CoinTerm} constantCoinTerm - model of a coin
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @param {Object} options
   * @constructor
   */
  function ConstantCoinTermNode( constantCoinTerm, viewModeProperty, options ) {

    assert && assert( constantCoinTerm.isConstant, 'must use a constant coin term with this node' );

    var self = this;
    AbstractCoinTermNode.call( this, constantCoinTerm, options );

    // As of this writing, constant coin terms are never used on a screen where a coin is shown.  There is no
    // fundamental reason why not, that's just how the design worked out.  This node therefore does not support
    // depicting constant coin terms as coins, so it throws an error if the view mode gets set to "COINS".
    function handleViewModeChanged( viewMode ){
      if ( viewMode === ViewMode.COINS ){
        throw new Error( 'coin view mode not supported' );
      }
    }
    viewModeProperty.link( handleViewModeChanged );

    // add the value text
    var valueText = new Text( '', { font: VALUE_FONT } );
    this.coinAndTextRootNode.addChild( valueText );

    // helper function to take the view bounds information and communicate it to the model
    function updateBoundsInModel() {

      // make the bounds relative to (0,0), which is where the center of this node is maintained
      var relativeVisibleBounds = self.coinAndTextRootNode.visibleLocalBounds;

      // In order to be consistent with the behavior of the variable coin terms, the bounds need to be a minimum width,
      // see https://github.com/phetsims/expression-exchange/issues/10.
      if ( relativeVisibleBounds.width < MIN_RELATIVE_BOUNDS_WIDTH ){
        relativeVisibleBounds = relativeVisibleBounds.dilatedX(
          ( MIN_RELATIVE_BOUNDS_WIDTH - relativeVisibleBounds.width ) / 2
        );
      }

      // only update if the bounds have changed in order to avoid unnecessary updates in other portions of the code
      if ( !constantCoinTerm.relativeViewBoundsProperty.get() ||
           !constantCoinTerm.relativeViewBoundsProperty.get().equals( relativeVisibleBounds ) ) {
        constantCoinTerm.relativeViewBoundsProperty.set( relativeVisibleBounds );
      }
    }

    // function that updates the text and repositions it
    function updateRepresentation() {

      // update value text
      if ( constantCoinTerm.showMinusSignWhenNegativeProperty.get() ){
        valueText.text = constantCoinTerm.valueProperty.value * constantCoinTerm.combinedCountProperty.value;
      }
      else{
        valueText.text = Math.abs( constantCoinTerm.valueProperty.value * constantCoinTerm.combinedCountProperty.value );
      }

      // update position
      valueText.centerX = 0;
      valueText.y = AbstractCoinTermNode.TEXT_BASELINE_Y_OFFSET;

      // update the bounds that are registered with the model
      updateBoundsInModel();
    }

    // update the representation when model properties that affect it change
    var updateRepresentationMultilink = Property.multilink(
      [ constantCoinTerm.combinedCountProperty, constantCoinTerm.showMinusSignWhenNegativeProperty ],
      updateRepresentation
    );

    this.disposeConstantCoinTermNode = function(){
      viewModeProperty.unlink( handleViewModeChanged );
      updateRepresentationMultilink.dispose();
    };
  }

  expressionExchange.register( 'ConstantCoinTermNode', ConstantCoinTermNode );

  return inherit( AbstractCoinTermNode, ConstantCoinTermNode, {

    // @public
    dispose: function(){
      this.disposeConstantCoinTermNode();
      AbstractCoinTermNode.prototype.dispose.call( this );
    }
  } );
} );