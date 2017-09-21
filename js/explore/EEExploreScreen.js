// Copyright 2016-2017, University of Colorado Boulder

/**
 * The 'Explore' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTermCreatorSetID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermCreatorSetID' );
  var EEExploreIconNode = require( 'EXPRESSION_EXCHANGE/explore/view/EEExploreIconNode' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionExplorationScreenView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionExplorationScreenView' );
  var ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var exploreString = require( 'string!EXPRESSION_EXCHANGE/explore' );

  /**
   * @constructor
   */
  function EEExploreScreen() {

    var options = {
      name: exploreString,
      backgroundColorProperty: new Property( EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR ),
      homeScreenIcon: new EEExploreIconNode()
    };

    Screen.call( this,
      function() { return new ExpressionManipulationModel(); },
      function( model ) { return new ExpressionExplorationScreenView( model, CoinTermCreatorSetID.EXPLORE ); },
      options
    );
  }

  expressionExchange.register( 'EEExploreScreen', EEExploreScreen );

  return inherit( Screen, EEExploreScreen );
} );
