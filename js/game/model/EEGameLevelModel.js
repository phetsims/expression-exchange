// Copyright 2017, University of Colorado Boulder

/**
 * model for a single level of the Expression Exchange game
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ExpressionCollectionArea = require( 'EXPRESSION_EXCHANGE/game/model/ExpressionCollectionArea' );
  var ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );

  // constants
  var EXPRESSION_COLLECTION_AREA_X_OFFSET = 750;
  var EXPRESSION_COLLECTION_AREA_INITIAL_Y_OFFSET = 100;
  var EXPRESSION_COLLECTION_AREA_Y_SPACING = 130;
  var NUM_EXPRESSION_COLLECTION_AREAS = 3;

  /**
   * TODO: Document parameters when finalized
   * @constructor
   */
  function EEGameLevelModel( level, allowedRepresentations ) {

    var self = this;
    this.level = level; // @public, read only
    this.challengeNumber = 0;

    // @public, model that allows user to manipulate coin terms and expressions
    this.expressionManipulationModel = new ExpressionManipulationModel( {
      allowedRepresentations: allowedRepresentations,
      partialCancellationEnabled: false // partial cancellation isn't performed in the games
    } );

    // @public, read only - areas where expressions can be collected
    this.expressionCollectionAreas = [];
    _.times( NUM_EXPRESSION_COLLECTION_AREAS, function( index ) {
      self.expressionCollectionAreas.push( new ExpressionCollectionArea(
        EXPRESSION_COLLECTION_AREA_X_OFFSET,
        EXPRESSION_COLLECTION_AREA_INITIAL_Y_OFFSET + index * EXPRESSION_COLLECTION_AREA_Y_SPACING
      ) );
    } );
  }

  expressionExchange.register( 'EEGameLevelModel', EEGameLevelModel );

  return inherit( Object, EEGameLevelModel, {

    /**
     * @param {number} dt
     * @public
     */
    step: function( dt ) {
      this.expressionManipulationModel.step( dt );
    },

    /**
     * @public
     */
    reset: function() {
      // TODO: This is incomplete and will need to be expanded once the collection boxes are implemented.
      this.expressionManipulationModel.reset();
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