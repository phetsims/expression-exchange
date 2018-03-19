// Copyright 2016-2017, University of Colorado Boulder

/**
 * a Scenery node that looks like a small version of the coin terms, used in the collection display
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinNodeFactory = require( 'EXPRESSION_EXCHANGE/common/view/CoinNodeFactory' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  var MathSymbols = require( 'SCENERY_PHET/MathSymbols' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );

  // constants
  var COIN_VALUE_FONT = new PhetFont( { size: 12, weight: 'bold' } );
  var VARIABLE_FONT = new MathSymbolFont( 18 );
  var CONSTANT_FONT = new PhetFont( 18 );
  var COIN_SCALING_FACTOR = 0.4; // empirically determined to yield coin icons of the desired size
  var MAX_TERM_WIDTH_PROPORTION = 1.75; // limits how wide text can be relative to coin, empirically determined

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
    var coinIconNode = CoinNodeFactory.createIconNode( coinTerm.typeID, coinTerm.coinRadius * COIN_SCALING_FACTOR );
    this.addChild( coinIconNode );

    // control coin icon visibility
    viewModeProperty.link( function( representationMode ) {
      coinIconNode.visible = representationMode === ViewMode.COINS;
    } );

    // convenience variable for positioning the textual labels created below
    var coinCenter = coinIconNode.center;

    // add the coin value text
    var coinValueText = new Text( coinTerm.valueProperty.value, { font: COIN_VALUE_FONT, center: coinCenter } );
    this.addChild( coinValueText );

    // control the coin value text visibility
    Property.multilink( [ viewModeProperty, showCoinValuesProperty ], function( viewMode, showCoinValues ) {
      coinValueText.visible = viewMode === ViewMode.COINS && showCoinValues;
    } );

    // determine the max width of the textual components
    var maxTextWidth = coinIconNode.width * MAX_TERM_WIDTH_PROPORTION;

    // add the 'term' text, e.g. xy
    var termText = new RichText( coinTerm.termText, {
      font: coinTerm.isConstant ? CONSTANT_FONT : VARIABLE_FONT,
      maxWidth: maxTextWidth
    } );
    if ( coinTerm.totalCountProperty.get() < 0 ) {
      termText.text = MathSymbols.UNARY_MINUS + termText.text;
    }
    termText.center = coinCenter;
    this.addChild( termText );

    // control the term text visibility
    var termTextVisibleProperty = new DerivedProperty(
      [ viewModeProperty, showVariableValuesProperty ],
      function( viewMode, showVariableValues ) {
        return ( viewMode === ViewMode.VARIABLES && !showVariableValues );
      }
    );
    termTextVisibleProperty.linkAttribute( termText, 'visible' );

    // Add the text that includes the variable values.  This can change, so it starts off blank.
    var termWithVariableValuesText = new RichText( ' ', {
      font: coinTerm.isConstant ? CONSTANT_FONT : VARIABLE_FONT,
      maxWidth: maxTextWidth
    } );
    this.addChild( termWithVariableValuesText );

    // update the variable text when it changes, which is triggered by changes to the underlying variable values
    coinTerm.termValueTextProperty.link( function() {
      var termValueText = coinTerm.termValueTextProperty.value;
      var sign = coinTerm.totalCountProperty.get() > 0 ? '' : MathSymbols.UNARY_MINUS;
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