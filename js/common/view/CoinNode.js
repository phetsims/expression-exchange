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
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

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
        case 1:
          coinRepresentation = new Circle( 20, { fill: 'red' } );
          break;
        case 2:
          coinRepresentation = new Circle( 30, { fill: 'cyan' } );
          break;
        case 5:
          coinRepresentation = new Circle( 40, { fill: 'yellow' } );
          break;
        case 10:
          coinRepresentation = new Circle( 50, { fill: 'orange' } );
          break;
        case 25:
          coinRepresentation = new Circle( 60, { fill: 'green' } );
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