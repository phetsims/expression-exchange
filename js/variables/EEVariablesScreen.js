// Copyright 2016, University of Colorado Boulder

/**
 * The 'Explore' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AllowedRepresentationsEnum = require( 'EXPRESSION_EXCHANGE/common/enum/AllowedRepresentationsEnum' );
  var CoinTermCreatorSetID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermCreatorSetID' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var EEVariablesIconNode = require( 'EXPRESSION_EXCHANGE/variables/view/EEVariablesIconNode' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionExplorationScreenView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionExplorationScreenView' );
  var ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Property = require( 'AXON/Property' );

  // strings
  var variablesString = require( 'string!EXPRESSION_EXCHANGE/variables' );

  /**
   * @constructor
   */
  function EEVariablesScreen() {

    var options = {
      name: variablesString,
      backgroundColorProperty: new Property( EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR ),
      homeScreenIcon: new EEVariablesIconNode()
    };

    Screen.call(
      this,
      function() {
        return new ExpressionManipulationModel( {
          allowedRepresentations: AllowedRepresentationsEnum.VARIABLES_ONLY
        } );
      },
      function( model ) { return new ExpressionExplorationScreenView( model, CoinTermCreatorSetID.VARIABLES ); },
      options
    );
  }

  expressionExchange.register( 'EEVariablesScreen', EEVariablesScreen );

  return inherit( Screen, EEVariablesScreen );
} );
