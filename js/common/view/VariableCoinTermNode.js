// Copyright 2016-2023, University of Colorado Boulder

/**
 * a Scenery node that represents a coin term whose underlying value can vary in the view
 *
 * @author John Blanco
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import MathSymbolFont from '../../../../scenery-phet/js/MathSymbolFont.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Rectangle, RichText, Text } from '../../../../scenery/js/imports.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import expressionExchange from '../../expressionExchange.js';
import EEQueryParameters from '../EEQueryParameters.js';
import ViewMode from '../enum/ViewMode.js';
import AbstractCoinTermNode from './AbstractCoinTermNode.js';
import CoinNodeFactory from './CoinNodeFactory.js';

// constants
const COEFFICIENT_FONT = new PhetFont( { size: 34 } );
const COEFFICIENT_X_SPACING = 3; // in screen coords
const SUPERSCRIPT_SCALE = 0.65;
const VALUE_FONT = new PhetFont( { size: 30 } );
const VARIABLE_FONT = new MathSymbolFont( 36 );
const COIN_FLIP_TIME = 0.5; // in seconds
const MIN_SCALE_FOR_FLIP = 0.05;

// The following constants control how the pointer areas (mouse and touch) are set up for the textual representation
// of the coin term.  These are empirically determined such that they are easy for users to grab but the don't
// protrude from expressions.
const POINTER_AREA_X_DILATION_AMOUNT = 15; // in screen coords
const POINTER_AREA_Y_DILATION_AMOUNT = 8; // in screen coords, less than X amt to avoid protruding out of expression
const POINTER_AREA_DOWN_SHIFT = 3; // in screen coords

class VariableCoinTermNode extends AbstractCoinTermNode {

  /**
   * @param {CoinTerm} coinTerm - model of a coin
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @param {Property.<boolean>} showCoinValuesProperty - controls whether or not coin value is shown
   * @param {Property.<boolean>} showVariableValuesProperty - controls whether or not variable values are shown
   * @param {Property.<boolean>} showAllCoefficientsProperty - controls whether 1 is shown for non-combined coins
   * @param {Object} [options]
   */
  constructor( coinTerm, viewModeProperty, showCoinValuesProperty, showVariableValuesProperty, showAllCoefficientsProperty, options ) {

    options = merge( {

      // this value can be set to false in order to conserve nodes, and therefore memory, if this node will never need
      // to show the value of the coin term
      supportShowValues: true
    }, options );

    super( coinTerm, options );

    // @private {CoinTerm} - make the coin term available to methods
    this.coinTerm = coinTerm;

    // @private {Property.<ViewMode>} - make the view mode available to methods
    this.viewModeProperty = viewModeProperty;

    // @private {Rectangle} - an invisible node used to make sure text is rendered without bounds issues, see
    // https://github.com/phetsims/expression-exchange/issues/26
    this.boundsRect = new Rectangle( 0, 0, 1, 1, { fill: 'transparent' } );
    this.coinAndTextRootNode.addChild( this.boundsRect );

    // @private {Image} - add the images for the front and back of the coin
    const coinImageNodes = [];
    this.coinFrontImageNode = CoinNodeFactory.createImageNode( coinTerm.typeID, coinTerm.coinRadius, true );
    coinImageNodes.push( this.coinFrontImageNode );
    if ( options.supportShowValues ) {
      this.coinBackImageNode = CoinNodeFactory.createImageNode( coinTerm.typeID, coinTerm.coinRadius, false );
      coinImageNodes.push( this.coinBackImageNode );
    }

    // @private - add a parent node that contains the two coin images, and also maintains consistent bounds, necessary
    // to prevent a bunch of bounds change notification when the coin term is flipped
    this.coinImagesNode = new Rectangle( 0, 0, coinTerm.coinRadius * 2, coinTerm.coinRadius * 2, {
      fill: 'transparent', // invisible
      children: coinImageNodes,
      x: -coinTerm.coinRadius,
      y: -coinTerm.coinRadius
    } );
    this.coinAndTextRootNode.addChild( this.coinImagesNode );

    // @private - add the coin value text
    if ( options.supportShowValues ) {
      this.coinValueText = new Text( '', { font: VALUE_FONT } );
      this.coinImagesNode.addChild( this.coinValueText );
    }

    // @private - add the 'term' text, e.g. xy
    this.termText = new RichText( 'temp', { font: VARIABLE_FONT, supScale: SUPERSCRIPT_SCALE } );
    this.coinAndTextRootNode.addChild( this.termText );

    if ( options.supportShowValues ) {

      // @private - Add the text that includes the variable values.  This can change, so it starts off blank.
      this.termWithVariableValuesText = new RichText( ' ', { font: VARIABLE_FONT, supScale: SUPERSCRIPT_SCALE } );
      this.coinAndTextRootNode.addChild( this.termWithVariableValuesText );
    }

    // @private - add the coefficient value
    this.coefficientText = new Text( '', {
      font: COEFFICIENT_FONT
    } );
    this.coinAndTextRootNode.addChild( this.coefficientText );

    // @private {Property.<number>} - view-specific property for controlling the coin flip animation, 0 = heads, 1 =
    // tails, values in between are used to scale the coin term and thus make it look like it's flipping
    this.flipStateProperty = new Property( showCoinValuesProperty.get() ? 1 : 0 );

    // @private {Animation} - tracks current animation
    this.activeFlipAnimation = null;

    // if anything about the coin term's values changes or any of the display mode, the representation needs to be updated
    const updateRepresentationMultilink = Multilink.multilink(
      [
        viewModeProperty,
        showAllCoefficientsProperty,
        showVariableValuesProperty,
        showCoinValuesProperty,
        coinTerm.totalCountProperty,
        coinTerm.valueProperty,
        coinTerm.termValueStringProperty,
        coinTerm.showMinusSignWhenNegativeProperty,
        coinTerm.cardOpacityProperty,
        coinTerm.scaleProperty
      ],
      this.updateRepresentation.bind( this )
    );

    let flipStateAnimator;
    if ( options.supportShowValues ) {

      // hook up the listener that will step the changes to the flip state when the 'show values' state changes
      flipStateAnimator = this.updateCoinFlipAnimations.bind( this );
      showCoinValuesProperty.link( flipStateAnimator );

      // adjust the coin images when the flipped state changes
      this.flipStateProperty.link( this.updateFlipAppearance.bind( this ) );
    }

    // @private
    this.disposeVariableCoinTermNode = () => {
      updateRepresentationMultilink.dispose();
      if ( flipStateAnimator ) {
        showCoinValuesProperty.unlink( flipStateAnimator );
      }
    };
  }

  // helper function to take the view bounds information and communicates it to the model
  /**
   * update the bounds used by the model to position and align coin terms
   * @private
   */
  updateBoundsInModel() {

    // make the bounds relative to the coin term's position, which corresponds to the center of the coin
    let relativeVisibleBounds = this.coinAndTextRootNode.visibleLocalBounds;

    // Expressions are kept the same width whether the view mode is set to coins or variables, but it is possible to
    // override this behavior using a query parameter.  This behavior is being retained in case we ever want to
    // experiment with it in the future.  See https://github.com/phetsims/expression-exchange/issues/10
    if ( !EEQueryParameters.adjustExpressionWidth ) {

      const termWithVariableValuesTextWidth = this.termWithVariableValuesText ? this.termWithVariableValuesText.width : 0;

      let width = Math.max( this.coinImagesNode.width, this.termText.width, termWithVariableValuesTextWidth );

      if ( this.coefficientText.visible || Math.abs( this.coinTerm.totalCountProperty.get() ) > 1 ) {
        width += this.coefficientText.width + COEFFICIENT_X_SPACING;
      }

      // set the view bounds such that the non-coefficient portion is always the same width
      relativeVisibleBounds = relativeVisibleBounds.dilatedX( ( width - relativeVisibleBounds.width ) / 2 );
    }

    // only update if the bounds have changed in order to avoid unnecessary updates in other portions of the code
    if ( !this.coinTerm.localViewBoundsProperty.get() || !this.coinTerm.localViewBoundsProperty.get().equals( relativeVisibleBounds ) ) {
      this.coinTerm.localViewBoundsProperty.set( relativeVisibleBounds );
    }
  }

  /**
   * function that updates all nodes that comprise this composite node
   * @private
   */
  updateRepresentation( viewMode, showAllCoefficients, showVariableValues ) {

    // convenience vars
    const textBaseline = AbstractCoinTermNode.TEXT_BASELINE_Y_OFFSET;
    const scale = this.coinTerm.scaleProperty.get(); // for convenience

    // control front coin image visibility
    this.coinImagesNode.visible = viewMode === ViewMode.COINS;

    // adjust the size of the coin term images
    const desiredCoinImageWidth = this.coinTerm.coinRadius * 2 * scale;
    if ( Math.abs( this.coinImagesNode.width - desiredCoinImageWidth ) > 1E-4 ) {
      this.coinImagesNode.setScaleMagnitude( 1 );
      this.coinImagesNode.setScaleMagnitude( desiredCoinImageWidth / this.coinImagesNode.width );
      this.coinImagesNode.center = Vector2.ZERO;
    }

    // update coin value text
    if ( this.coinValueText ) {
      this.coinValueText.string = this.coinTerm.valueProperty.value;
      this.coinValueText.centerX = this.coinTerm.coinRadius;
      this.coinValueText.centerY = this.coinTerm.coinRadius;
    }

    // determine if the coefficient is visible, since this will be used several times below
    const coefficientVisible = Math.abs( this.coinTerm.totalCountProperty.get() ) !== 1 || showAllCoefficients;

    // update the term text, which only changes if it switches from positive to negative
    this.termText.setScaleMagnitude( scale );
    if ( this.coinTerm.totalCountProperty.get() < 0 && !coefficientVisible &&
         this.coinTerm.showMinusSignWhenNegativeProperty.get() ) {

      this.termText.string = MathSymbols.UNARY_MINUS + this.coinTerm.termText;
    }
    else {
      this.termText.string = this.coinTerm.termText;
    }
    this.termText.centerX = 0;
    this.termText.y = textBaseline * scale;
    this.termText.mouseArea = this.termText.localBounds
      .dilatedXY( POINTER_AREA_X_DILATION_AMOUNT, POINTER_AREA_Y_DILATION_AMOUNT )
      .shiftedY( POINTER_AREA_DOWN_SHIFT );
    this.termText.touchArea = this.termText.mouseArea;
    this.termText.visible = viewMode === ViewMode.VARIABLES && !showVariableValues;

    // term value text, which shows the variable values and operators such as exponents
    let termValueText = this.coinTerm.termValueStringProperty.value;
    if ( this.coinTerm.totalCountProperty.get() === -1 && !showAllCoefficients &&
         this.coinTerm.showMinusSignWhenNegativeProperty.get() ) {
      // prepend a minus sign
      termValueText = MathSymbols.UNARY_MINUS + termValueText;
    }

    if ( this.termWithVariableValuesText ) {
      this.termWithVariableValuesText.setScaleMagnitude( scale );
      this.termWithVariableValuesText.string = termValueText;
      this.termWithVariableValuesText.centerX = 0;
      this.termWithVariableValuesText.y = textBaseline * scale;
      this.termWithVariableValuesText.mouseArea = this.termWithVariableValuesText.localBounds
        .dilatedX( POINTER_AREA_X_DILATION_AMOUNT )
        .dilatedY( POINTER_AREA_Y_DILATION_AMOUNT )
        .shiftedY( POINTER_AREA_DOWN_SHIFT );
      this.termWithVariableValuesText.touchArea = this.termWithVariableValuesText.mouseArea;
      this.termWithVariableValuesText.visible = viewMode === ViewMode.VARIABLES && showVariableValues;
    }

    // coefficient value and visibility
    this.coefficientText.setScaleMagnitude( scale );
    this.coefficientText.string = this.coinTerm.showMinusSignWhenNegativeProperty.get() ?
                                this.coinTerm.totalCountProperty.get() :
                                Math.abs( this.coinTerm.totalCountProperty.get() );
    this.coefficientText.visible = coefficientVisible;

    // position the coefficient
    if ( viewMode === ViewMode.COINS ) {
      this.coefficientText.right = this.coinImagesNode.left - COEFFICIENT_X_SPACING;
      this.coefficientText.centerY = this.coinImagesNode.centerY;
    }
    else if ( this.termText.visible ) {
      this.coefficientText.right = this.termText.left - COEFFICIENT_X_SPACING;
      this.coefficientText.y = textBaseline * scale;
    }
    else if ( this.termWithVariableValuesText ) {
      this.coefficientText.right = this.termWithVariableValuesText.left - COEFFICIENT_X_SPACING;
      this.coefficientText.y = textBaseline * scale;
    }

    // update the card background
    const targetCardHeight = viewMode === ViewMode.COINS ?
                             AbstractCoinTermNode.BACKGROUND_CARD_HEIGHT_COIN_MODE :
                             AbstractCoinTermNode.BACKGROUND_CARD_HEIGHT_TEXT_MODE;
    this.cardLikeBackground.setRectBounds( this.coinAndTextRootNode.visibleLocalBounds.dilatedXY(
      AbstractCoinTermNode.BACKGROUND_CARD_X_MARGIN,
      ( targetCardHeight - this.coinAndTextRootNode.visibleLocalBounds.height ) / 2
    ) );
    this.cardLikeBackground.opacity = this.coinTerm.cardOpacityProperty.get();
    this.cardLikeBackground.visible = this.cardLikeBackground.opacity > 0;

    // Update the invisible rectangle that mimics and expands upon the bounds.  The amount of dilation was
    // empirically determined.
    this.boundsRect.visible = false;
    this.boundsRect.setRectBounds( this.coinAndTextRootNode.visibleLocalBounds.dilated( 3 ) );
    this.boundsRect.visible = true;

    // update the bounds that are registered with the model
    this.updateBoundsInModel();
  }

  /**
   * update the coin flip animation, used to show or hide the coin values
   * @param {boolean} showCoinValues
   * @private
   */
  updateCoinFlipAnimations( showCoinValues ) {

    if ( this.viewModeProperty.get() === ViewMode.COINS ) {
      if ( this.activeFlipAnimation ) {
        this.activeFlipAnimation.stop();
      }

      const targetFlipState = showCoinValues ? 1 : 0;

      if ( this.flipStateProperty.get() !== targetFlipState ) {

        // use an animation to depict the coin flip
        this.activeFlipAnimation = new Animation( {
          duration: COIN_FLIP_TIME,
          easing: Easing.CUBIC_IN_OUT,
          setValue: newFlipState => {
            this.flipStateProperty.set( newFlipState );
          },
          from: this.flipStateProperty.get(),
          to: targetFlipState
        } );
        this.activeFlipAnimation.finishEmitter.addListener( () => {
          this.activeFlipAnimation = null;
        } );
        this.activeFlipAnimation.start();
      }
    }
    else {

      // do the change immediately, heads if NOT showing coin values, tails if we are
      this.flipStateProperty.set( showCoinValues ? 1 : 0 );
    }
  }

  /**
   * update the scale and visibility of the images in order to make it look like the coin is flipping, works in
   * conjunction with the "flipState" variable to perform the flip animation
   * @param {number} flipState
   * @private
   */
  updateFlipAppearance( flipState ) {

    assert && assert( this.coinBackImageNode, 'options were not correctly set on this node to support coin flip' );

    // Use the y scale as the 'full scale' value.  This assumes that the two images are the same size, that they are
    // equal in width and height when unscaled, and that the Y dimension is not being scaled.
    const fullScale = this.coinFrontImageNode.getScaleVector().y;

    const centerX = this.coinTerm.coinRadius;

    // set the width of the front image
    this.coinFrontImageNode.setScaleMagnitude(
      Math.max( ( 1 - 2 * flipState ) * fullScale, MIN_SCALE_FOR_FLIP ),
      fullScale
    );
    this.coinFrontImageNode.centerX = centerX;

    // set the width of the back image
    this.coinBackImageNode.setScaleMagnitude(
      Math.max( 2 * ( flipState - 0.5 ) * fullScale, MIN_SCALE_FOR_FLIP ),
      fullScale
    );
    this.coinBackImageNode.centerX = centerX;

    // set the width of the coin value text
    this.coinValueText.setScaleMagnitude( Math.max( 2 * ( flipState - 0.5 ), MIN_SCALE_FOR_FLIP ), 1 );
    this.coinValueText.centerX = this.coinTerm.coinRadius;

    // set visibility of both images and the value text
    this.coinFrontImageNode.visible = flipState <= 0.5;
    this.coinBackImageNode.visible = flipState >= 0.5;
    this.coinValueText.visible = this.coinBackImageNode.visible;
  }

  /**
   * @public
   */
  dispose() {
    this.disposeVariableCoinTermNode();
    super.dispose();
  }
}

expressionExchange.register( 'VariableCoinTermNode', VariableCoinTermNode );

export default VariableCoinTermNode;