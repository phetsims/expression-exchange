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


  /**
   * @param {Coin} coin - model of a coin
   * @constructor
   */
  function CoinNode( coin ) {
    var self = this;
    Node.call( this, { pickable: true, cursor: 'pointer' } );
    this.addChild( CoinNode.createCoinRepresentation( coin.value ) );

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

  return inherit( Node, CoinNode, {}, {

    // create the representation for a coin of the given denomination
    createCoinRepresentation: function( denomination ) {
      var coinRepresentation;
      switch( denomination ) {
        case 2:
          coinRepresentation = new Image( coin2CentsImage );
          break;
        case 4:
          coinRepresentation = new Image( coin4CentsImage );
          break;
        case 5:
          coinRepresentation = new Image( coin5CentsImage );
          break;
        case 10:
          coinRepresentation = new Image( coin10CentsImage );
          break;
        case 25:
          coinRepresentation = new Image( coin25CentsImage );
          break;
        case 100:
          coinRepresentation = new Image( coin100CentsImage );
          break;
        default:
          assert && assert( false, 'unsupported coin denomination' );
          coinRepresentation = new Circle( 20, { fill: 'pink' } );
          break;
      }
      return coinRepresentation;

    }
  } );
} );