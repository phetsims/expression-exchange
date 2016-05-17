// Copyright 2016, University of Colorado Boulder

/**
 * a Scenery node that looks like a small version of the coin terms, used in the collection display
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTermImageMap = require( 'EXPRESSION_EXCHANGE/common/view/CoinTermImageMap' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ViewModeEnum = require( 'EXPRESSION_EXCHANGE/common/model/ViewModeEnum' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var TERM_AND_VALUE_FONT = new PhetFont( { size: 11 } );
  var SCALING_FACTOR = 0.4; // empirically determined to yield coin icons of the desired size

  /**
   * @param {CoinTerm} coinTerm - model of a coin
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @param {Property.<boolean>} showCoinValuesProperty - controls whether or not coin value is shown
   * @param {Property.<boolean>} showVariableValuesProperty - controls whether or not variable values are shown
   * @param {boolean} addDragHandler - controls whether drag handler hooked up, useful for creator nodes
   * @constructor
   */
  function CoinTermIconNode( coinTerm, viewModeProperty, showCoinValuesProperty, showVariableValuesProperty ) {

    Node.call( this );

    // add the image that represents the front of the coin
    var iconImage = CoinTermImageMap[ coinTerm.typeID ].icon;
    var coinIconNode = new Image( iconImage );
    coinIconNode.scale( coinTerm.coinDiameter / coinIconNode.width * SCALING_FACTOR );
    this.addChild( coinIconNode );

    // control coin icon visibility
    viewModeProperty.link( function( representationMode ) {
      coinIconNode.visible = representationMode === ViewModeEnum.COINS;
    } );

    // convenience variable for positioning the textual labels created below
    var coinCenter = new Vector2( coinIconNode.width / 2, coinIconNode.height / 2 );

    // add the coin value text
    var coinValueText = new Text( coinTerm.valueProperty.value, { font: TERM_AND_VALUE_FONT, center: coinCenter } );
    this.addChild( coinValueText );

    // control the coin value text visibility
    var coinValueVisibleProperty = new DerivedProperty(
      [ viewModeProperty, showCoinValuesProperty ],
      function( viewMode, showCoinValues ) {
        return ( viewMode === ViewModeEnum.COINS && showCoinValues );
      }
    );
    coinValueVisibleProperty.linkAttribute( coinValueText, 'visible' );

    // add the 'term' text, e.g. xy
    var termText = new SubSupText( coinTerm.termText, { font: TERM_AND_VALUE_FONT, center: coinCenter } );
    this.addChild( termText );

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
    this.addChild( termWithVariableValuesText );

    // create a helper function to update the term value text
    function updateTermValueText() {
      var termValueText = coinTerm.termValueTextProperty.value;
      termWithVariableValuesText.text = termValueText;
      termWithVariableValuesText.center = coinCenter;
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
  }

  expressionExchange.register( 'CoinTermIconNode', CoinTermIconNode );

  return inherit( Node, CoinTermIconNode );
} );