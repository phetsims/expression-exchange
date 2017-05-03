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
  var EENegativesIconNode = require( 'EXPRESSION_EXCHANGE/negatives/view/EENegativesIconNode' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionExplorationScreenView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionExplorationScreenView' );
  var ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Property = require( 'AXON/Property' );

  // strings
  var negativesString = require( 'string!EXPRESSION_EXCHANGE/negatives' );

  /**
   * @constructor
   */
  function EENegativesScreen() {

    var options = {
      name: negativesString,
      backgroundColorProperty: new Property( EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR ),
      homeScreenIcon: new EENegativesIconNode()
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

  expressionExchange.register( 'EENegativesScreen', EENegativesScreen );

  return inherit( Screen, EENegativesScreen );
} );
