// Copyright 2016, University of Colorado Boulder

/**
 * main model for the 'Explore' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AllowedRepresentations = require( 'EXPRESSION_EXCHANGE/common/enum/AllowedRepresentations' );
  var CoinTermCreatorSetID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermCreatorSetID' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
  var inherit = require( 'PHET_CORE/inherit' );

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