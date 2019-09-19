// Copyright 2016-2017, University of Colorado Boulder

/**
 * The 'Explore' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const AllowedRepresentations = require( 'EXPRESSION_EXCHANGE/common/enum/AllowedRepresentations' );
  const CoinTermCreatorSetID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermCreatorSetID' );
  const EENegativesIconNode = require( 'EXPRESSION_EXCHANGE/negatives/view/EENegativesIconNode' );
  const EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const ExpressionExplorationScreenView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionExplorationScreenView' );
  const ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Property = require( 'AXON/Property' );
  const Screen = require( 'JOIST/Screen' );

  // strings
  const negativesString = require( 'string!EXPRESSION_EXCHANGE/negatives' );

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
          allowedRepresentations: AllowedRepresentations.VARIABLES_ONLY
        } );
      },
      function( model ) { return new ExpressionExplorationScreenView( model, CoinTermCreatorSetID.VARIABLES ); },
      options
    );
  }

  expressionExchange.register( 'EENegativesScreen', EENegativesScreen );

  return inherit( Screen, EENegativesScreen );
} );
