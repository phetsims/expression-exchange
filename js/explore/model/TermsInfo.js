// Copyright 2016, University of Colorado Boulder

/**
 * collection of data corresponding to each of the terms (e.g. xy, z, y squared) that is used in the explore screen
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // constants
  var X_DEFAULT_VALUE = 2;
  var Y_DEFAULT_VALUE = 5;
  var Z_DEFAULT_VALUE = 10;

  // images
  var coinXFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x.png' );
  var coinXSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared.png' );
  var coinXSquareYSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared-y-squared.png' );
  var coinXYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-xy.png' );
  var coinYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y.png' );
  var coinYSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y-squared.png' );
  var coinZFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-z.png' );

  // TODO: I may want to pull this out into a separate class
  /**
   * internal, data-only class that represents the collection of info for a term
   * @param {number} value
   * @param {String} subSupText
   * @param {number} coinDiameter
   * @param {image} coinFrontImage
   * @constructor
   * @private
   */
  function TermInfo( value, subSupText, coinDiameter, coinFrontImage ){
    this.value = value;
    this.subSupText = subSupText;
    this.coinDiameter = coinDiameter;
    this.coinFrontImage = coinFrontImage;
  }

  // return a static object that contains the information about the various terms used in the 'Explore' screen
  return Object.freeze( {
    X: new TermInfo( X_DEFAULT_VALUE, 'x', 45, coinXFrontImage ),
    Y: new TermInfo( Y_DEFAULT_VALUE, 'y', 45, coinYFrontImage ),
    Z: new TermInfo( Z_DEFAULT_VALUE, 'z', 60, coinZFrontImage ),
    X_SQUARED: new TermInfo( Math.pow( X_DEFAULT_VALUE, 2 ), 'x<sup>2</sup>', 75, coinXSquaredFrontImage ),
    Y_SQUARED: new TermInfo( Math.pow( Y_DEFAULT_VALUE, 2 ), 'y<sup>2</sup>', 75, coinYSquaredFrontImage ),
    XY: new TermInfo( X_DEFAULT_VALUE * Y_DEFAULT_VALUE, 'xy', 60, coinXYFrontImage ),
    X_SQUARED_Y_SQUARED: new TermInfo(
      Math.pow( X_DEFAULT_VALUE, 2 ) * Math.pow( Y_DEFAULT_VALUE, 2 ),
      'x<sup>2</sup>y<sup>2</sup>',
      80,
      coinXSquareYSquaredFrontImage
    )
  } );

} );