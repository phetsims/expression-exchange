// Copyright 2016-2022, University of Colorado Boulder

/**
 * control that allows the user to adjust value of a variable using arrow buttons displayed to the left and right of
 * the value
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import MathSymbolFont from '../../../../scenery-phet/js/MathSymbolFont.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Node, Text } from '../../../../scenery/js/imports.js';
import NumberSpinner from '../../../../sun/js/NumberSpinner.js';
import expressionExchange from '../../expressionExchange.js';

// constants
const READOUT_FONT = new PhetFont( 16 );
const VARIABLE_FONT = new MathSymbolFont( 24 );
const EQUALS_SIGN_FONT = new PhetFont( 22 ); // because the equals sign in MathSymbolFont looked bad
const DEFAULT_MIN_VALUE = -10;
const DEFAULT_MAX_VALUE = 10;

class LeftRightNumberSpinner extends Node {

  /**
   * @param {Property.<number>} variableValueProperty - property that wraps the values that will be manipulated
   * @param {string} variableString - the variable text displayed in the control
   * @param {Object} [options]
   */
  constructor( variableValueProperty, variableString, options ) {
    super();

    options = merge( {
      minValue: DEFAULT_MIN_VALUE,
      maxValue: DEFAULT_MAX_VALUE
    }, options );

    // create and add the readout
    const numberSpinner = new NumberSpinner( variableValueProperty, new Property( new Range( options.minValue, options.maxValue ) ), {
      arrowsPosition: 'leftRight',
      numberDisplayOptions: {
        xMargin: 5,
        yMargin: 3,
        cornerRadius: 4,
        textOptions: {
          font: READOUT_FONT
        }
      }
    } );

    // create an HBox that will hold the variable, the equals sign, and the number spinner
    this.addChild( new HBox( {
      spacing: 6,
      children: [
        new Text( variableString, { font: VARIABLE_FONT } ),
        new Text( MathSymbols.EQUAL_TO, { font: EQUALS_SIGN_FONT } ),
        numberSpinner ]
    } ) );
  }
}

expressionExchange.register( 'LeftRightNumberSpinner', LeftRightNumberSpinner );

export default LeftRightNumberSpinner;