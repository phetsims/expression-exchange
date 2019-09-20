// Copyright 2016-2019, University of Colorado Boulder

/**
 * a Scenery node that looks like a small version of the coin terms, used in the collection display
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const CoinNodeFactory = require( 'EXPRESSION_EXCHANGE/common/view/CoinNodeFactory' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  const MathSymbols = require( 'SCENERY_PHET/MathSymbols' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const Text = require( 'SCENERY/nodes/Text' );
  const ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );

  // constants
  const COIN_VALUE_FONT = new PhetFont( { size: 12, weight: 'bold' } );
  const VARIABLE_FONT = new MathSymbolFont( 18 );
  const CONSTANT_FONT = new PhetFont( 18 );
  const COIN_SCALING_FACTOR = 0.4; // empirically determined to yield coin icons of the desired size
  const MAX_TERM_WIDTH_PROPORTION = 1.75; // limits how wide text can be relative to coin, empirically determined

  /**
   * @param {CoinTerm} coinTerm - model of a coin
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @param {Property.<boolean>} showCoinValuesProperty - controls whether or not coin value is shown
   * @param {Property.<boolean>} showVariableValuesProperty - controls whether or not variable values are shown
   * @param {Object} [options]
   * @constructor
   */
  function CoinTermIconNode( coinTerm, viewModeProperty, showCoinValuesProperty, showVariableValuesProperty, options ) {

    Node.call( this );

    // add the node that represents the icon
    const coinIconNode = CoinNodeFactory.createIconNode( coinTerm.typeID, coinTerm.coinRadius * COIN_SCALING_FACTOR );
    this.addChild( coinIconNode );

    // control coin icon visibility
    viewModeProperty.link( function( representationMode ) {
      coinIconNode.visible = representationMode === ViewMode.COINS;
    } );

    // convenience variable for positioning the textual labels created below
    const coinCenter = coinIconNode.center;

    // add the coin value text
    const coinValueText = new Text( coinTerm.valueProperty.value, { font: COIN_VALUE_FONT, center: coinCenter } );
    this.addChild( coinValueText );

    // control the coin value text visibility
    Property.multilink( [ viewModeProperty, showCoinValuesProperty ], function( viewMode, showCoinValues ) {
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
      termText.text = MathSymbols.UNARY_MINUS + termText.text;
    }
    termText.center = coinCenter;
    this.addChild( termText );

    // control the term text visibility
    const termTextVisibleProperty = new DerivedProperty(
      [ viewModeProperty, showVariableValuesProperty ],
      function( viewMode, showVariableValues ) {
        return ( viewMode === ViewMode.VARIABLES && !showVariableValues );
      }
    );
    termTextVisibleProperty.linkAttribute( termText, 'visible' );

    // Add the text that includes the variable values.  This can change, so it starts off blank.
    const termWithVariableValuesText = new RichText( ' ', {
      font: coinTerm.isConstant ? CONSTANT_FONT : VARIABLE_FONT,
      maxWidth: maxTextWidth
    } );
    this.addChild( termWithVariableValuesText );

    // update the variable text when it changes, which is triggered by changes to the underlying variable values
    coinTerm.termValueTextProperty.link( function() {
      const termValueText = coinTerm.termValueTextProperty.value;
      const sign = coinTerm.totalCountProperty.get() > 0 ? '' : MathSymbols.UNARY_MINUS;
      termWithVariableValuesText.text = sign + termValueText;
      termWithVariableValuesText.center = coinCenter;
    } );

    // control the visibility of the value text
    Property.multilink( [ viewModeProperty, showVariableValuesProperty ], function( viewMode, showVariableValues ) {
      termWithVariableValuesText.visible = viewMode === ViewMode.VARIABLES && showVariableValues;
    } );

    this.mutate( options );
  }

  expressionExchange.register( 'CoinTermIconNode', CoinTermIconNode );

  return inherit( Node, CoinTermIconNode );
} );