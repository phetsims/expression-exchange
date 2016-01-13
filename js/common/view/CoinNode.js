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
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

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
   * @constructor
   */
  function CoinNode( coin ) {
    var self = this;
    Node.call( this, { pickable: true, cursor: 'pointer' } );
    var image = TERM_STRING_TO_IMAGES_MAP[ coin.termString ].frontImage;
    assert && assert( image, 'no image found for term string: ', coin.termString );
    var imageNode = new Image( image );
    imageNode.scale( coin.diameter / imageNode.width );
    this.addChild( imageNode );

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