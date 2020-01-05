// Copyright 2016-2020, University of Colorado Boulder

/**
 * static object that provides functions for creating nodes that represent the coins used in the simulation
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const Circle = require( 'SCENERY/nodes/Circle' );
  const CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  const Color = require( 'SCENERY/util/Color' );
  const EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const Image = require( 'SCENERY/nodes/Image' );
  const Path = require( 'SCENERY/nodes/Path' );
  const platform = require( 'PHET_CORE/platform' );
  const Shape = require( 'KITE/Shape' );
  const Vector2 = require( 'DOT/Vector2' );

  // images - use mipmaps normally, but use regular images when memory needs to be conserved
  const useMipmaps = !platform.mobileSafari;

  let coinXBackImage;
  let coinXFrontImage;
  let coinXSquaredBackImage;
  let coinXSquaredFrontImage;
  let coinXSquaredYSquaredBackImage;
  let coinXSquaredYSquaredFrontImage;
  let coinXYBackImage;
  let coinXYFrontImage;
  let coinYBackImage;
  let coinYFrontImage;
  let coinYSquaredBackImage;
  let coinYSquaredFrontImage;
  let coinZBackImage;
  let coinZFrontImage;

  if ( useMipmaps ) {
    coinXBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-back.png' );
    coinXFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x.png' );
    coinXSquaredBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared-back.png' );
    coinXSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared.png' );
    coinXSquaredYSquaredBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared-y-squared-back.png' );
    coinXSquaredYSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared-y-squared.png' );
    coinXYBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-xy-back.png' );
    coinXYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-xy.png' );
    coinYBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y-back.png' );
    coinYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y.png' );
    coinYSquaredBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y-squared-back.png' );
    coinYSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y-squared.png' );
    coinZBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-z-back.png' );
    coinZFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-z.png' );
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
  const COIN_EDGE_DARKENING_AMOUNT = 0.25;
  const COIN_EDGE_STROKE = 0.5;

  // maps for coin images (front and back)
  const coinFrontImages = {};
  coinFrontImages[ CoinTermTypeID.X ] = coinXFrontImage;
  coinFrontImages[ CoinTermTypeID.Y ] = coinYFrontImage;
  coinFrontImages[ CoinTermTypeID.Z ] = coinZFrontImage;
  coinFrontImages[ CoinTermTypeID.X_TIMES_Y ] = coinXYFrontImage;
  coinFrontImages[ CoinTermTypeID.X_SQUARED ] = coinXSquaredFrontImage;
  coinFrontImages[ CoinTermTypeID.Y_SQUARED ] = coinYSquaredFrontImage;
  coinFrontImages[ CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED ] = coinXSquaredYSquaredFrontImage;
  const coinBackImages = {};
  coinBackImages[ CoinTermTypeID.X ] = coinXBackImage;
  coinBackImages[ CoinTermTypeID.Y ] = coinYBackImage;
  coinBackImages[ CoinTermTypeID.Z ] = coinZBackImage;
  coinBackImages[ CoinTermTypeID.X_TIMES_Y ] = coinXYBackImage;
  coinBackImages[ CoinTermTypeID.X_SQUARED ] = coinXSquaredBackImage;
  coinBackImages[ CoinTermTypeID.Y_SQUARED ] = coinYSquaredBackImage;
  coinBackImages[ CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED ] = coinXSquaredYSquaredBackImage;

  // convenience function for drawing round coin shapes
  function createRoundCoinIcon( outerCircleRadius, outerCircleColor, innerCircleRadius, innerCircleColor ) {

    const outerCircle = new Circle( outerCircleRadius, {
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

    const outerShape = new Shape();
    const vector = Vector2.createPolar( outerMaxRadius, Math.PI * -0.25 ); // angle empirically determined to match coin image
    outerShape.moveToPoint( vector );

    _.times( 6, function() {
      vector.rotate( Math.PI / 3 );
      outerShape.lineTo( vector.x, vector.y );
    } );
    outerShape.close();

    const hexagonalCoinNode = new Path( outerShape, {
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
  const CoinNodeFactory = {

    /**
     * function to create a node that can be used to represents the front of the provided coin type
     * @param {CoinTermTypeID} coinTermTypeID
     * @param {number} radius
     * @param {boolean} isFront - controls whether the image is the front of back of the coin
     * @returns {Node}
     * @public
     */
    createImageNode: function( coinTermTypeID, radius, isFront ) {

      const imageMap = isFront ? coinFrontImages : coinBackImages;
      const imageNode = new Image( imageMap[ coinTermTypeID ] );

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

      let iconNode = null;

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