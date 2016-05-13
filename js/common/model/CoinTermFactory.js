// Copyright 2016, University of Colorado Boulder

/**
 * factory class for generating coin term instance
 *
 * Coin terms have a fairly complex constructor, and this type makes it easier to create them.  This factory must be
 * constructed with all of the properties and other values used by coin terms.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTerm = require( 'EXPRESSION_EXCHANGE/common/model/CoinTerm' );
  var CoinTermType = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermType' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var coinXFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x.png' );
  var coinXSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared.png' );
  var coinXSquareYSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-x-squared-y-squared.png' );
  var coinXYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-xy.png' );
  var coinYFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y.png' );
  var coinYSquaredFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-y-squared.png' );
  var coinZFrontImage = require( 'mipmap!EXPRESSION_EXCHANGE/coin-z.png' );

  // constants
  var DEFAULT_OPTIONS = {
    initialCount: 1,
    initialPosition: Vector2.ZERO
  };

  /**
   * TODO: document parameters thoroughly once finalized.  Make sure to note requirement for subSupText format of some of the string values.
   * @constructor
   */
  function CoinTermFactory( xValueProperty, yValueProperty, zValueProperty ) {

    var self = this;

    // @private - values of the variables
    this.xValueProperty = xValueProperty;
    this.yValueProperty = yValueProperty;
    this.zValueProperty = zValueProperty;

    // @private - string representations of the variables
    this.xValueStringProperty = new Property();
    this.yValueStringProperty = new Property();
    this.zValueStringProperty = new Property();

    // update the strings as the variable values change
    this.xValueProperty.link( function( xValue ){
      self.xValueStringProperty = xValue.toString();
    } );
    this.yValueProperty.link( function( yValue ){
      self.yValueStringProperty = yValue.toString();
    } );
    this.zValueProperty.link( function( zValue ){
      self.zValueStringProperty = zValue.toString();
    } );

    // @private, value property for x times y
    this.xTimesYValueProperty = new DerivedProperty(
      [ this.xValueProperty, this.yValueProperty ],
      function( xValue, yValue ){
        return xValue * yValue;
      }
    );

    // @private, the string depicted for x times y when 'variable values' is enabled
    this.xTimesYValueStringProperty = new DerivedProperty(
      [ this.xValueProperty, this.yValueProperty ],
      function( xValue, yValue ){
        return xValue.toString() + '\u00B7' + yValue.toString();
      }
    );

    // @private, value property for x squared
    this.xSquaredValueProperty = new DerivedProperty(
      [ this.xValueProperty ],
      function( xValue ){
        return xValue * xValue;
      }
    );

    // @private, the string depicted for x squared when 'variable values' is enabled
    this.xSquaredValueStringProperty = new DerivedProperty(
      [ this.xValueProperty ],
      function( xValue ){
        return xValue.toString() + '<sup>2</sup>';
      }
    );

    // @private, value property for y squared
    this.ySquaredValueProperty = new DerivedProperty(
      [ this.yValueProperty ],
      function( yValue ){
        return yValue * yValue;
      }
    );

    // @private, the string depicted for y squared when 'variable values' is enabled
    this.ySquaredValueStringProperty = new DerivedProperty(
      [ this.yValueProperty ],
      function( yValue ){
        return yValue.toString() + '<sup>2</sup>';
      }
    );

    // @private, value property for x squared times y squared
    this.xSquaredTimesYSquaredValueProperty = new DerivedProperty(
      [ this.xValueProperty, this.yValueProperty ],
      function( xValue, yValue ){
        return xValue * xValue * yValue * yValue;
      }
    );

    // @private, the string depicted for y squared when 'variable values' is enabled
    this.xSquaredTimesYSquaredValueStringProperty = new DerivedProperty(
      [ this.xValueProperty, this.yValueProperty ],
      function( xValue, yValue ){
        return xValue.toString() + '<sup>2</sup>' + yValue.toString() + '<sup>2</sup>';
      }
    );


  }

  expressionExchange.register( 'CoinTermFactory', CoinTermFactory );

  return inherit( Object, CoinTermFactory, {

    X: function( options ){
      options = _.extend( {}, DEFAULT_OPTIONS, options );
      return new CoinTerm(
        this.xValueProperty,
        45,
        coinXFrontImage,
        EESharedConstants.X_VARIABLE_CHAR,
        this.xValueStringProperty,
        CoinTermType.X,
        options
      );
    },

    Y: function( options ){
      options = _.extend( {}, DEFAULT_OPTIONS, options );
      return new CoinTerm(
        this.yValueProperty,
        45,
        coinYFrontImage,
        EESharedConstants.Y_VARIABLE_CHAR,
        this.yValueStringProperty,
        CoinTermType.Y,
        options
      );
    },

    Z: function( options ){
      options = _.extend( {}, DEFAULT_OPTIONS, options );
      return new CoinTerm(
        this.zValueProperty,
        50,
        coinZFrontImage,
        EESharedConstants.Z_VARIABLE_CHAR,
        this.zValueStringProperty,
        CoinTermType.Z,
        options
      );
    },

    XTimesY: function( options ){
      options = _.extend( {}, DEFAULT_OPTIONS, options );
      return new CoinTerm(
        this.xTimesYValueProperty,
        50,
        coinXYFrontImage,
        EESharedConstants.X_VARIABLE_CHAR + EESharedConstants.Y_VARIABLE_CHAR,
        this.xTimesYValueStringProperty,
        CoinTermType.XTimesY,
        options
      );
    },

    XSquared: function( options ){
      options = _.extend( {}, DEFAULT_OPTIONS, options );
      return new CoinTerm(
        this.xSquaredValueProperty,
        55,
        coinXSquaredFrontImage,
        EESharedConstants.X_VARIABLE_CHAR + '<sup>2</sup>',
        this.xSquaredValueStringProperty,
        CoinTermType.XSquared,
        options
      );
    },

    YSquared: function( options ){
      options = _.extend( {}, DEFAULT_OPTIONS, options );
      return new CoinTerm(
        this.ySquaredValueProperty,
        55,
        coinYSquaredFrontImage,
        EESharedConstants.Y_VARIABLE_CHAR + '<sup>2</sup>',
        this.ySquaredValueStringProperty,
        CoinTermType.YSquared,
        options
      );
    },

    XSquaredTimesYSquared: function( options ){
      options = _.extend( {}, DEFAULT_OPTIONS, options );
      return new CoinTerm(
        this.xSquaredTimesYSquaredValueProperty,
        55,
        coinXSquareYSquaredFrontImage,
        EESharedConstants.X_VARIABLE_CHAR + '<sup>2</sup>' + EESharedConstants.Y_VARIABLE_CHAR + '<sup>2</sup>',
        this.xSquaredTimesYSquaredValueStringProperty,
        CoinTermType.XSquaredTimesYSquared,
        options
      );
    }
  } );
} );