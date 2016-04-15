// Copyright 2016, University of Colorado Boulder

/**
 * main model for the 'Explore' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @constructor
   */
  function EEExploreModel() {

    ExpressionManipulationModel.call( this );

  }

  return inherit( ExpressionManipulationModel, EEExploreModel );
} );