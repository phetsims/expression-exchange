// Copyright 2016, University of Colorado Boulder

/**
 * main model for the 'Explore' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AllowedRepresentationsEnum = require( 'EXPRESSION_EXCHANGE/common/model/AllowedRepresentationsEnum' );
  var CoinTermCreatorSet = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermCreatorSet' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @constructor
   */
  function EEVariablesModel() {

    ExpressionManipulationModel.call( this, {
      coinTermCollection: CoinTermCreatorSet.ADVANCED,
      allowedRepresentations: AllowedRepresentationsEnum.VARIABLES_ONLY
    } );

  }

  expressionExchange.register( 'EEVariablesModel', EEVariablesModel );

  return inherit( ExpressionManipulationModel, EEVariablesModel );
} );