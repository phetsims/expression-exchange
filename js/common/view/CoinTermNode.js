// Copyright 2016, University of Colorado Boulder

/**
 * a Scenery node that represents a coin in the view
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/explore/model/ViewMode' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var TERM_AND_VALUE_FONT = new PhetFont( { family: '"Times New Roman", serif', size: 34, style: 'italic' });
  var COEFFICIENT_FONT = new PhetFont( { size: 34 });

  /**
   * @param {CoinTerm} coinTerm - model of a coin
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @param {Property.<boolean>} showCoinValuesProperty - controls whether or not coin value is shown
   * @param {Property.<boolean>} showVariableValuesProperty - controls whether or not variable values are shown
   * @param {Property.<boolean>} showAllCoefficientsProperty - controls whether 1 is shown for non-combined coins
   * @constructor
   */
  function CoinTermNode( coinTerm, viewModeProperty, showCoinValuesProperty, showVariableValuesProperty, showAllCoefficientsProperty ) {
    var self = this;
    Node.call( this, { pickable: true, cursor: 'pointer' } );

    // add the image that represents the front of the coin
    var image = coinTerm.coinFrontImage;
    var coinImageNode = new Image( image );
    coinImageNode.scale( coinTerm.coinDiameter / coinImageNode.width );
    this.addChild( coinImageNode );

    // control front coin image visibility
    viewModeProperty.link( function( representationMode ){
      coinImageNode.visible = representationMode === ViewMode.COINS;
    } );
    
    // convenience variable for positioning the textual labels created below
    var coinCenter = new Vector2( coinImageNode.width / 2, coinImageNode.height / 2);
    
    // add the coin value text
    var coinValueText = new Text( coinTerm.coinValue, { font: TERM_AND_VALUE_FONT, center: coinCenter } );
    this.addChild( coinValueText );
    
    // control the coin value text visibility
    var coinValueVisibleProperty = new DerivedProperty( [ viewModeProperty, showCoinValuesProperty ],
      function( viewMode, showCoinValues ) {
        return ( viewMode === ViewMode.COINS && showCoinValues );
      } );
    coinValueVisibleProperty.linkAttribute( coinValueText, 'visible' );

    // add the 'term' text, e.g. xy
    var termText = new SubSupText( coinTerm.termText, { 
      font: TERM_AND_VALUE_FONT,
      center: coinCenter
    } );
    // TODO: Can I dilate the mouse and touch areas in the constructor?
    termText.mouseArea = termText.bounds.dilated( 10 );
    termText.touchArea = termText.bounds.dilated( 10 );
    this.addChild( termText );

    // control the term text visibility
    var termTextVisibleProperty = new DerivedProperty( [ viewModeProperty, showVariableValuesProperty ],
      function( viewMode, showVariableValues ) {
        return ( viewMode === ViewMode.VARIABLES && !showVariableValues );
      } );
    termTextVisibleProperty.linkAttribute( termText, 'visible' );

    // Add the text that includes the variable values.  This can change, so it starts off blank.
    var termWithVariableValuesText = new SubSupText( '', { font: TERM_AND_VALUE_FONT } );
    this.addChild( termWithVariableValuesText );

    // update the variable text when it changes, which is triggered by changes to the underlying variable values
    coinTerm.termValueTextProperty.link( function( termValueText ){
      termWithVariableValuesText.text = termValueText;
      termWithVariableValuesText.center = coinCenter;
      termWithVariableValuesText.mouseArea = termWithVariableValuesText.bounds.dilated( 10 );
      termWithVariableValuesText.touchArea = termWithVariableValuesText.bounds.dilated( 10 );
    } );
    
    // control the visibility of the value text
    var variableTextVisibleProperty = new DerivedProperty( [ viewModeProperty, showVariableValuesProperty ],
      function( viewMode, showVariableValues ) {
        return ( viewMode === ViewMode.VARIABLES && showVariableValues );
      } );
    variableTextVisibleProperty.linkAttribute( termWithVariableValuesText, 'visible' );

    // add the coefficient value
    var coefficientText = new Text( '', {
      font: COEFFICIENT_FONT
    } );
    this.addChild( coefficientText );

    // create a little helper function for positioning the coefficient
    function updateCoefficientPosition(){
      if ( viewModeProperty.value === ViewMode.COINS ){
        coefficientText.right = coinImageNode.left - 3; // tweak factor empirically determined
        coefficientText.centerY = coinImageNode.centerY;
      }
      else if ( termTextVisibleProperty.value ){
        coefficientText.right = termText.left - 3;
        coefficientText.y = termText.y;
      }
      else{
        coefficientText.right = termWithVariableValuesText.left - 3;
        coefficientText.y = termWithVariableValuesText.y;
      }
    }

    // update the coefficient text when the value changes
    coinTerm.coinCountProperty.link( function( coinCount ) {
      coefficientText.text = coinCount;
      updateCoefficientPosition();
    } );

    // control the visibility of the coefficient text
    var coefficientVisibleProperty = new DerivedProperty( [
        coinTerm.coinCountProperty,
        showAllCoefficientsProperty ],
      function( coinCount, showAllCoefficients ) {
        return ( coinCount > 1 || showAllCoefficients );
      } );
    coefficientVisibleProperty.linkAttribute( coefficientText, 'visible' );

    // position the coefficient to line up well with the text or the code
    // TODO: Consider listening to bounds of the value text instead so there is no order dependency for processing property changes
    Property.multilink( [ viewModeProperty, coinTerm.termValueTextProperty, termTextVisibleProperty ], updateCoefficientPosition );

    // move this node as the model representation moves
    coinTerm.positionProperty.link( function( position ) {
      // the intent here is to position the center of the coin at the position, NOT the center of the node
      self.x = position.x - coinCenter.x;
      self.y = position.y - coinCenter.y;
    } );

    // add the listener that will allow the user to drag the coin around
    this.addInputListener( new SimpleDragHandler( {

      // allow moving a finger (touch) across a node to pick it up
      allowTouchSnag: true,

      // handler that moves the shape in model space
      translate: function( translationParams ) {
        coinTerm.position = coinTerm.position.plus( translationParams.delta );
        return translationParams.position;
      },

      start: function( event, trail ) {
        coinTerm.userControlled = true;
      },

      end: function( event, trail ) {
        coinTerm.userControlled = false;
      }
    } ) );

    // add a listener that will pop this coin to the front when selected by the user
    coinTerm.userControlledProperty.onValue( true, function(){ self.moveToFront(); } );
  }

  return inherit( Node, CoinTermNode, {} );
} );