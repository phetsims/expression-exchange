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
  var CoinNodeFactory = require( 'EXPRESSION_EXCHANGE/common/view/CoinNodeFactory' );
  var EEQueryParameters = require( 'EXPRESSION_EXCHANGE/common/EEQueryParameters' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );

  // constants
  var VALUE_FONT = new PhetFont( { size: 34 } );
  var VARIABLE_FONT = new MathSymbolFont( 36 );
  var COEFFICIENT_FONT = new PhetFont( { size: 34 } );
  var COEFFICIENT_X_SPACING = 3;

  /**
   * @param {CoinTerm} coinTerm - model of a coin
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @param {Property.<boolean>} showCoinValuesProperty - controls whether or not coin value is shown
   * @param {Property.<boolean>} showVariableValuesProperty - controls whether or not variable values are shown
   * @param {Property.<boolean>} showAllCoefficientsProperty - controls whether 1 is shown for non-combined coins
   * @param {Object} options
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

    // add the image that represents the front of the coin
    var coinImageNode = CoinNodeFactory.createFrontImageNode( coinTerm.typeID, coinTerm.coinRadius );
    this.coinAndTextRootNode.addChild( coinImageNode );

    // convenience var
    var textBaseline = AbstractCoinTermNode.TEXT_BASELINE_Y_OFFSET;

    // add the coin value text
    var coinValueText = new Text( '', { font: VALUE_FONT } );
    this.coinAndTextRootNode.addChild( coinValueText );

    // add the 'term' text, e.g. xy
    var termText = new SubSupText( 'temp', { font: VARIABLE_FONT } );
    this.coinAndTextRootNode.addChild( termText );

    // Add the text that includes the variable values.  This can change, so it starts off blank.
    var termWithVariableValuesText = new SubSupText( ' ', { font: VARIABLE_FONT } );
    this.coinAndTextRootNode.addChild( termWithVariableValuesText );

    // add the coefficient value
    var coefficientText = new Text( '', {
      font: COEFFICIENT_FONT
    } );
    this.coinAndTextRootNode.addChild( coefficientText );

    // helper function to take the view bounds information and communicate it to the model
    function updateBoundsInModel() {

      // make the bounds relative to the coin term's position, which corresponds to the center of the coin
      var relativeVisibleBounds = self.coinAndTextRootNode.visibleLocalBounds;

      // TODO:  The following is some potentially temporary code to try out making the overall bounds remain the same
      // TODO:  for the two different view modes so that the expressions don't expand/collapse as the modes change.
      // TODO:  This will need to be moved out or kept based on the feedback we get.  See
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
    function updateRepresentation() {

      // TODO: This is originally being written with no thought given to performance, may need to optimize

      // control front coin image visibility
      coinImageNode.visible = viewModeProperty.value === ViewMode.COINS;

      // update coin value text
      coinValueText.text = coinTerm.valueProperty.value;
      coinValueText.center = Vector2.ZERO;
      coinValueText.visible = viewModeProperty.value === ViewMode.COINS && showCoinValuesProperty.value;

      // determine if the coefficient is visible, since this will be used several times below
      var coefficientVisible = Math.abs( coinTerm.combinedCountProperty.value ) !== 1 ||
                               showAllCoefficientsProperty.value;

      // update the term text, which only changes if it switches from positive to negative
      if ( coinTerm.combinedCount < 0 && !coefficientVisible && coinTerm.showMinusSignWhenNegative ) {
        termText.text = '-' + coinTerm.termText;
      }
      else {
        termText.text = coinTerm.termText;
      }
      termText.centerX = 0;
      termText.y = textBaseline;
      termText.mouseArea = termText.localBounds.dilated( 10 );
      termText.touchArea = termText.localBounds.dilated( 10 );
      termText.visible = viewModeProperty.value === ViewMode.VARIABLES && !showVariableValuesProperty.value;

      // term value text, which shows the variable values and operators such as exponents
      var termValueText = coinTerm.termValueTextProperty.value;
      if ( coinTerm.combinedCount === -1 && !showAllCoefficientsProperty.value && coinTerm.showMinusSignWhenNegative ) {
        // prepend a minus sign
        termValueText = '-' + termValueText;
      }

      termWithVariableValuesText.text = termValueText;
      termWithVariableValuesText.centerX = 0;
      termWithVariableValuesText.y = textBaseline;
      termWithVariableValuesText.mouseArea = termWithVariableValuesText.localBounds.dilated( 10 );
      termWithVariableValuesText.touchArea = termWithVariableValuesText.localBounds.dilated( 10 );
      termWithVariableValuesText.visible = viewModeProperty.value === ViewMode.VARIABLES &&
                                           showVariableValuesProperty.value;

      // coefficient value and visibility
      coefficientText.text = coinTerm.showMinusSignWhenNegative ? coinTerm.combinedCount : Math.abs( coinTerm.combinedCount );
      coefficientText.visible = coefficientVisible;

      // position the coefficient
      if ( viewModeProperty.value === ViewMode.COINS ) {
        coefficientText.right = coinImageNode.left - COEFFICIENT_X_SPACING;
        coefficientText.centerY = coinImageNode.centerY;
      }
      else if ( termText.visible ) {
        coefficientText.right = termText.left - COEFFICIENT_X_SPACING;
        coefficientText.y = textBaseline;
      }
      else {
        coefficientText.right = termWithVariableValuesText.left - COEFFICIENT_X_SPACING;
        coefficientText.y = textBaseline;
      }

      // update the bounds that are registered with the model
      updateBoundsInModel();
    }

    // if anything about the coin term's values changes or any of the display mode, the representation needs to be updated
    // TODO: Need to dispose of this, unlink it, or whatever, to avoid memory leaks
    Property.multilink(
      [
        coinTerm.combinedCountProperty,
        coinTerm.valueProperty,
        coinTerm.termValueTextProperty,
        coinTerm.showMinusSignWhenNegativeProperty,
        viewModeProperty,
        showCoinValuesProperty,
        showVariableValuesProperty,
        showAllCoefficientsProperty
      ],
      updateRepresentation
    );
  }

  expressionExchange.register( 'VariableCoinTermNode', VariableCoinTermNode );

  return inherit( AbstractCoinTermNode, VariableCoinTermNode );
} );