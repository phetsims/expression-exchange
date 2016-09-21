// Copyright 2016, University of Colorado Boulder

/**
 * a node that allows the user to change the values of the variables that underlie the various coin terms
 */
define( function( require ) {
  'use strict';

  // modules
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RefreshButton = require( 'SCENERY_PHET/buttons/RefreshButton' );
  var LeftRightNumberSpinner = require( 'EXPRESSION_EXCHANGE/common/view/LeftRightNumberSpinner' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @param {Object} options
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

    // convenience vars to make the code more readable
    var xValueProperty = options.xTermValueProperty;
    var yValueProperty = options.yTermValueProperty;
    var zValueProperty = options.zTermValueProperty;

    // create button that will be used to restore the default values
    var restoreDefaultsButton = new RefreshButton( {
      iconWidth: 20,
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

    // create the spinner controls
    var spinners = [];
    var tweakerOptions = { minValue: options.minValue, maxValue: options.maxValue };
    xValueProperty && spinners.push( new LeftRightNumberSpinner( xValueProperty, EESharedConstants.X_VARIABLE_CHAR, tweakerOptions ) );
    yValueProperty && spinners.push( new LeftRightNumberSpinner( yValueProperty, EESharedConstants.Y_VARIABLE_CHAR, tweakerOptions ) );
    zValueProperty && spinners.push( new LeftRightNumberSpinner( zValueProperty, EESharedConstants.Z_VARIABLE_CHAR, tweakerOptions ) );

    // construct the VBox with the tweakers and the 'restore default values' button
    VBox.call( this, {
      children: spinners,
      spacing: 20
    } );
  }

  expressionExchange.register( 'VariableValueControl', VariableValueControl );

  return inherit( VBox, VariableValueControl );
} );