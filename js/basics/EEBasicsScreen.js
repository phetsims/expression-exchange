// Copyright 2016, University of Colorado Boulder

/**
 * The 'Explore' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EEBasicsIconNode = require( 'EXPRESSION_EXCHANGE/basics/view/EEBasicsIconNode' );
  var EEBasicsModel = require( 'EXPRESSION_EXCHANGE/basics/model/EEBasicsModel' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionExplorationScreenView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionExplorationScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var basicsString = require( 'string!EXPRESSION_EXCHANGE/basics' );

  /**
   * @constructor
   */
  function EEBasicsScreen() {

    var options = {
      name: basicsString,
      backgroundColor: EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR,
      homeScreenIcon: new EEBasicsIconNode()
    };

    Screen.call( this,
      function() { return new EEBasicsModel(); },
      function( model ) { return new ExpressionExplorationScreenView( model ); },
      options
    );
  }

  expressionExchange.register( 'EEBasicsScreen', EEBasicsScreen );

  return inherit( Screen, EEBasicsScreen );
} );