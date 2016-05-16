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
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );

  /**
   * {number} xValueProperty
   * {number} yValueProperty
   * {number} zValueProperty
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
      self.xValueStringProperty.value = xValue.toString();
    } );
    this.yValueProperty.link( function( yValue ){
      self.yValueStringProperty.value = yValue.toString();
    } );
    this.zValueProperty.link( function( zValue ){
      self.zValueStringProperty.value = zValue.toString();
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

    /**
     * create a coin term of the specified type
     * @param {CoinTermTypeID} typeID
     * @param {Object} options
     * @returns {CoinTerm}
     * @public
     */
    createCoinTerm: function( typeID, options ){

      var valueProperty;
      var coinDiameter;
      var termText;
      var termValueTextProperty;

      // set up the various values and properties based on the specified type ID
      switch( typeID ){

        case CoinTermTypeID.X:
          valueProperty = this.xValueProperty;
          coinDiameter = 45;
          termText = EESharedConstants.X_VARIABLE_CHAR;
          termValueTextProperty = this.xValueStringProperty;
          break;

        case CoinTermTypeID.Y:
          valueProperty = this.yValueProperty;
          coinDiameter = 45;
          termText = EESharedConstants.Y_VARIABLE_CHAR;
          termValueTextProperty = this.yValueStringProperty;
          break;

        case CoinTermTypeID.Z:
          valueProperty = this.zValueProperty;
          coinDiameter = 50;
          termText = EESharedConstants.Z_VARIABLE_CHAR;
          termValueTextProperty = this.zValueStringProperty;
          break;

        case CoinTermTypeID.X_TIMES_Y:
          valueProperty = this.xTimesYValueProperty;
          coinDiameter = 50;
          termText = EESharedConstants.X_VARIABLE_CHAR + EESharedConstants.Y_VARIABLE_CHAR;
          termValueTextProperty = this.xTimesYValueStringProperty;
          break;

        case CoinTermTypeID.X_SQUARED:
          valueProperty = this.xSquaredValueProperty;
          coinDiameter = 55;
          termText = EESharedConstants.X_VARIABLE_CHAR + '<sup>2</sup>',
          termValueTextProperty = this.xSquaredValueStringProperty;
          break;

        case CoinTermTypeID.Y_SQUARED:
          valueProperty = this.ySquaredValueProperty;
          coinDiameter = 55;
          termText = EESharedConstants.Y_VARIABLE_CHAR + '<sup>2</sup>',
          termValueTextProperty = this.ySquaredValueStringProperty;
          break;

        case CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED:
          valueProperty = this.xSquaredTimesYSquaredValueProperty;
          coinDiameter = 55;
          termText = EESharedConstants.X_VARIABLE_CHAR + '<sup>2</sup>' + EESharedConstants.Y_VARIABLE_CHAR + '<sup>2</sup>',
          termValueTextProperty = this.xSquaredTimesYSquaredValueStringProperty;
          break;

        default:
          assert && assert( false, 'Unrecognized type ID for coin term, = ' + typeID );
      }

      return new CoinTerm(
        valueProperty,
        coinDiameter,
        termText,
        termValueTextProperty,
        typeID,
        options
      );
    }
  } );
} );