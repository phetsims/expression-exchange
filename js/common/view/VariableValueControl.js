// Copyright 2016-2017, University of Colorado Boulder

/**
 * a node that allows the user to change the values of the variables that underlie the various coin terms
 */
define( require => {
  'use strict';

  // modules
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const inherit = require( 'PHET_CORE/inherit' );
  const LeftRightNumberSpinner = require( 'EXPRESSION_EXCHANGE/common/view/LeftRightNumberSpinner' );
  const ResetButton = require( 'SCENERY_PHET/buttons/ResetButton' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function VariableValueControl( options ) {

    options = _.extend( {
      xTermValueProperty: null,
      yTermValueProperty: null,
      zTermValueProperty: null,
      minValue: 0,
      maxValue: 10
    }, options );

    // convenience vars to make the code below more readable
    var xValueProperty = options.xTermValueProperty;
    var yValueProperty = options.yTermValueProperty;
    var zValueProperty = options.zTermValueProperty;

    //  button that will be used to restore the default values
    var restoreDefaultsButton = new ResetButton( {
      baseColor: '#f5f5f5',
      arrowColor: 'black',
      radius: 16,
      touchAreaDilation: 5,
      listener: function() {
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
    var controls = [];
    var tweakerOptions = { minValue: options.minValue, maxValue: options.maxValue };
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
    VBox.call( this, {
      children: controls,
      spacing: 20
    } );
  }

  expressionExchange.register( 'VariableValueControl', VariableValueControl );

  return inherit( VBox, VariableValueControl );
} );
