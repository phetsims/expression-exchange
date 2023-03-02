// Copyright 2016-2023, University of Colorado Boulder

/**
 * a Scenery node that represents a coin term whose underlying value can vary in the view
 *
 * @author John Blanco
 */

import Multilink from '../../../../axon/js/Multilink.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import expressionExchange from '../../expressionExchange.js';
import ViewMode from '../enum/ViewMode.js';
import AbstractCoinTermNode from './AbstractCoinTermNode.js';

// constants
const VALUE_FONT = new PhetFont( { size: 34 } );
const MIN_RELATIVE_BOUNDS_WIDTH = 45; // empirically determined to be similar to variable coin term widths

// The following constants control how the pointer areas (mouse and touch) are set up for the textual representation
// of the coin term.  These are empirically determined such that they are easy for users to grab but the don't
// protrude from expressions.
const POINTER_AREA_X_DILATION_AMOUNT = 15; // in screen coords
const POINTER_AREA_Y_DILATION_AMOUNT = 8; // in screen coords, less than X amt to avoid protruding out of expression
const POINTER_AREA_DOWN_SHIFT = 3; // in screen coords

class ConstantCoinTermNode extends AbstractCoinTermNode {

  /**
   * @param {CoinTerm} constantCoinTerm - model of a coin
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @param {Object} [options]
   */
  constructor( constantCoinTerm, viewModeProperty, options ) {

    assert && assert( constantCoinTerm.isConstant, 'must use a constant coin term with this node' );

    super( constantCoinTerm, options );

    // As of this writing, constant coin terms are never used on a screen where a coin is shown.  There is no
    // fundamental reason why not, that's just how the design worked out.  This node therefore does not support
    // depicting constant coin terms as coins, so it throws an error if the view mode gets set to "COINS".
    const handleViewModeChanged = viewMode => {
      if ( viewMode === ViewMode.COINS ) {
        throw new Error( 'coin view mode not supported' );
      }
    };

    viewModeProperty.link( handleViewModeChanged );

    // add the value text
    const valueText = new Text( '', { font: VALUE_FONT } );
    this.coinAndTextRootNode.addChild( valueText );

    // helper function to take the view bounds information and communicate it to the model
    const updateBoundsInModel = () => {

      // make the bounds relative to (0,0), which is where the center of this node is maintained
      let relativeVisibleBounds = this.coinAndTextRootNode.visibleLocalBounds;

      // In order to be consistent with the behavior of the variable coin terms, the bounds need to be a minimum width,
      // see https://github.com/phetsims/expression-exchange/issues/10.
      const minBoundsWidth = MIN_RELATIVE_BOUNDS_WIDTH * constantCoinTerm.scaleProperty.get();
      if ( relativeVisibleBounds.width < minBoundsWidth ) {
        relativeVisibleBounds = relativeVisibleBounds.dilatedX( ( minBoundsWidth - relativeVisibleBounds.width ) / 2 );
      }

      // only update if the bounds have changed in order to avoid unnecessary updates in other portions of the code
      if ( !constantCoinTerm.localViewBoundsProperty.get() || !constantCoinTerm.localViewBoundsProperty.get().equals( relativeVisibleBounds ) ) {
        constantCoinTerm.localViewBoundsProperty.set( relativeVisibleBounds );
      }
    };

    // update the representation when model properties that affect it change
    const updateRepresentationMultilink = Multilink.multilink(
      [
        constantCoinTerm.totalCountProperty,
        constantCoinTerm.showMinusSignWhenNegativeProperty,
        constantCoinTerm.cardOpacityProperty,
        constantCoinTerm.scaleProperty
      ],
      () => {

        // update value text
        valueText.setScaleMagnitude( constantCoinTerm.scaleProperty.get() );
        if ( constantCoinTerm.showMinusSignWhenNegativeProperty.get() ) {
          valueText.string = constantCoinTerm.valueProperty.value * constantCoinTerm.totalCountProperty.value;
        }
        else {
          valueText.string = Math.abs( constantCoinTerm.valueProperty.value * constantCoinTerm.totalCountProperty.value );
        }

        // update relative position
        valueText.centerX = 0;
        valueText.y = AbstractCoinTermNode.TEXT_BASELINE_Y_OFFSET * constantCoinTerm.scaleProperty.get();

        // update pointer areas
        valueText.mouseArea = valueText.localBounds
          .dilatedXY( POINTER_AREA_X_DILATION_AMOUNT, POINTER_AREA_Y_DILATION_AMOUNT )
          .shiftedY( POINTER_AREA_DOWN_SHIFT );
        valueText.touchArea = valueText.mouseArea;

        // update the card background
        this.cardLikeBackground.setRectBounds( this.coinAndTextRootNode.visibleLocalBounds.dilatedXY(
          AbstractCoinTermNode.BACKGROUND_CARD_X_MARGIN,
          ( AbstractCoinTermNode.BACKGROUND_CARD_HEIGHT_TEXT_MODE - this.coinAndTextRootNode.visibleLocalBounds.height ) / 2
        ) );
        this.cardLikeBackground.visible = constantCoinTerm.cardOpacityProperty.get() > 0;
        this.cardLikeBackground.opacity = constantCoinTerm.cardOpacityProperty.get();

        // update the bounds that are registered with the model
        updateBoundsInModel();
      }
    );

    this.disposeConstantCoinTermNode = () => {
      viewModeProperty.unlink( handleViewModeChanged );
      updateRepresentationMultilink.dispose();
    };
  }

  // @public
  dispose() {
    this.disposeConstantCoinTermNode();
    super.dispose();
  }
}

expressionExchange.register( 'ConstantCoinTermNode', ConstantCoinTermNode );

export default ConstantCoinTermNode;