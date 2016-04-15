// Copyright 2016, University of Colorado Boulder

/**
 * The 'Explore' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ExpressionManipulationView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionManipulationView' );
  var EEVariablesModel = require( 'EXPRESSION_EXCHANGE/variables/model/EEVariablesModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RandomIcon = require( 'EXPRESSION_EXCHANGE/common/view/RandomIcon' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var variablesString = require( 'string!EXPRESSION_EXCHANGE/variables' );

  /**
   * @constructor
   */
  function EEVariablesScreen() {

    // TODO: temporary icon, will need to be replaced
    var icon = new RandomIcon();

    Screen.call( this, variablesString, icon,
      function() { return new EEVariablesModel(); },
      function( model ) { return new ExpressionManipulationView( model ); },
      { backgroundColor: '#AFF6CC' }
    );
  }

  return inherit( Screen, EEVariablesScreen );
} );