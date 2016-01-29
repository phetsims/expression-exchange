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

  // constants
  var TERM_FONT = new PhetFont( { family: '"Times New Roman", serif', size: 34, style: 'italic' });
  var NUMBER_FONT = new PhetFont( { size: 34 });

  /**
   * @param {CoinTerm} coinTerm - model of a coin
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @param {Property.<boolean>} showAllCoefficientsProperty - controls whether 1 is shown for non-combined coins
   * @param {Property.<boolean>} showCoinValuesProperty - controls whether or not coin value is shown
   * @constructor
   */
  function CoinTermNode( coinTerm, viewModeProperty, showCoinValuesProperty, showAllCoefficientsProperty ) {
    var self = this;
    Node.call( this, { pickable: true, cursor: 'pointer' } );

    // add the coin image node that is appropriate for this coin's term string
    var image = coinTerm.coinFrontImage;
    var coinImageNode = new Image( image );
    coinImageNode.scale( coinTerm.coinDiameter / coinImageNode.width );
    this.addChild( coinImageNode );

    // control coin image visibility
    viewModeProperty.link( function( representationMode ){
      coinImageNode.visible = representationMode === ViewMode.COINS;
    } );

    // add the representation that will be shown when view in 'VARIABLES' mode
    var termText = new SubSupText( coinTerm.termText, { font: TERM_FONT } );
    termText.mouseArea = termText.bounds.dilated( 10 );
    termText.touchArea = termText.bounds.dilated( 10 );
    termText.center = coinImageNode.center;
    this.addChild( termText );

    // switch the visibility of the term text based on the view mode
    var termTextVisibleProperty = new DerivedProperty( [
        viewModeProperty,
        showCoinValuesProperty ],
      function( viewMode, showCoinValues ) {
        return ( viewMode === ViewMode.VARIABLES && !showCoinValues );
      } );
    termTextVisibleProperty.linkAttribute( termText, 'visible' );

    // add the value that will be shown when the showCoinValuesProperty is true
    var valueText = new SubSupText( '', {
      font: TERM_FONT,
      center: coinImageNode.center
    } );
    this.addChild( valueText );

    // update the value text when the properties that affect it change
    Property.multilink( [ viewModeProperty, coinTerm.termValueTextProperty ], function(){
      if ( viewModeProperty.value === ViewMode.COINS ){
        valueText.text = coinTerm.coinValue.toString();
      }
      else{
        valueText.text = coinTerm.termValueTextProperty.value;
      }
      valueText.center = coinImageNode.center;
    } );

    // control the visibility of the value labels
    showCoinValuesProperty.linkAttribute( valueText, 'visible' );

    // add the coefficient value
    var coefficientText = new Text( '', {
      font: NUMBER_FONT
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
        coefficientText.right = valueText.left - 3;
        coefficientText.y = valueText.y;
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
      self.right = position.x + coinImageNode.width / 2;
      self.centerY = position.y;
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