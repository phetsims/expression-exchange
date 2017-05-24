// Copyright 2016, University of Colorado Boulder

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
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var coinXFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x.png' );
  var coinXBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-back.png' );
  var coinXSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared.png' );
  var coinXSquaredBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared-back.png' );
  var coinXSquaredYSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared-y-squared.png' );
  var coinXSquaredYSquaredBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared-y-squared-back.png' );
  var coinXYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-xy.png' );
  var coinXYBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-xy-back.png' );
  var coinYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y.png' );
  var coinYBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y-back.png' );
  var coinYSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y-squared.png' );
  var coinYSquaredBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y-squared-back.png' );
  var coinZFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-z.png' );
  var coinZBackImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-z-back.png' );

  // convenience function for drawing round coin shapes
  function createRoundCoinIcon( outerCircleRadius, outerCircleColor, innerCircleRadius, innerCircleColor ) {

    var outerCircle = new Circle( outerCircleRadius, {
      fill: outerCircleColor,
      //REVIEW: at least 4 places with the same lineWidth and 0.25-darker color. Possibility for refactoring?
      stroke: outerCircleColor.colorUtilsDarker( 0.25 ),
      lineWidth: 0.5
    } );

    //REVIEW: Type documentation may help make clear that this is optional?
    if ( innerCircleRadius ) {
      outerCircle.addChild( new Circle( innerCircleRadius, {
        fill: innerCircleColor,
        stroke: outerCircleColor.colorUtilsDarker( 0.25 ),
        lineWidth: 0.5
      } ) );
    }

    return outerCircle;
  }

  // convenience function for drawing hexagonal coin shapes
  function createHexagonalCoinIcon( outerMaxRadius, outerCircleColor, innerCircleRadius, innerCircleColor ) {

    var outerShape = new Shape();
    var vector = new Vector2( 0, outerMaxRadius );
    vector.rotate( -Math.PI * 0.055 );
    //REVIEW: outerShape.moveToPoint( Vector2.createPolar( outerMaxRadius, Math.PI * 0.445 ) )
    // or if minimizing GC, outerShape.moveToPoint( vector );
    outerShape.moveTo( vector.x, vector.y );

    //REVIEW: only 5 times is necessary?
    _.times( 6, function() {
      //REVIEW: for(i): outerShape.moveToPoint( Vector2.createPolar( outerMaxRadius, Math.PI * 0.445 + i * Math.PI / 3 ) )
      // or if minimizing GC, remove the closure (bad for GC) and outerShape.lineToPoint( vector )
      vector.rotate( Math.PI / 3 );
      outerShape.lineTo( vector.x, vector.y );
    } );
    outerShape.close();

    var hexagonalCoinNode = new Path( outerShape, {
      fill: outerCircleColor,
      stroke: outerCircleColor.colorUtilsDarker( 0.25 ),
      lineWidth: 0.5
    } );

    if ( innerCircleRadius ) {
      hexagonalCoinNode.addChild( new Circle( innerCircleRadius, {
        fill: innerCircleColor,
        stroke: outerCircleColor.colorUtilsDarker( 0.25 ),
        lineWidth: 0.5
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
     * @param {string} backOrFront - param that controls whether it is the back or front of the coin, 'front' or 'back'
     * @returns {Node}
     * @public
     */
    createImageNode: function( coinTermTypeID, radius, backOrFront ) {
      //REVIEW: backOrFront with enumeration constants should either be refactored to a 'Side' enumeration, or a boolean
      // like isFront or isBack.

      var coinNode = null;

      /*
      REVIEW: recommend a top-level map for most of the switch statement, e.g.:
      var imageMap = {};
      imageMap[ Side.FRONT ][ CoinTermTypeID.X ] = coinXFrontImage;
      imageMap[ Side.BACK ][ CoinTermTypeID.X ] = coinXBackImage;

      This has the advantage of also returning shared nodes, so that they are reused instead of being recreated for each
      instance of a coin.
       */
      switch( coinTermTypeID ) {

        case CoinTermTypeID.X:
          coinNode = new Image( backOrFront === 'front' ? coinXFrontImage : coinXBackImage );
          break;

        case CoinTermTypeID.Y:
          coinNode = new Image( backOrFront === 'front' ? coinYFrontImage : coinYBackImage );
          break;

        case CoinTermTypeID.Z:
          coinNode = new Image( backOrFront === 'front' ? coinZFrontImage : coinZBackImage );
          break;

        case CoinTermTypeID.X_TIMES_Y:
          coinNode = new Image( backOrFront === 'front' ? coinXYFrontImage : coinXYBackImage );
          break;

        case CoinTermTypeID.X_SQUARED:
          coinNode = new Image( backOrFront === 'front' ? coinXSquaredFrontImage : coinXSquaredBackImage );
          break;

        case CoinTermTypeID.Y_SQUARED:
          coinNode = new Image( backOrFront === 'front' ? coinYSquaredFrontImage : coinYSquaredBackImage );
          break;

        case CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED:
          coinNode = new Image( backOrFront === 'front' ? coinXSquaredYSquaredFrontImage : coinXSquaredYSquaredBackImage );
          break;

        case CoinTermTypeID.CONSTANT:
          // this should never be depicted as a coin, so add something garish so that we'll notice if it is
          // REVIEW: Why does this exist instead of an assertion failure? Sounds like it should never be viewed?
          coinNode = new Circle( radius, {
            fill: 'pink',
            stroke: 'red',

            // make the top left 0,0 so that it's the same as the images
            left: 0,
            top: 0
          } );
          break;

        default:
          assert && assert( false, 'unknown coin term type' );
      }

      // scale so that the coin image has the specified radius
      coinNode.scale( radius * 2 / coinNode.width );

      return coinNode;
    },

    /**
     * function to create the node that represents the icon for a coin
     * @returns {Node}
     * @param {CoinTermTypeID} coinTermTypeID
     * @param {number} radius
     * @param {Object} options REVIEW: never used? Can be removed?
     */
    createIconNode: function( coinTermTypeID, radius, options ) {

      var iconNode = null;

      //REVIEW: See recommended pattern above instead of a switch? And sharing instances may be helpful for memory.
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
            new Color( 206, 180, 44 ) //REVIEW: duplicated color. Should that be refactored out?
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

      options && iconNode.mutate( options );
      return iconNode;
    }
  };

  expressionExchange.register( 'CoinNodeFactory', CoinNodeFactory );

  return CoinNodeFactory;

} );