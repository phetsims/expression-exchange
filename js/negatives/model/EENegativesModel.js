// Copyright 2015-2017, University of Colorado Boulder

/**
 * main model for the 'Explore' screen
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const AllowedRepresentations = require( 'EXPRESSION_EXCHANGE/common/enum/AllowedRepresentations' );
  const CoinTermCreatorSetID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermCreatorSetID' );
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
  const inherit = require( 'PHET_CORE/inherit' );

  /**
   * @constructor
   */
  function EENegativesModel() {

    ExpressionManipulationModel.call( this, {
      coinTermCollection: CoinTermCreatorSetID.VARIABLES,
      allowedRepresentations: AllowedRepresentations.VARIABLES_ONLY
    } );

  }

  expressionExchange.register( 'EENegativesModel', EENegativesModel );

  return inherit( ExpressionManipulationModel, EENegativesModel );
} );