// Copyright 2016, University of Colorado Boulder

/**
 * factory class for generating coin term instances
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
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );

  // constants
  var CONSTANT_ONE_VALUE_PROPERTY = new Property( 1 );
  var CONSTANT_ONE_TEXT_VALUE_PROPERTY = new Property( '1' );

  // map of coin term type IDs to the text that is shown in 'variable' mode
  var TYPE_TO_TEXT_MAP = new Map();
  TYPE_TO_TEXT_MAP.set( CoinTermTypeID.X, 'x' );
  TYPE_TO_TEXT_MAP.set( CoinTermTypeID.Y, 'y' );
  TYPE_TO_TEXT_MAP.set( CoinTermTypeID.Z, 'z' );
  TYPE_TO_TEXT_MAP.set( CoinTermTypeID.Z, 'z' );


  /**
   * @param {number} xValueProperty
   * @param {number} yValueProperty
   * @param {number} zValueProperty
   * @constructor
   */
  function CoinTermFactory( xValueProperty, yValueProperty, zValueProperty ) {

    // @private - values of the variables
    this.xValueProperty = xValueProperty;
    this.yValueProperty = yValueProperty;
    this.zValueProperty = zValueProperty;

    // @private {Property.<string>} - string representations of the variables
    this.xValueStringProperty = new DerivedProperty( [ xValueProperty ], function( value ) {
      return '(' + value.toString() + ')';
    } );
    this.yValueStringProperty = new DerivedProperty( [ yValueProperty ], function( value ) {
      return '(' + value.toString() + ')';
    } );
    this.zValueStringProperty = new DerivedProperty( [ zValueProperty ], function( value ) {
      return '(' + value.toString() + ')';
    } );

    // @private, value property for x times y
    this.xTimesYValueProperty = new DerivedProperty(
      [ this.xValueProperty, this.yValueProperty ],
      function( xValue, yValue ) {
        return xValue * yValue;
      }
    );

    // @private, the string depicted for x times y when 'variable values' is enabled
    this.xTimesYValueStringProperty = new DerivedProperty(
      [ this.xValueProperty, this.yValueProperty ],
      function( xValue, yValue ) {
        return '(' + xValue.toString() + ')(' + yValue.toString() + ')';
      }
    );

    // @private, value property for x squared
    this.xSquaredValueProperty = new DerivedProperty(
      [ this.xValueProperty ],
      function( xValue ) {
        return xValue * xValue;
      }
    );

    // @private, the string depicted for x squared when 'variable values' is enabled
    this.xSquaredValueStringProperty = new DerivedProperty(
      [ this.xValueProperty ],
      function( xValue ) {
        return '(' + xValue.toString() + ')' + '<sup>2</sup>';
      }
    );

    // @private, value property for y squared
    this.ySquaredValueProperty = new DerivedProperty(
      [ this.yValueProperty ],
      function( yValue ) {
        return yValue * yValue;
      }
    );

    // @private, the string depicted for y squared when 'variable values' is enabled
    this.ySquaredValueStringProperty = new DerivedProperty(
      [ this.yValueProperty ],
      function( yValue ) {
        return '(' + yValue.toString() + ')' + '<sup>2</sup>';
      }
    );

    // @private, value property for x squared times y squared
    this.xSquaredTimesYSquaredValueProperty = new DerivedProperty(
      [ this.xValueProperty, this.yValueProperty ],
      function( xValue, yValue ) {
        return xValue * xValue * yValue * yValue;
      }
    );

    // @private, the string depicted for y squared when 'variable values' is enabled
    this.xSquaredTimesYSquaredValueStringProperty = new DerivedProperty(
      [ this.xValueProperty, this.yValueProperty ],
      function( xValue, yValue ) {
        return '(' + xValue.toString() + ')' + '<sup>2</sup>' + '(' + yValue.toString() + ')' + '<sup>2</sup>';
      }
    );
  }

  expressionExchange.register( 'CoinTermFactory', CoinTermFactory );

  return inherit( Object, CoinTermFactory, {

    /**
     * create a coin term of the specified type
     * @param {CoinTermTypeID} typeID
     * @param {Object} [options] - see CoinTerm constructor
     * @returns {CoinTerm}
     * @public
     */
    createCoinTerm: function( typeID, options ) {

      var valueProperty;
      var coinRadius;
      var termText;
      var termValueTextProperty;

      // set up the various values and properties based on the specified type ID
      switch( typeID ) {

        case CoinTermTypeID.X:
          valueProperty = this.xValueProperty;
          coinRadius = 22;
          termText = 'x';
          termValueTextProperty = this.xValueStringProperty;
          break;

        case CoinTermTypeID.Y:
          valueProperty = this.yValueProperty;
          coinRadius = 22;
          termText = 'y';
          termValueTextProperty = this.yValueStringProperty;
          break;

        case CoinTermTypeID.Z:
          valueProperty = this.zValueProperty;
          coinRadius = 25;
          termText = 'z';
          termValueTextProperty = this.zValueStringProperty;
          break;

        case CoinTermTypeID.X_TIMES_Y:
          valueProperty = this.xTimesYValueProperty;
          coinRadius = 25;
          termText = 'xy';
          termValueTextProperty = this.xTimesYValueStringProperty;
          break;

        case CoinTermTypeID.X_SQUARED:
          valueProperty = this.xSquaredValueProperty;
          coinRadius = 27;
          termText = 'x<sup>2</sup>';
          termValueTextProperty = this.xSquaredValueStringProperty;
          break;

        case CoinTermTypeID.Y_SQUARED:
          valueProperty = this.ySquaredValueProperty;
          coinRadius = 27;
          termText = 'y<sup>2</sup>';
          termValueTextProperty = this.ySquaredValueStringProperty;
          break;

        case CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED:
          valueProperty = this.xSquaredTimesYSquaredValueProperty;
          coinRadius = 28;
          termText = 'x<sup>2</sup>y<sup>2</sup>';
          termValueTextProperty = this.xSquaredTimesYSquaredValueStringProperty;
          break;

        case CoinTermTypeID.CONSTANT:
          valueProperty = CONSTANT_ONE_VALUE_PROPERTY;
          coinRadius = 20; // fairly arbitrary, since this should never end up being depicted as a coin
          termText = '1';
          termValueTextProperty = CONSTANT_ONE_TEXT_VALUE_PROPERTY;
          break;

        default:
          assert && assert( false, 'Unrecognized type ID for coin term, = ' + typeID );
      }

      return new CoinTerm(
        valueProperty,
        coinRadius,
        termText,
        termValueTextProperty,
        typeID,
        options
      );
    }
  } );
} );