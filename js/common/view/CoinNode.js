// Copyright 2016, University of Colorado Boulder

/**
 * a Scenery node that represents a coin in the view
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/explore/model/ViewMode' );

  // images
  var coinXImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x.png' );
  var coinXSquaredImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared.png' );
  var coinXSquareYSquaredImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared-y-squared.png' );
  var coinXYImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-xy.png' );
  var coinYImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y.png' );
  var coinYSquaredImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y-squared.png' );
  var coinZImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-z.png' );

  // map of coin terms to images
  var TERM_STRING_TO_IMAGES_MAP = {
    'x': { frontImage: coinXImage },
    'x^2': { frontImage: coinXSquaredImage },
    'y': { frontImage: coinYImage },
    'y^2': { frontImage: coinYSquaredImage },
    'z': { frontImage: coinZImage },
    'x*y': { frontImage: coinXYImage },
    'x^2*y^2': { frontImage: coinXSquareYSquaredImage }
  };

  /**
   * @param {Coin} coin - model of a coin
   * @param {Property.<ViewMode>} - controls whether to show the coin or the term
   * @constructor
   */
  function CoinNode( coin, representationTypeProperty ) {
    var self = this;
    Node.call( this, { pickable: true, cursor: 'pointer' } );

    // add the coin image node that is appropriate for this coin's term string
    var image = TERM_STRING_TO_IMAGES_MAP[ coin.termString ].frontImage;
    assert && assert( image, 'no image found for term string: ', coin.termString );
    var coinImageNode = new Image( image );
    coinImageNode.scale( coin.diameter / coinImageNode.width );
    this.addChild( coinImageNode );

    // add the representation that will be shown when in 'TERMS' mode
    var termCircle = new Circle( coin.diameter / 2, {
      fill: 'pink',
      centerX: coinImageNode.width / 2,
      centerY: coinImageNode.height / 2
    } );
    // TODO: This will need to be replaced with a more mathematical looking term, using plain text for now
    var termText = new Text( coin.termString, { font: new PhetFont( 20 ), centerX: 0, centerY: 0 } );
    termCircle.addChild( termText );
    this.addChild( termCircle );

    // switch the visibility of the different representations based on the view mode
    representationTypeProperty.link( function( representationMode ){
      termCircle.visible = representationMode === ViewMode.TERMS;
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
  }

  return inherit( Node, CoinNode, {} );
} );