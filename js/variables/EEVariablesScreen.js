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
  var EEVariablesIconNode = require( 'EXPRESSION_EXCHANGE/variables/view/EEVariablesIconNode' );
  var EEVariablesModel = require( 'EXPRESSION_EXCHANGE/variables/model/EEVariablesModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var variablesString = require( 'string!EXPRESSION_EXCHANGE/variables' );

  /**
   * @constructor
   */
  function EEVariablesScreen() {

    var options = {
      name: variablesString,
      backgroundColor: EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR,
      homeScreenIcon: new EEVariablesIconNode()
    };

    Screen.call( this,
      function() { return new EEVariablesModel(); },
      function( model ) { return new ExpressionManipulationView( model ); },
      options
    );
  }

  expressionExchange.register( 'EEVariablesScreen', EEVariablesScreen );

  return inherit( Screen, EEVariablesScreen );
} );