// Copyright 2016, University of Colorado Boulder

/**
 * a Scenery node that represents a coin in the view
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/explore/model/ViewMode' );

  // constants
  var TERM_TEXT = new PhetFont( { family: '"Times New Roman", serif', size: 28, weight: 'bold', style: 'italic' });

  /**
   * @param {Coin} coin - model of a coin
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @constructor
   */
  function CoinNode( coin, viewModeProperty ) {
    var self = this;
    Node.call( this, { pickable: true, cursor: 'pointer' } );

    // add the coin image node that is appropriate for this coin's term string
    var image = coin.termInfo.coinFrontImage;
    var coinImageNode = new Image( image );
    coinImageNode.scale( coin.termInfo.coinDiameter / coinImageNode.width );
    this.addChild( coinImageNode );

    // add the representation that will be shown when in 'VARIABLES' mode
    // TODO: This will need to be replaced with a more mathematical looking term, using plain text for now
    var termText = new SubSupText( coin.termInfo.subSupText, { font: TERM_TEXT } );
    termText.mouseArea = termText.bounds.dilated( 10 );
    termText.touchArea = termText.bounds.dilated( 10 );
    termText.center = coinImageNode.center;
    this.addChild( termText );

    // switch the visibility of the different representations based on the view mode
    viewModeProperty.link( function( representationMode ){
      termText.visible = representationMode === ViewMode.VARIABLES;
      coinImageNode.visible = representationMode === ViewMode.COINS;
    } );

    // move this node as the model representation moves
    coin.positionProperty.link( function( position ) {
      self.center = position;
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