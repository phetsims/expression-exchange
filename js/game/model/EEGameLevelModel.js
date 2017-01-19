// Copyright 2017, University of Colorado Boulder

/**
 * model for a single level of the Expression Exchange game
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * TODO: Document parameters when finalized
   * @constructor
   */
  function EEGameLevelModel( level, allowedRepresentations ) {

    this.level = level; // @public, read only
    this.challengeNumber = 0;

    // @public, model that allows user to manipulate coin terms and expressions
    this.expressionManipulationModel = new ExpressionManipulationModel( {
      allowedRepresentations: allowedRepresentations
    } );
  }

  expressionExchange.register( 'EEGameLevelModel', EEGameLevelModel );

  return inherit( Object, EEGameLevelModel, {

    step: function( dt ) {
      this.expressionManipulationModel.step( dt );
    },

    /**
     * set up a new challenge
     * @param {Object} challengeDescriptor
     * @public
     */
    setUpChallenge: function( challengeDescriptor ) {
      // TODO: TBD
      assert && assert( false, 'not implemented' );
    },

    setCoinTermRetrievalBounds: function( bounds ) {
      this.expressionManipulationModel.coinTermRetrievalBounds = bounds;
    }
  } );
} );