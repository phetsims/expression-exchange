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
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/explore/model/ViewMode' );

  // constants
  var TERM_FONT = new PhetFont( { family: '"Times New Roman", serif', size: 34, style: 'italic' });
  var NUMBER_FONT = new PhetFont( { size: 34 });

  /**
   * @param {Coin} coin - model of a coin
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @param {Property.<boolean>} showAllCoefficientsProperty - controls whether 1 is shown for non-combined coins
   * @param {Property.<boolean>} showValuesProperty - controls whether or not coin value is shown
   * @constructor
   */
  function CoinNode( coin, viewModeProperty, showValuesProperty, showAllCoefficientsProperty ) {
    var self = this;
    Node.call( this, { pickable: true, cursor: 'pointer' } );

    // add the coin image node that is appropriate for this coin's term string
    var image = coin.termInfo.coinFrontImage;
    var coinImageNode = new Image( image );
    coinImageNode.scale( coin.termInfo.coinDiameter / coinImageNode.width );
    this.addChild( coinImageNode );

    // control coin image visibility
    viewModeProperty.link( function( representationMode ){
      coinImageNode.visible = representationMode === ViewMode.COINS;
    } );

    // add the representation that will be shown when view in 'VARIABLES' mode
    // TODO: This will need to be replaced with a more mathematical looking term, using plain text for now
    var termText = new SubSupText( coin.termInfo.subSupText, { font: TERM_FONT } );
    termText.mouseArea = termText.bounds.dilated( 10 );
    termText.touchArea = termText.bounds.dilated( 10 );
    termText.center = coinImageNode.center;
    this.addChild( termText );

    // switch the visibility of the term text based on the view mode
    var termTextVisibleProperty = new DerivedProperty( [
        viewModeProperty,
        showValuesProperty ],
      function( viewMode, showValues ) {
        return ( viewMode === ViewMode.VARIABLES && !showValues );
      } );
    termTextVisibleProperty.linkAttribute( termText, 'visible' );

    // add the value that will be shown when the showValuesProperty is true
    var valueText = new Text( coin.termInfo.value, {
      font: NUMBER_FONT,
      center: coinImageNode.center
    } );
    this.addChild( valueText );

    // control the visibility of the value labels
    showValuesProperty.linkAttribute( valueText, 'visible' );

    // add the coefficient value
    var coefficientText = new Text( '', {
      font: NUMBER_FONT
    } );
    this.addChild( coefficientText );

    // update the coefficient text when the value changes
    coin.coinCountProperty.link( function( coinCount ) {
      coefficientText.text = coinCount;
      coefficientText.right = coinImageNode.left - 5; // tweak factor empirically determined
      coefficientText.centerY = coinImageNode.centerY
    } );

    // control the visibility of the coefficient text
    var coefficientVisibleProperty = new DerivedProperty( [
        coin.coinCountProperty,
        showAllCoefficientsProperty ],
      function( coinCount, showAllCoefficients ) {
        return ( coinCount > 1 || showAllCoefficients );
      } );
    coefficientVisibleProperty.linkAttribute( coefficientText, 'visible' );

    // move this node as the model representation moves
    coin.positionProperty.link( function( position ) {
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
        coin.position = coin.position.plus( translationParams.delta );
        return translationParams.position;
      },

      start: function( event, trail ) {
        coin.userControlled = true;
      },

      end: function( event, trail ) {
        coin.userControlled = false;
      }
    } ) );

    // add a listener that will pop this coin to the front when selected by the user
    coin.userControlledProperty.onValue( true, function(){ self.moveToFront(); } );
  }

  return inherit( Node, CoinNode, {} );
} );