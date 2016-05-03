// Copyright 2016, University of Colorado Boulder

/**
 * main model for the 'Explore' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @constructor
   */
  function EEBasicsModel() {

    ExpressionManipulationModel.call( this );

  }

  expressionExchange.register( 'EEBasicsModel', EEBasicsModel );

  return inherit( ExpressionManipulationModel, EEBasicsModel );
} );