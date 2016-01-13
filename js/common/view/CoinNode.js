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
  var coin2CentsImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-2-cents.png' );
  var coin4CentsImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-4-cents.png' );
  var coin5CentsImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-5-cents.png' );
  var coin10CentsImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-10-cents-a.png' );
  var coin25CentsImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-25-cents.png' );
  var coin100CentsImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-100-cents.png' );

  // map of coin terms to images
  var TERM_STRING_TO_IMAGES_MAP = {
    'x': { frontImage: coin2CentsImage },
    '2*x': { frontImage: coin2CentsImage },
    'x^2': { frontImage: coin2CentsImage },
    'y': { frontImage: coin2CentsImage },
    '3*y': { frontImage: coin2CentsImage },
    'y^2': { frontImage: coin2CentsImage },
    'z': { frontImage: coin2CentsImage },
    'x*y': { frontImage: coin2CentsImage },
    'x^2*y^2': { frontImage: coin2CentsImage }
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