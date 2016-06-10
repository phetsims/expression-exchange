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
  var Property = require( 'AXON/Property' );
  var RefreshButton = require( 'SCENERY_PHET/buttons/RefreshButton' );
  var VariableValueTweaker = require( 'EXPRESSION_EXCHANGE/common/view/VariableValueTweaker' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @param {Property.<number>} xTermValueProperty
   * @param {Property.<number>} yTermValueProperty
   * @param {Property.<number>} zTermValueProperty
   * @param {number} minValue
   * @param {number} maxValue
   * @constructor
   */
  function VariableValueControl( xTermValueProperty, yTermValueProperty, zTermValueProperty, minValue, maxValue ) {

    // create button that will be used to restore the default values
    var restoreDefaultsButton = new RefreshButton( {
      iconWidth: 20,
      listener: function() {
        xTermValueProperty.reset();
        yTermValueProperty.reset();
        zTermValueProperty.reset();
      }
    } );

    // update the enabled state of the 'restore default values' button
    Property.multilink(
      [ xTermValueProperty, yTermValueProperty, zTermValueProperty ],
      function( xValue, yValue, zValue ) {
        restoreDefaultsButton.enabled = xValue !== xTermValueProperty.initialValue ||
                                        yValue !== yTermValueProperty.initialValue ||
                                        zValue !== zTermValueProperty.initialValue;
      }
    );

    // construct the VBox with the tweakers and the 'restore default values' button
    var tweakerOptions = { minValue: minValue, maxValue: maxValue };
    VBox.call( this, {
      children: [
        new VariableValueTweaker( xTermValueProperty, EESharedConstants.X_VARIABLE_CHAR, tweakerOptions ),
        new VariableValueTweaker( yTermValueProperty, EESharedConstants.Y_VARIABLE_CHAR, tweakerOptions ),
        new VariableValueTweaker( zTermValueProperty, EESharedConstants.Z_VARIABLE_CHAR, tweakerOptions ),
        restoreDefaultsButton
      ],
      spacing: 20
    } );
  }

  expressionExchange.register( 'VariableValueControl', VariableValueControl );

  return inherit( VBox, VariableValueControl );
} );