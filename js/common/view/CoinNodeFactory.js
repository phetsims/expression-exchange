// Copyright 2016-2018, University of Colorado Boulder

/**
 * static object that provides functions for creating nodes that represent the coins used in the simulation
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var Color = require( 'SCENERY/util/Color' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Path = require( 'SCENERY/nodes/Path' );
  var platform = require( 'PHET_CORE/platform' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // images - use mipmaps normally, but use regular images when memory needs to be conserved
  var useMipmaps = !platform.mobileSafari;
  if ( useMipmaps ) {
    var coinXBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-back.png' );
    var coinXFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x.png' );
    var coinXSquaredBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared-back.png' );
    var coinXSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared.png' );
    var coinXSquaredYSquaredBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared-y-squared-back.png' );
    var coinXSquaredYSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared-y-squared.png' );
    var coinXYBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-xy-back.png' );
    var coinXYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-xy.png' );
    var coinYBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y-back.png' );
    var coinYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y.png' );
    var coinYSquaredBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y-squared-back.png' );
    var coinYSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y-squared.png' );
    var coinZBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-z-back.png' );
    var coinZFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-z.png' );
  }
  else {
    coinXBackImage = require( 'image!EXPRESSION_EXCHANGE/coin-x-back.png' );
    coinXFrontImage = require( 'image!EXPRESSION_EXCHANGE/coin-x.png' );
    coinXSquaredBackImage = require( 'image!EXPRESSION_EXCHANGE/coin-x-squared-back.png' );
    coinXSquaredFrontImage = require( 'image!EXPRESSION_EXCHANGE/coin-x-squared.png' );
    coinXSquaredYSquaredBackImage = require( 'image!EXPRESSION_EXCHANGE/coin-x-squared-y-squared-back.png' );
    coinXSquaredYSquaredFrontImage = require( 'image!EXPRESSION_EXCHANGE/coin-x-squared-y-squared.png' );
    coinXYBackImage = require( 'image!EXPRESSION_EXCHANGE/coin-xy-back.png' );
    coinXYFrontImage = require( 'image!EXPRESSION_EXCHANGE/coin-xy.png' );
    coinYBackImage = require( 'image!EXPRESSION_EXCHANGE/coin-y-back.png' );
    coinYFrontImage = require( 'image!EXPRESSION_EXCHANGE/coin-y.png' );
    coinYSquaredBackImage = require( 'image!EXPRESSION_EXCHANGE/coin-y-squared-back.png' );
    coinYSquaredFrontImage = require( 'image!EXPRESSION_EXCHANGE/coin-y-squared.png' );
    coinZBackImage = require( 'image!EXPRESSION_EXCHANGE/coin-z-back.png' );
    coinZFrontImage = require( 'image!EXPRESSION_EXCHANGE/coin-z.png' );
  }

  // constants
  var COIN_EDGE_DARKENING_AMOUNT = 0.25;
  var COIN_EDGE_STROKE = 0.5;

  // maps for coin images (front and back)
  var coinFrontImages = {};
  coinFrontImages[ CoinTermTypeID.X ] = coinXFrontImage;
  coinFrontImages[ CoinTermTypeID.Y ] = coinYFrontImage;
  coinFrontImages[ CoinTermTypeID.Z ] = coinZFrontImage;
  coinFrontImages[ CoinTermTypeID.X_TIMES_Y ] = coinXYFrontImage;
  coinFrontImages[ CoinTermTypeID.X_SQUARED ] = coinXSquaredFrontImage;
  coinFrontImages[ CoinTermTypeID.Y_SQUARED ] = coinYSquaredFrontImage;
  coinFrontImages[ CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED ] = coinXSquaredYSquaredFrontImage;
  var coinBackImages = {};
  coinBackImages[ CoinTermTypeID.X ] = coinXBackImage;
  coinBackImages[ CoinTermTypeID.Y ] = coinYBackImage;
  coinBackImages[ CoinTermTypeID.Z ] = coinZBackImage;
  coinBackImages[ CoinTermTypeID.X_TIMES_Y ] = coinXYBackImage;
  coinBackImages[ CoinTermTypeID.X_SQUARED ] = coinXSquaredBackImage;
  coinBackImages[ CoinTermTypeID.Y_SQUARED ] = coinYSquaredBackImage;
  coinBackImages[ CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED ] = coinXSquaredYSquaredBackImage;

  // convenience function for drawing round coin shapes
  function createRoundCoinIcon( outerCircleRadius, outerCircleColor, innerCircleRadius, innerCircleColor ) {

    var outerCircle = new Circle( outerCircleRadius, {
      fill: outerCircleColor,
      stroke: outerCircleColor.colorUtilsDarker( COIN_EDGE_DARKENING_AMOUNT ),
      lineWidth: COIN_EDGE_STROKE
    } );

    if ( innerCircleRadius ) {
      outerCircle.addChild( new Circle( innerCircleRadius, {
        fill: innerCircleColor,
        stroke: outerCircleColor.colorUtilsDarker( COIN_EDGE_DARKENING_AMOUNT ),
        lineWidth: COIN_EDGE_STROKE
      } ) );
    }

    return outerCircle;
  }

  // convenience function for drawing hexagonal coin shapes
  function createHexagonalCoinIcon( outerMaxRadius, outerCircleColor, innerCircleRadius, innerCircleColor ) {

    var outerShape = new Shape();
    var vector = Vector2.createPolar( outerMaxRadius, Math.PI * -0.25 ); // angle empirically determined to match coin image
    outerShape.moveToPoint( vector );

    _.times( 6, function() {
      vector.rotate( Math.PI / 3 );
      outerShape.lineTo( vector.x, vector.y );
    } );
    outerShape.close();

    var hexagonalCoinNode = new Path( outerShape, {
      fill: outerCircleColor,
      stroke: outerCircleColor.colorUtilsDarker( COIN_EDGE_DARKENING_AMOUNT ),
      lineWidth: COIN_EDGE_STROKE
    } );

    if ( innerCircleRadius ) {
      hexagonalCoinNode.addChild( new Circle( innerCircleRadius, {
        fill: innerCircleColor,
        stroke: outerCircleColor.colorUtilsDarker( COIN_EDGE_DARKENING_AMOUNT ),
        lineWidth: COIN_EDGE_STROKE
      } ) );
    }

    return hexagonalCoinNode;
  }

  /**
   * static factory object used to create nodes that represent coins
   * @public
   */
  var CoinNodeFactory = {

    /**
     * function to create a node that can be used to represents the front of the provided coin type
     * @param {CoinTermTypeID} coinTermTypeID
     * @param {number} radius
     * @param {boolean} isFront - controls whether the image is the front of back of the coin
     * @returns {Node}
     * @public
     */
    createImageNode: function( coinTermTypeID, radius, isFront ) {

      var imageMap = isFront ? coinFrontImages : coinBackImages;
      var imageNode = new Image( imageMap[ coinTermTypeID ] );

      // scale so that the image node has the specified radius
      imageNode.scale( radius * 2 / imageNode.width );

      return imageNode;
    },

    /**
     * function to create the node that represents the icon for a coin
     * @returns {Node}
     * @param {CoinTermTypeID} coinTermTypeID
     * @param {number} radius
     * @param {Object} [options]
     */
    createIconNode: function( coinTermTypeID, radius, options ) {
      options = options || {};

      var iconNode = null;

      switch( coinTermTypeID ) {

        case CoinTermTypeID.X:
          iconNode = createRoundCoinIcon( radius, new Color( 222, 117, 96 ) );
          break;

        case CoinTermTypeID.Y:
          iconNode = createRoundCoinIcon( radius, new Color( 189, 189, 191 ) );
          break;

        case CoinTermTypeID.Z:
          iconNode = createRoundCoinIcon(
            radius,
            new Color( 238, 203, 24 ),
            radius / 4,
            new Color( EESharedConstants.CONTROL_PANEL_BACKGROUND_COLOR )
          );
          break;

        case CoinTermTypeID.X_TIMES_Y:
          iconNode = createRoundCoinIcon(
            radius,
            new Color( 204, 180, 45 ),
            radius * 0.7,
            new Color( 238, 238, 240 )
          );
          break;

        case CoinTermTypeID.X_SQUARED:
          iconNode = createRoundCoinIcon(
            radius,
            new Color( 217, 115, 93 ),
            radius * 0.8,
            new Color( 170, 84, 65 )
          );
          break;

        case CoinTermTypeID.Y_SQUARED:
          iconNode = createRoundCoinIcon(
            radius,
            new Color( 221, 219, 219 ),
            radius * 0.7,
            new Color( 206, 180, 44 )
          );
          break;

        case CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED:
          iconNode = createHexagonalCoinIcon(
            radius,
            new Color( 206, 180, 44 ),
            radius * 0.7,
            new Color( 225, 191, 46 )
          );
          break;

        case CoinTermTypeID.CONSTANT:
          // this should never be depicted as a coin, so add something garish so that we'll notice if it is
          iconNode = new Circle( radius, { fill: 'pink', stroke: 'red' } );
          break;

        default:
          assert && assert( false, 'unknown coin term type' );
      }

      iconNode.mutate( options );
      return iconNode;
    }
  };

  expressionExchange.register( 'CoinNodeFactory', CoinNodeFactory );

  return CoinNodeFactory;

} );