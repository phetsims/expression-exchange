// Copyright 2016, University of Colorado Boulder

/**
 * model of a coin
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * TODO: document parameters once finalized
   * @constructor
   */
  function Coin( value, color, diameter ) {
    PropertySet.call( this, {
      position: Vector2.ZERO // @public
    } );
    this.value = value; // @public, read only
    this.color = color; // @public, read only
    this.diameter = diameter; // @public, read only
  }

  return inherit(
    PropertySet,
    Coin,
    {
      //TODO methods
    },
    {
      // static factory method for creating various coin denominations
      createCoin: function( cents ) {
        var coin;
        switch( cents ) {
          case 1:
            coin = new Coin( 1, new Color( 'green' ), 20 );
            break;
          case 2:
            coin = new Coin( 2, new Color( 'red' ), 30 );
            break;
          case 5:
            coin = new Coin( 5, new Color( 'orange' ), 40 );
            break;
          case 10:
            coin = new Coin( 10, new Color( 'yellow' ), 50 );
            break;
          default:
            assert && assert( false, 'unsupported coin denomination' );
            coin = new Coin( 6.4, new Color( 'pink' ), 100 );
            break;
        }
        return coin;
      }
    }
  );
} );