// Copyright 2016, University of Colorado Boulder

/**
 * main model for the 'Explore' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTermCollection = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermCollection' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @constructor
   */
  function EEExploreModel() {

    ExpressionManipulationModel.call( this, { coinTermCollection: CoinTermCollection.EXPLORE } );

  }

  expressionExchange.register( 'EEExploreModel', EEExploreModel );

  return inherit( ExpressionManipulationModel, EEExploreModel );
} );