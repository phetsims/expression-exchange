// Copyright 2016-2022, University of Colorado Boulder

/**
 * factory class for generating coin term instances
 *
 * Coin terms have a fairly complex constructor, and this type makes it easier to create them.  This factory must be
 * constructed with all of the properties and other values used by coin terms.
 *
 * @author John Blanco
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import expressionExchange from '../../expressionExchange.js';
import CoinTermTypeID from '../enum/CoinTermTypeID.js';
import CoinTerm from './CoinTerm.js';

// constants
const CONSTANT_ONE_VALUE_PROPERTY = new Property( 1 );
const CONSTANT_ONE_TEXT_VALUE_PROPERTY = new Property( '1' );

class CoinTermFactory {

  /**
   * @param {number} xValueProperty
   * @param {number} yValueProperty
   * @param {number} zValueProperty
   */
  constructor( xValueProperty, yValueProperty, zValueProperty ) {

    // @private - values of the variables
    this.xValueProperty = xValueProperty;
    this.yValueProperty = yValueProperty;
    this.zValueProperty = zValueProperty;

    // @private {Property.<string>} - string representations of the variables
    this.xValueStringProperty = new DerivedProperty( [ xValueProperty ], value => `(${value.toString()})` );
    this.yValueStringProperty = new DerivedProperty( [ yValueProperty ], value => `(${value.toString()})` );
    this.zValueStringProperty = new DerivedProperty( [ zValueProperty ], value => `(${value.toString()})` );

    // @private, value property for x times y
    this.xTimesYValueProperty = new DerivedProperty(
      [ this.xValueProperty, this.yValueProperty ],
      ( xValue, yValue ) => xValue * yValue
    );

    // @private, the string depicted for x times y when 'variable values' is enabled
    this.xTimesYValueStringProperty = new DerivedProperty(
      [ this.xValueProperty, this.yValueProperty ],
      ( xValue, yValue ) => `(${xValue.toString()})(${yValue.toString()})`
    );

    // @private, value property for x squared
    this.xSquaredValueProperty = new DerivedProperty(
      [ this.xValueProperty ],
      xValue => xValue * xValue
    );

    // @private, the string depicted for x squared when 'variable values' is enabled
    this.xSquaredValueStringProperty = new DerivedProperty(
      [ this.xValueProperty ],
      xValue => `(${xValue.toString()})<sup>2</sup>`
    );

    // @private, value property for y squared
    this.ySquaredValueProperty = new DerivedProperty(
      [ this.yValueProperty ],
      yValue => yValue * yValue
    );

    // @private, the string depicted for y squared when 'variable values' is enabled
    this.ySquaredValueStringProperty = new DerivedProperty(
      [ this.yValueProperty ],
      yValue => `(${yValue.toString()})<sup>2</sup>`
    );

    // @private, value property for x squared times y squared
    this.xSquaredTimesYSquaredValueProperty = new DerivedProperty(
      [ this.xValueProperty, this.yValueProperty ],
      ( xValue, yValue ) => xValue * xValue * yValue * yValue
    );

    // @private, the string depicted for y squared when 'variable values' is enabled
    this.xSquaredTimesYSquaredValueStringProperty = new DerivedProperty(
      [ this.xValueProperty, this.yValueProperty ],
      ( xValue, yValue ) => `(${xValue.toString()})<sup>2</sup>(${yValue.toString()})<sup>2</sup>`
    );
  }

  /**
   * create a coin term of the specified type
   * @param {CoinTermTypeID} typeID
   * @param {Object} [options] - see CoinTerm constructor
   * @returns {CoinTerm}
   * @public
   */
  createCoinTerm( typeID, options ) {

    let valueProperty;
    let coinRadius;
    let termText;
    let termValueStringProperty;

    // set up the various values and properties based on the specified type ID
    switch( typeID ) {

      case CoinTermTypeID.X:
        valueProperty = this.xValueProperty;
        coinRadius = 22;
        termText = 'x';
        termValueStringProperty = this.xValueStringProperty;
        break;

      case CoinTermTypeID.Y:
        valueProperty = this.yValueProperty;
        coinRadius = 22;
        termText = 'y';
        termValueStringProperty = this.yValueStringProperty;
        break;

      case CoinTermTypeID.Z:
        valueProperty = this.zValueProperty;
        coinRadius = 25;
        termText = 'z';
        termValueStringProperty = this.zValueStringProperty;
        break;

      case CoinTermTypeID.X_TIMES_Y:
        valueProperty = this.xTimesYValueProperty;
        coinRadius = 25;
        termText = 'xy';
        termValueStringProperty = this.xTimesYValueStringProperty;
        break;

      case CoinTermTypeID.X_SQUARED:
        valueProperty = this.xSquaredValueProperty;
        coinRadius = 27;
        termText = 'x<sup>2</sup>';
        termValueStringProperty = this.xSquaredValueStringProperty;
        break;

      case CoinTermTypeID.Y_SQUARED:
        valueProperty = this.ySquaredValueProperty;
        coinRadius = 27;
        termText = 'y<sup>2</sup>';
        termValueStringProperty = this.ySquaredValueStringProperty;
        break;

      case CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED:
        valueProperty = this.xSquaredTimesYSquaredValueProperty;
        coinRadius = 28;
        termText = 'x<sup>2</sup>y<sup>2</sup>';
        termValueStringProperty = this.xSquaredTimesYSquaredValueStringProperty;
        break;

      case CoinTermTypeID.CONSTANT:
        valueProperty = CONSTANT_ONE_VALUE_PROPERTY;
        coinRadius = 20; // fairly arbitrary, since this should never end up being depicted as a coin
        termText = '1';
        termValueStringProperty = CONSTANT_ONE_TEXT_VALUE_PROPERTY;
        break;

      default:
        assert && assert( false, `Unrecognized type ID for coin term, = ${typeID}` );
    }

    return new CoinTerm(
      valueProperty,
      coinRadius,
      termText,
      termValueStringProperty,
      typeID,
      options
    );
  }
}

expressionExchange.register( 'CoinTermFactory', CoinTermFactory );

export default CoinTermFactory;