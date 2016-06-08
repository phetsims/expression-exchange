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
  var coinXSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared.png' );
  var coinXSquaredYSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared-y-squared.png' );
  var coinXYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-xy.png' );
  var coinYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y.png' );
  var coinYSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y-squared.png' );
  var coinZFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-z.png' );

  // convenience function for drawing round coin shapes
  function createRoundCoinIcon( outerCircleRadius, outerCircleColor, innerCircleRadius, innerCircleColor ) {

    var outerCircle = new Circle( outerCircleRadius, {
      fill: outerCircleColor,
      stroke: outerCircleColor.colorUtilsDarker( 0.25 ),
      lineWidth: 0.5
    } );

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
    outerShape.moveTo( vector.x, vector.y );

    _.times( 6, function() {
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
   * static factor object used to create nodes that represent coins
   * @public
   */
  var CoinNodeFactory = {

    /**
     * function to create a node that can be used to represents the front of the provided coin type
     * @param {CoinTermTypeID) coinTermTypeID
     * @param {number) radius
     * @returns {Node}
     */
    createFrontImageNode: function( coinTermTypeID, radius ) {

      var coinNode = null;

      switch( coinTermTypeID ) {

        case CoinTermTypeID.X:
          coinNode = new Image( coinXFrontImage );
          break;

        case CoinTermTypeID.Y:
          coinNode = new Image( coinYFrontImage );
          break;

        case CoinTermTypeID.Z:
          coinNode = new Image( coinZFrontImage );
          break;

        case CoinTermTypeID.X_TIMES_Y:
          coinNode = new Image( coinXYFrontImage );
          break;

        case CoinTermTypeID.X_SQUARED:
          coinNode = new Image( coinXSquaredFrontImage );
          break;

        case CoinTermTypeID.Y_SQUARED:
          coinNode = new Image( coinYSquaredFrontImage );
          break;

        case CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED:
          coinNode = new Image( coinXSquaredYSquaredFrontImage );
          break;

        default:
          assert && assert( false, 'unknown coin term type' )
      }

      // scale so that the coin image has the specified radius
      coinNode.scale( radius * 2 / coinNode.width );

      return coinNode;
    },

    /**
     * function to create the node that represents the icon for a coin
     * @param {CoinTermTypeID) coinTermTypeID
     * @param {number) radius
     * @returns {Node}
     */
    createIconNode: function( coinTermTypeID, radius ) {

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

        default:
          assert && assert( false, 'unknown coin term type' );
      }
      return iconNode;
    }
  };
  expressionExchange.register( 'CoinNodeFactory', CoinNodeFactory );

  return CoinNodeFactory;

} );