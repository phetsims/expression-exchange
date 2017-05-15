// Copyright 2017, University of Colorado Boulder

/**
 * model for a single level of the Expression Exchange game
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AllowedRepresentationsEnum = require( 'EXPRESSION_EXCHANGE/common/enum/AllowedRepresentationsEnum' );
  var EEChallengeDescriptors = require( 'EXPRESSION_EXCHANGE/game/model/EEChallengeDescriptors' );
  var EECollectionArea = require( 'EXPRESSION_EXCHANGE/game/model/EECollectionArea' );
  var ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var ViewMode = require( 'EXPRESSION_EXCHANGE/common/enum/ViewMode' );

  // constants
  var EXPRESSION_COLLECTION_AREA_X_OFFSET = 750;
  var EXPRESSION_COLLECTION_AREA_INITIAL_Y_OFFSET = 50;
  var EXPRESSION_COLLECTION_AREA_Y_SPACING = 60;
  var NUM_EXPRESSION_COLLECTION_AREAS = 3;

  /**
   * @param {number} level
   * @param {AllowedRepresentationsEnum} allowedRepresentations
   * @param {Property.<boolean>} soundEnabledProperty
   * @constructor
   */
  function EEGameLevelModel( level, allowedRepresentations, soundEnabledProperty ) {

    assert && assert(
      allowedRepresentations !== AllowedRepresentationsEnum.COINS_AND_VARIABLES,
      'games do not support switching between coin and variable view'
    );

    ExpressionManipulationModel.call( this, {
      allowedRepresentations: allowedRepresentations,
      partialCancellationEnabled: false, // partial cancellation isn't performed in the games
      simplifyNegativesDefault: true
    } );

    var self = this;

    this.level = level; // {number} @public, read only
    this.soundEnabledProperty = soundEnabledProperty; // @public (listen-only), used by view to enable/disable sounds
    this.currentChallengeNumber = 0;

    // @public - property that refers to the current challenge
    this.currentChallengeProperty = new Property(
      EEChallengeDescriptors.getChallengeDescriptor( level, this.currentChallengeNumber )
    );

    // @public (read only) - current score for this level
    this.scoreProperty = new Property( 0 );

    // helper function to update the score when items are collected or un-collected
    function updateScore() {
      var score = 0;
      self.collectionAreas.forEach( function( collectionArea ) {
        if ( !collectionArea.isEmpty() ) {
          score++;
        }
      } );
      self.scoreProperty.set( score );
    }

    // initialize the collection areas
    var collectionAreaYPos = EXPRESSION_COLLECTION_AREA_INITIAL_Y_OFFSET;
    _.times( NUM_EXPRESSION_COLLECTION_AREAS, function() {
      var collectionArea = new EECollectionArea(
        EXPRESSION_COLLECTION_AREA_X_OFFSET,
        collectionAreaYPos,
        allowedRepresentations === AllowedRepresentationsEnum.COINS_ONLY ? ViewMode.COINS : ViewMode.VARIABLES
      );
      collectionArea.collectedItemProperty.link( updateScore );
      self.collectionAreas.push( collectionArea );
      collectionAreaYPos += collectionArea.bounds.height + EXPRESSION_COLLECTION_AREA_Y_SPACING;
    } );

    // update the expression description associated with the expression collection areas each time a new challenge is set
    this.currentChallengeProperty.link( function( currentChallenge ) {
      self.collectionAreas.forEach( function( expressionCollectionArea, index ) {
        expressionCollectionArea.expressionDescriptionProperty.set( currentChallenge.expressionsToCollect[ index ] );
      } );
    } );
  }

  expressionExchange.register( 'EEGameLevelModel', EEGameLevelModel );

  return inherit( ExpressionManipulationModel, EEGameLevelModel, {

    /**
     * @public
     */
    reset: function() {
      ExpressionManipulationModel.prototype.reset.call( this );
      this.currentChallengeNumber = 0;
      this.currentChallengeProperty.set(
        EEChallengeDescriptors.getChallengeDescriptor( this.level, this.currentChallengeNumber )
      );
    },

    /**
     * @public
     */
    refresh: function() {
      this.collectionAreas.forEach( function( collectionArea ) {
        collectionArea.reset();
      } );
      ExpressionManipulationModel.prototype.reset.call( this );
      this.loadNextChallenge();
    },

    loadNextChallenge: function() {
      this.currentChallengeNumber = ( this.currentChallengeNumber + 1 ) % EEChallengeDescriptors.CHALLENGES_PER_LEVEL;
      this.currentChallengeProperty.set( EEChallengeDescriptors.getChallengeDescriptor(
        this.level,
        this.currentChallengeNumber
      ) );
    }
  } );
} );