// Copyright 2016, University of Colorado Boulder

/**
 * main model for the 'Explore' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTermCreatorSet = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermCreatorSet' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @constructor
   */
  function EEExploreModel() {

    ExpressionManipulationModel.call( this, { coinTermCollection: CoinTermCreatorSet.EXPLORE } );

  }

  expressionExchange.register( 'EEExploreModel', EEExploreModel );

  return inherit( ExpressionManipulationModel, EEExploreModel );
} );