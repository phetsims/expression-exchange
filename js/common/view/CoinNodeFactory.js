// Copyright 2016-2020, University of Colorado Boulder

/**
 * static object that provides functions for creating nodes that represent the coins used in the simulation
 * @author John Blanco
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import { Circle } from '../../../../scenery/js/imports.js';
import { Image } from '../../../../scenery/js/imports.js';
import { Path } from '../../../../scenery/js/imports.js';
import { Color } from '../../../../scenery/js/imports.js';
import coinXBackImage from '../../../images/coin-x-back_png.js';
import coinXSquaredBackImage from '../../../images/coin-x-squared-back_png.js';
import coinXSquaredYSquaredBackImage from '../../../images/coin-x-squared-y-squared-back_png.js';
import coinXSquaredYSquaredFrontImage from '../../../images/coin-x-squared-y-squared_png.js';
import coinXSquaredFrontImage from '../../../images/coin-x-squared_png.js';
import coinXFrontImage from '../../../images/coin-x_png.js';
import coinXYBackImage from '../../../images/coin-xy-back_png.js';
import coinXYFrontImage from '../../../images/coin-xy_png.js';
import coinYBackImage from '../../../images/coin-y-back_png.js';
import coinYSquaredBackImage from '../../../images/coin-y-squared-back_png.js';
import coinYSquaredFrontImage from '../../../images/coin-y-squared_png.js';
import coinYFrontImage from '../../../images/coin-y_png.js';
import coinZBackImage from '../../../images/coin-z-back_png.js';
import coinZFrontImage from '../../../images/coin-z_png.js';
import expressionExchange from '../../expressionExchange.js';
import EESharedConstants from '../EESharedConstants.js';
import CoinTermTypeID from '../enum/CoinTermTypeID.js';

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

  _.times( 6, () => {
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
  createImageNode( coinTermTypeID, radius, isFront ) {

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
  createIconNode( coinTermTypeID, radius, options ) {
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

export default CoinNodeFactory;