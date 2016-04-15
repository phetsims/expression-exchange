// Copyright 2016, University of Colorado Boulder

/**
 * main model for the 'Explore' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTermCollectionEnum = require( 'EXPRESSION_EXCHANGE/common/model/CoinTermCollectionEnum' );
  var ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @constructor
   */
  function EEVariablesModel() {

    ExpressionManipulationModel.call( this, { coinTermCollection: CoinTermCollectionEnum.ADVANCED } );

  }

  return inherit( ExpressionManipulationModel, EEVariablesModel );
} );