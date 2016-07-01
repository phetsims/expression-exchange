// Copyright 2016, University of Colorado Boulder

/**
 * The 'Explore' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionManipulationView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionManipulationView' );
  var EEVariablesModel = require( 'EXPRESSION_EXCHANGE/variables/model/EEVariablesModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var variablesString = require( 'string!EXPRESSION_EXCHANGE/variables' );

  /**
   * @constructor
   */
  function EEVariablesScreen() {

    // TODO: temporary icon, will need to be replaced
    var icon = EESharedConstants.RANDOM_ICON_GENERATOR.createIcon( '3' );

    Screen.call( this, variablesString, icon,
      function() { return new EEVariablesModel(); },
      function( model ) { return new ExpressionManipulationView( model ); },
      { backgroundColor: EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR }
    );
  }

  expressionExchange.register( 'EEVariablesScreen', EEVariablesScreen );

  return inherit( Screen, EEVariablesScreen );
} );