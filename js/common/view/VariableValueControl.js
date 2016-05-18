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

  function VariableValueControl( xTermValueProperty, yTermValueProperty, zTermValueProperty ) {

    // create button that will be used to restore the default values
    var restoreDefaultsButton = new RefreshButton( {
      iconWidth: 20,
      listener: function(){
        xTermValueProperty.reset();
        yTermValueProperty.reset();
        zTermValueProperty.reset();
      }
    } );

    // update the enabled state of the 'restore default values' button
    Property.multilink(
      [ xTermValueProperty, yTermValueProperty, zTermValueProperty ],
      function( xValue, yValue, zValue ){
        restoreDefaultsButton.enabled = xValue !== xTermValueProperty.initialValue ||
                                        yValue !== yTermValueProperty.initialValue ||
                                        zValue !== zTermValueProperty.initialValue;
      }
    );

    // construct the VBox with the tweakers and the 'restore default values' button
    VBox.call( this, {
      children: [
        new VariableValueTweaker( xTermValueProperty, EESharedConstants.X_VARIABLE_CHAR ),
        new VariableValueTweaker( yTermValueProperty, EESharedConstants.Y_VARIABLE_CHAR ),
        new VariableValueTweaker( zTermValueProperty, EESharedConstants.Z_VARIABLE_CHAR ),
        restoreDefaultsButton
      ],
      spacing: 20
    } );
  }

  expressionExchange.register( 'VariableValueControl', VariableValueControl );

  return inherit( VBox, VariableValueControl );
} );