// Copyright 2016-2022, University of Colorado Boulder

/**
 * a Scenery node that looks like a small version of the coin terms, used in the collection display
 *
 * @author John Blanco
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import MathSymbolFont from '../../../../scenery-phet/js/MathSymbolFont.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, RichText, Text } from '../../../../scenery/js/imports.js';
import expressionExchange from '../../expressionExchange.js';
import ViewMode from '../enum/ViewMode.js';
import CoinNodeFactory from './CoinNodeFactory.js';

// constants
const COIN_VALUE_FONT = new PhetFont( { size: 12, weight: 'bold' } );
const VARIABLE_FONT = new MathSymbolFont( 18 );
const CONSTANT_FONT = new PhetFont( 18 );
const COIN_SCALING_FACTOR = 0.4; // empirically determined to yield coin icons of the desired size
const MAX_TERM_WIDTH_PROPORTION = 1.75; // limits how wide text can be relative to coin, empirically determined

class CoinTermIconNode extends Node {

  /**
   * @param {CoinTerm} coinTerm - model of a coin
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @param {Property.<boolean>} showCoinValuesProperty - controls whether or not coin value is shown
   * @param {Property.<boolean>} showVariableValuesProperty - controls whether or not variable values are shown
   * @param {Object} [options]
   */
  constructor( coinTerm, viewModeProperty, showCoinValuesProperty, showVariableValuesProperty, options ) {

    super();

    // add the node that represents the icon
    const coinIconNode = CoinNodeFactory.createIconNode( coinTerm.typeID, coinTerm.coinRadius * COIN_SCALING_FACTOR );
    this.addChild( coinIconNode );

    // control coin icon visibility
    viewModeProperty.link( representationMode => {
      coinIconNode.visible = representationMode === ViewMode.COINS;
    } );

    // convenience variable for positioning the textual labels created below
    const coinCenter = coinIconNode.center;

    // add the coin value text
    const coinValueText = new Text( coinTerm.valueProperty.value, { font: COIN_VALUE_FONT, center: coinCenter } );
    this.addChild( coinValueText );

    // control the coin value text visibility
    Multilink.multilink( [ viewModeProperty, showCoinValuesProperty ], ( viewMode, showCoinValues ) => {
      coinValueText.visible = viewMode === ViewMode.COINS && showCoinValues;
    } );

    // determine the max width of the textual components
    const maxTextWidth = coinIconNode.width * MAX_TERM_WIDTH_PROPORTION;

    // add the 'term' text, e.g. xy
    const termText = new RichText( coinTerm.termText, {
      font: coinTerm.isConstant ? CONSTANT_FONT : VARIABLE_FONT,
      maxWidth: maxTextWidth
    } );
    if ( coinTerm.totalCountProperty.get() < 0 ) {
      termText.string = MathSymbols.UNARY_MINUS + termText.string;
    }
    termText.center = coinCenter;
    this.addChild( termText );

    // control the term text visibility
    const termTextVisibleProperty = new DerivedProperty(
      [ viewModeProperty, showVariableValuesProperty ],
      ( viewMode, showVariableValues ) => viewMode === ViewMode.VARIABLES && !showVariableValues
    );
    termTextVisibleProperty.linkAttribute( termText, 'visible' );

    // Add the text that includes the variable values.  This can change, so it starts off blank.
    const termWithVariableValuesText = new RichText( ' ', {
      font: coinTerm.isConstant ? CONSTANT_FONT : VARIABLE_FONT,
      maxWidth: maxTextWidth
    } );
    this.addChild( termWithVariableValuesText );

    // update the variable text when it changes, which is triggered by changes to the underlying variable values
    coinTerm.termValueStringProperty.link( () => {
      const termValueText = coinTerm.termValueStringProperty.value;
      const sign = coinTerm.totalCountProperty.get() > 0 ? '' : MathSymbols.UNARY_MINUS;
      termWithVariableValuesText.string = sign + termValueText;
      termWithVariableValuesText.center = coinCenter;
    } );

    // control the visibility of the value text
    Multilink.multilink( [ viewModeProperty, showVariableValuesProperty ], ( viewMode, showVariableValues ) => {
      termWithVariableValuesText.visible = viewMode === ViewMode.VARIABLES && showVariableValues;
    } );

    this.mutate( options );
  }
}

expressionExchange.register( 'CoinTermIconNode', CoinTermIconNode );

export default CoinTermIconNode;