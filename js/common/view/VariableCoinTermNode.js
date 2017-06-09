// Copyright 2016, University of Colorado Boulder

/**
 * a Scenery node that represents a coin term whose underlying value can vary in the view
 *
 * REVIEW: Lots of inner functions in a very long constructor. Would highly recommend that this be broken into methods
 * with properties, to reduce complexity.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AbstractCoinTermNode = require( 'EXPRESSION_EXCHANGE/common/view/AbstractCoinTermNode' );
  var CoinNodeFactory = require( 'EXPRESSION_EXCHANGE/common/view/CoinNodeFactory' );
  var EEQueryParameters = require( 'EXPRESSION_EXCHANGE/common/EEQueryParameters' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RichText = require( 'SCENERY_PHET/RichText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );

  // constants
  var COEFFICIENT_FONT = new PhetFont( { size: 34 } );
  var COEFFICIENT_X_SPACING = 3; // in screen coords
  var SUPERSCRIPT_SCALE = 0.65;
  var VALUE_FONT = new PhetFont( { size: 30 } );
  var VARIABLE_FONT = new MathSymbolFont( 36 );
  var COIN_FLIP_TIME = 0.5; // in seconds
  var MIN_SCALE_FOR_FLIP = 0.15;

  // The following constants control how the pointer areas (mouse and touch) are set up for the textual representation
  // of the coin term.  These are empirically determined such that they are easy for users to grab but the don't
  // protrude from expressions.
  var POINTER_AREA_X_DILATION_AMOUNT = 15; // in screen coords
  var POINTER_AREA_Y_DILATION_AMOUNT = 8; // in screen coords, less than X amt to avoid protruding out of expression
  var POINTER_AREA_DOWN_SHIFT = 3; // in screen coords

  /**
   * @param {CoinTerm} coinTerm - model of a coin
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @param {Property.<boolean>} showCoinValuesProperty - controls whether or not coin value is shown
   * @param {Property.<boolean>} showVariableValuesProperty - controls whether or not variable values are shown
   * @param {Property.<boolean>} showAllCoefficientsProperty - controls whether 1 is shown for non-combined coins
   * @param {Object} [options]
   * @constructor
   */
  function VariableCoinTermNode( coinTerm,
                                 viewModeProperty,
                                 showCoinValuesProperty,
                                 showVariableValuesProperty,
                                 showAllCoefficientsProperty,
                                 options ) {

    var self = this;
    AbstractCoinTermNode.call( this, coinTerm, options );

    // view-specific property for controlling the coin flip animation, 0 = heads, 1 = tails, values in between are used
    // to scale the coin term and thus make it look like it's flipping
    var flipStateProperty = new Property( showCoinValuesProperty.get() ? 1 : 0 );

    // add the images for the front and back of the coin
    var coinFrontImageNode = CoinNodeFactory.createImageNode( coinTerm.typeID, coinTerm.coinRadius, true );
    var coinBackImageNode = CoinNodeFactory.createImageNode( coinTerm.typeID, coinTerm.coinRadius, false );

    // add a parent node that contains the two coin images, and also maintains consistent bounds, necessary to prevent
    // a bunch of bounds change notification when the coin term is flipped
    var coinImagesNode = new Rectangle( 0, 0, coinTerm.coinRadius * 2, coinTerm.coinRadius * 2, {
      fill: 'transparent', // invisible
      children: [ coinFrontImageNode, coinBackImageNode ],
      x: -coinTerm.coinRadius,
      y: -coinTerm.coinRadius
    } );
    this.coinAndTextRootNode.addChild( coinImagesNode );

    // convenience var
    var textBaseline = AbstractCoinTermNode.TEXT_BASELINE_Y_OFFSET;

    // add the coin value text
    var coinValueText = new Text( '', { font: VALUE_FONT } );
    coinImagesNode.addChild( coinValueText );

    // add the 'term' text, e.g. xy
    var termText = new RichText( 'temp', { font: VARIABLE_FONT, supScale: SUPERSCRIPT_SCALE } );
    this.coinAndTextRootNode.addChild( termText );

    // Add the text that includes the variable values.  This can change, so it starts off blank.
    var termWithVariableValuesText = new RichText( ' ', { font: VARIABLE_FONT, supScale: SUPERSCRIPT_SCALE } );
    this.coinAndTextRootNode.addChild( termWithVariableValuesText );

    // add the coefficient value
    var coefficientText = new Text( '', {
      font: COEFFICIENT_FONT
    } );
    this.coinAndTextRootNode.addChild( coefficientText );

    // helper function to take the view bounds information and communicates it to the model
    function updateBoundsInModel() {

      // make the bounds relative to the coin term's position, which corresponds to the center of the coin
      var relativeVisibleBounds = self.coinAndTextRootNode.visibleLocalBounds;

      // Expressions are kept the same width whether the view mode is set to coins or variables, but it is possible to
      // override this behavior using a query parameter.  This behavior is being retained in case we ever want to
      // experiment with it in the future.  See https://github.com/phetsims/expression-exchange/issues/10
      if ( !EEQueryParameters.adjustExpressionWidth ) {

        var width = Math.max( coinImagesNode.width, termText.width, termWithVariableValuesText.width );

        if ( coefficientText.visible || Math.abs( coinTerm.totalCountProperty.get() ) > 1 ) {
          width += coefficientText.width + COEFFICIENT_X_SPACING;
        }

        // set the view bounds such that the non-coefficient portion is always the same width
        relativeVisibleBounds = relativeVisibleBounds.dilatedX( ( width - relativeVisibleBounds.width ) / 2 );
      }

      // only update if the bounds have changed in order to avoid unnecessary updates in other portions of the code
      if ( !coinTerm.localViewBoundsProperty.get() || !coinTerm.localViewBoundsProperty.get().equals( relativeVisibleBounds ) ) {
        coinTerm.localViewBoundsProperty.set( relativeVisibleBounds );
      }
    }

    // function that updates all nodes that comprise this composite node
    function updateRepresentation() {

      // TODO: this was written with no thought given to performance, may need to optimize

      var scale = coinTerm.scaleProperty.get(); // for convenience

      // control front coin image visibility
      var desiredCoinImageWidth = coinTerm.coinRadius * 2 * scale;
      if ( coinImagesNode.width !== desiredCoinImageWidth ) {
        coinImagesNode.setScaleMagnitude( 1 );
        coinImagesNode.setScaleMagnitude( desiredCoinImageWidth / coinImagesNode.width );
        coinImagesNode.center = Vector2.ZERO;
      }
      coinImagesNode.visible = viewModeProperty.value === ViewMode.COINS;

      // update coin value text
      coinValueText.text = coinTerm.valueProperty.value;
      coinValueText.centerX = coinTerm.coinRadius;
      coinValueText.centerY = coinTerm.coinRadius;

      // determine if the coefficient is visible, since this will be used several times below
      var coefficientVisible = Math.abs( coinTerm.totalCountProperty.get() ) !== 1 ||
                               showAllCoefficientsProperty.value;

      // update the term text, which only changes if it switches from positive to negative
      termText.setScaleMagnitude( scale );
      if ( coinTerm.totalCountProperty.get() < 0 && !coefficientVisible &&
           coinTerm.showMinusSignWhenNegativeProperty.get() ) {

        termText.text = '-' + coinTerm.termText;
      }
      else {
        termText.text = coinTerm.termText;
      }
      termText.centerX = 0;
      termText.y = textBaseline * scale;
      termText.mouseArea = termText.localBounds
        .dilatedXY( POINTER_AREA_X_DILATION_AMOUNT, POINTER_AREA_Y_DILATION_AMOUNT )
        .shiftedY( POINTER_AREA_DOWN_SHIFT );
      termText.touchArea = termText.mouseArea;
      termText.visible = viewModeProperty.value === ViewMode.VARIABLES && !showVariableValuesProperty.value;

      // term value text, which shows the variable values and operators such as exponents
      var termValueText = coinTerm.termValueTextProperty.value;
      if ( coinTerm.totalCountProperty.get() === -1 && !showAllCoefficientsProperty.value &&
           coinTerm.showMinusSignWhenNegativeProperty.get() ) {
        // prepend a minus sign
        termValueText = '-' + termValueText;
      }

      termWithVariableValuesText.setScaleMagnitude( scale );
      termWithVariableValuesText.text = termValueText;
      termWithVariableValuesText.centerX = 0;
      termWithVariableValuesText.y = textBaseline * scale;
      termWithVariableValuesText.mouseArea = termWithVariableValuesText.localBounds
        .dilatedX( POINTER_AREA_X_DILATION_AMOUNT )
        .dilatedY( POINTER_AREA_Y_DILATION_AMOUNT )
        .shiftedY( POINTER_AREA_DOWN_SHIFT );
      termWithVariableValuesText.touchArea = termWithVariableValuesText.mouseArea;
      termWithVariableValuesText.visible = viewModeProperty.value === ViewMode.VARIABLES &&
                                           showVariableValuesProperty.value;

      // coefficient value and visibility
      coefficientText.setScaleMagnitude( scale );
      coefficientText.text = coinTerm.showMinusSignWhenNegativeProperty.get() ?
                             coinTerm.totalCountProperty.get() :
                             Math.abs( coinTerm.totalCountProperty.get() );
      coefficientText.visible = coefficientVisible;

      // position the coefficient
      if ( viewModeProperty.value === ViewMode.COINS ) {
        coefficientText.right = coinImagesNode.left - COEFFICIENT_X_SPACING;
        coefficientText.centerY = coinImagesNode.centerY;
      }
      else if ( termText.visible ) {
        coefficientText.right = termText.left - COEFFICIENT_X_SPACING;
        coefficientText.y = textBaseline * scale;
      }
      else {
        coefficientText.right = termWithVariableValuesText.left - COEFFICIENT_X_SPACING;
        coefficientText.y = textBaseline * scale;
      }

      // update the card background
      self.cardLikeBackground.visible = false; // make sure card is invisible so it doesn't affect visible bounds
      self.cardLikeBackground.setRectBounds( self.coinAndTextRootNode.visibleLocalBounds.dilated( 10 ) );
      if ( coinTerm.cardOpacityProperty.get() === 0 ) {
        self.cardLikeBackground.visible = false;
      }
      else {
        self.cardLikeBackground.visible = true;
        self.cardLikeBackground.opacity = coinTerm.cardOpacityProperty.get();
      }

      // update the bounds that are registered with the model
      updateBoundsInModel();
    }

    // if anything about the coin term's values changes or any of the display mode, the representation needs to be updated
    var updateRepresentationMultilink = Property.multilink(
      [
        coinTerm.totalCountProperty,
        coinTerm.valueProperty,
        coinTerm.termValueTextProperty,
        coinTerm.showMinusSignWhenNegativeProperty,
        coinTerm.cardOpacityProperty,
        coinTerm.scaleProperty,
        viewModeProperty,
        showCoinValuesProperty,
        showVariableValuesProperty,
        showAllCoefficientsProperty
      ],
      updateRepresentation
    );

    // hook up the code for initiating flip animations
    var activeFlipAnimation = null;

    function updateCoinFlipAnimations( showCoinValues ) {

      if ( viewModeProperty.get() === ViewMode.COINS ) {
        if ( activeFlipAnimation ) {
          activeFlipAnimation.stop();
        }

        var targetFlipState = showCoinValues ? 1 : 0;

        // use an tween to change the flip state over time
        activeFlipAnimation = new TWEEN.Tween( { flipState: flipStateProperty.get() } )
          .to( { flipState: targetFlipState }, COIN_FLIP_TIME * 1000 )
          .easing( TWEEN.Easing.Cubic.InOut )
          .start( phet.joist.elapsedTime )
          .onUpdate( function() { flipStateProperty.set( this.flipState ); } )
          .onComplete( function() {
            activeFlipAnimation = null;
          } );
      }
      else {

        // do the change immediately, heads if NOT showing coin values, tails if we are
        flipStateProperty.set( showCoinValues ? 1 : 0 );
      }
    }

    showCoinValuesProperty.link( updateCoinFlipAnimations );

    // adjust the coin images when the flipped state changes
    flipStateProperty.link( function( flipState ) {

      // Use the y scale as the 'full scale' value.  This assumes that the two images are the same size, that they are
      // equal in width and height when unscaled, and that the Y dimension is not being scaled.
      var fullScale = coinFrontImageNode.getScaleVector().y;

      // set the width of the front image
      coinFrontImageNode.setScaleMagnitude(
        Math.max( ( 1 - 2 * flipState ) * fullScale, MIN_SCALE_FOR_FLIP ),
        fullScale
      );
      coinFrontImageNode.centerX = coinImagesNode.width / 2;

      // set the width of the back image
      coinBackImageNode.setScaleMagnitude(
        Math.max( 2 * ( flipState - 0.5 ) * fullScale, MIN_SCALE_FOR_FLIP ),
        fullScale
      );
      coinBackImageNode.centerX = coinImagesNode.width / 2;
      coinBackImageNode.centerX = coinImagesNode.width / 2;

      // set the width of the coin value text
      coinValueText.setScaleMagnitude( Math.max( 2 * ( flipState - 0.5 ), MIN_SCALE_FOR_FLIP ), 1 );
      coinValueText.centerX = coinTerm.coinRadius;

      // set visibility of both images and the value text
      coinFrontImageNode.visible = flipState <= 0.5;
      coinBackImageNode.visible = flipState >= 0.5;
      coinValueText.visible = coinBackImageNode.visible;
    } );

    // @private
    this.disposeVariableCoinTermNode = function() {
      updateRepresentationMultilink.dispose();
      showCoinValuesProperty.unlink( updateCoinFlipAnimations );
    };
  }

  expressionExchange.register( 'VariableCoinTermNode', VariableCoinTermNode );

  return inherit( AbstractCoinTermNode, VariableCoinTermNode, {

    // @public
    dispose: function() {
      this.disposeVariableCoinTermNode();
      AbstractCoinTermNode.prototype.dispose.call( this );
    }
  } );
} );