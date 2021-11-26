// Copyright 2016-2021, University of Colorado Boulder

/**
 * a node that allows the user to change the values of the variables that underlie the various coin terms
 */

import merge from '../../../../phet-core/js/merge.js';
import ResetButton from '../../../../scenery-phet/js/buttons/ResetButton.js';
import { VBox } from '../../../../scenery/js/imports.js';
import expressionExchange from '../../expressionExchange.js';
import LeftRightNumberSpinner from './LeftRightNumberSpinner.js';

class VariableValueControl extends VBox {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      xTermValueProperty: null,
      yTermValueProperty: null,
      zTermValueProperty: null,
      minValue: 0,
      maxValue: 10
    }, options );

    // convenience vars to make the code below more readable
    const xValueProperty = options.xTermValueProperty;
    const yValueProperty = options.yTermValueProperty;
    const zValueProperty = options.zTermValueProperty;

    //  button that will be used to restore the default values
    const restoreDefaultsButton = new ResetButton( {
      baseColor: '#f5f5f5',
      arrowColor: 'black',
      radius: 16,
      touchAreaDilation: 5,
      listener: () => {
        xValueProperty && xValueProperty.reset();
        yValueProperty && yValueProperty.reset();
        zValueProperty && zValueProperty.reset();
      }
    } );

    function updateRestoreButtonEnabledState() {
      restoreDefaultsButton.enabled =
        ( xValueProperty !== null && xValueProperty.value !== xValueProperty.initialValue ) ||
        ( yValueProperty !== null && yValueProperty.value !== yValueProperty.initialValue ) ||
        ( zValueProperty !== null && zValueProperty.value !== zValueProperty.initialValue );
    }

    // hook up function for updating the enabled state of the "restore defaults" button
    xValueProperty && xValueProperty.link( updateRestoreButtonEnabledState );
    yValueProperty && yValueProperty.link( updateRestoreButtonEnabledState );
    zValueProperty && zValueProperty.link( updateRestoreButtonEnabledState );

    // create the tweaker controls
    const controls = [];
    const tweakerOptions = { minValue: options.minValue, maxValue: options.maxValue };
    xValueProperty && controls.push( new LeftRightNumberSpinner(
      xValueProperty,
      'x',
      tweakerOptions
    ) );
    yValueProperty && controls.push( new LeftRightNumberSpinner(
      yValueProperty,
      'y',
      tweakerOptions
    ) );
    zValueProperty && controls.push( new LeftRightNumberSpinner(
      zValueProperty,
      'z',
      tweakerOptions
    ) );

    // add in the 'restore defaults' button
    controls.push( restoreDefaultsButton );

    // construct the VBox with the tweakers and the 'restore default values' button
    super( {
      children: controls,
      spacing: 20
    } );
  }
}

expressionExchange.register( 'VariableValueControl', VariableValueControl );

export default VariableValueControl;