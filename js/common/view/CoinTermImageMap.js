// Copyright 2016, University of Colorado Boulder

/**
 * static object that maps coin term type IDs to the various images used to represent them
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );

  // images
  var coinXFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x.png' );
  var coinXIconImage = require( 'image!EXPRESSION_EXCHANGE/coin-x-small.png' );
  var coinXSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared.png' );
  var coinXSquaredIconImage = require( 'image!EXPRESSION_EXCHANGE/coin-x-squared-small.png' );
  var coinXSquaredYSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared-y-squared.png' );
  var coinXSquaredYSquaredIconImage = require( 'image!EXPRESSION_EXCHANGE/coin-x-squared-y-squared-small.png' );
  var coinXYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-xy.png' );
  var coinXYIconImage = require( 'image!EXPRESSION_EXCHANGE/coin-xy-small.png' );
  var coinYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y.png' );
  var coinYIconImage = require( 'image!EXPRESSION_EXCHANGE/coin-y-small.png' );
  var coinYSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y-squared.png' );
  var coinYSquaredIconImage = require( 'image!EXPRESSION_EXCHANGE/coin-y-squared-small.png' );
  var coinZFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-z.png' );
  var coinZIconImage = require( 'image!EXPRESSION_EXCHANGE/coin-z-small.png' );

  // constant table that matches coin term type IDs to the images used to represent them
  var CoinTermImageMap = {};
  CoinTermImageMap[ CoinTermTypeID.X ] = {
    frontFullSize: coinXFrontImage,
    icon: coinXIconImage
  };
  CoinTermImageMap[ CoinTermTypeID.Y ] = {
    frontFullSize: coinYFrontImage,
    icon: coinYIconImage
  };
  CoinTermImageMap[ CoinTermTypeID.Z ] = {
    frontFullSize: coinZFrontImage,
    icon: coinZIconImage
  };
  CoinTermImageMap[ CoinTermTypeID.X_TIMES_Y ] = {
    frontFullSize: coinXYFrontImage,
    icon: coinXYIconImage
  };
  CoinTermImageMap[ CoinTermTypeID.X_SQUARED ] = {
    frontFullSize: coinXSquaredFrontImage,
    icon: coinXSquaredIconImage
  };
  CoinTermImageMap[ CoinTermTypeID.Y_SQUARED ] = {
    frontFullSize: coinYSquaredFrontImage,
    icon: coinYSquaredIconImage
  };
  CoinTermImageMap[ CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED ] = {
    frontFullSize: coinXSquaredYSquaredFrontImage,
    icon: coinXSquaredYSquaredIconImage
  };

  expressionExchange.register( 'CoinTermImageMap', CoinTermImageMap );

  return CoinTermImageMap;

} );