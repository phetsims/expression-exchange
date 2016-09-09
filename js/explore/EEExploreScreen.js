// Copyright 2015, University of Colorado Boulder

/**
 * The 'Explore' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EEExploreIconNode = require( 'EXPRESSION_EXCHANGE/explore/view/EEExploreIconNode' );
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

    var options = {
      name: exploreString,
      backgroundColor: EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR,
      homeScreenIcon: new EEExploreIconNode()
    };

    Screen.call( this,
      function() { return new EEExploreModel(); },
      function( model ) { return new ExpressionManipulationView( model ); },
      options
    );
  }

  expressionExchange.register( 'EEExploreScreen', EEExploreScreen );

  return inherit( Screen, EEExploreScreen );
} );