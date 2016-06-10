// Copyright 2016, University of Colorado Boulder

/**
 * The 'Explore' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EEBasicsModel = require( 'EXPRESSION_EXCHANGE/basics/model/EEBasicsModel' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionManipulationView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionManipulationView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var basicsString = require( 'string!EXPRESSION_EXCHANGE/basics' );

  /**
   * @constructor
   */
  function EEBasicsScreen() {

    // TODO: temporary icon, will need to be replaced
    var icon = EESharedConstants.RANDOM_ICON_GENERATOR.createIcon( '1' );

    Screen.call( this, basicsString, icon,
      function() { return new EEBasicsModel(); },
      function( model ) { return new ExpressionManipulationView( model ); },
      { backgroundColor: '#AFF6CC' }
    );
  }

  expressionExchange.register( 'EEBasicsScreen', EEBasicsScreen );

  return inherit( Screen, EEBasicsScreen );
} );