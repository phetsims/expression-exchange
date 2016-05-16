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
  var coinXSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared.png' );
  var coinXSquaredYSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared-y-squared.png' );
  var coinXYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-xy.png' );
  var coinYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y.png' );
  var coinYSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y-squared.png' );
  var coinZFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-z.png' );

  // constant table that matches coin term type IDs to the images used to represent them
  var CoinTermImageMap = {};
  CoinTermImageMap[ CoinTermTypeID.X ] = {
    frontFullSize: coinXFrontImage
  };
  CoinTermImageMap[ CoinTermTypeID.Y ] = {
    frontFullSize: coinYFrontImage
  };
  CoinTermImageMap[ CoinTermTypeID.Z ] = {
    frontFullSize: coinZFrontImage
  };
  CoinTermImageMap[ CoinTermTypeID.X_TIMES_Y ] = {
    frontFullSize: coinXYFrontImage
  };
  CoinTermImageMap[ CoinTermTypeID.X_SQUARED ] = {
    frontFullSize: coinXSquaredFrontImage
  };
  CoinTermImageMap[ CoinTermTypeID.Y_SQUARED ] = {
    frontFullSize: coinYSquaredFrontImage
  };
  CoinTermImageMap[ CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED ] = {
    frontFullSize: coinXSquaredYSquaredFrontImage
  };

  expressionExchange.register( 'CoinTermImageMap', CoinTermImageMap );

  return CoinTermImageMap;

} );