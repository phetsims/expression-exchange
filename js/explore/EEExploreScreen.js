// Copyright 2015, University of Colorado Boulder

/**
 * The 'Explore' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EEExploreModel = require( 'EXPRESSION_EXCHANGE/explore/model/EEExploreModel' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionManipulationView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionManipulationView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var exploreString = require( 'string!EXPRESSION_EXCHANGE/explore' );

  /**
   * @constructor
   */
  function EEExploreScreen() {

    // TODO: temporary icon, will need to be replaced
    var icon = EESharedConstants.RANDOM_ICON_GENERATOR.createIcon( '2' );

    Screen.call(
      this,
      exploreString,
      icon,
      function() { return new EEExploreModel(); },
      function( model ) { return new ExpressionManipulationView( model ); },
      { backgroundColor: EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR }
    );
  }

  expressionExchange.register( 'EEExploreScreen', EEExploreScreen );

  return inherit( Screen, EEExploreScreen );
} );