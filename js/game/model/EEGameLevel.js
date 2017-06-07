// Copyright 2017, University of Colorado Boulder

/**
 * model for a single level of the Expression Exchange game
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AllowedRepresentations = require( 'EXPRESSION_EXCHANGE/common/enum/AllowedRepresentations' );
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
   * @param {number} levelNumber
   * @param {AllowedRepresentations} allowedRepresentations
   * @param {Property.<boolean>} soundEnabledProperty
   * @constructor
   */
  function EEGameLevel( levelNumber, allowedRepresentations, soundEnabledProperty ) {

    assert && assert(
      allowedRepresentations !== AllowedRepresentations.COINS_AND_VARIABLES,
      'games do not support switching between coin and variable view'
    );

    ExpressionManipulationModel.call( this, {
      allowedRepresentations: allowedRepresentations,
      partialCancellationEnabled: false, // partial cancellation isn't performed in the games
      simplifyNegativesDefault: true
    } );

    var self = this;

    this.levelNumber = levelNumber; // {number} @public, read only
    this.soundEnabledProperty = soundEnabledProperty; // @public {Property.<boolean>} (listen-only), used by view to enable/disable sounds
    this.currentChallengeNumber = 0; // {number} @private

    // @public {EEChallengeDescriptor} (read-only) - property that refers to the current challenge
    this.currentChallengeProperty = new Property(
      EEChallengeDescriptors.getChallengeDescriptor( levelNumber, this.currentChallengeNumber )
    );

    // @public {Property.<number>} (read only) - current score for this level
    this.scoreProperty = new Property( 0 );

    // @private {boolean} - a flag used to track whether this level has been completed.  In order to be set to true, the
    // user must have started from a score of zero and reached the max score since the last time this flag was cleared.
    this.levelCompleted = false;

    // @private {boolean} - a flag that tracks whether the score has been set to zero since the last time this level
    // was completed.  This is used to make sure that the user has fully completed the level after clearing the level
    // complete flag.  It is accessed through methods defined below.
    this.scorePassedThroughZero = false;

    // update the flags that track level completion
    this.scoreProperty.link( function( score ) {
      if ( !self.scorePassedThroughZero && score === 0 ) {
        self.scorePassedThroughZero = true;
      }
      if ( self.scorePassedThroughZero && score === NUM_EXPRESSION_COLLECTION_AREAS ) {
        self.levelCompleted = true;
      }
    } );

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
        allowedRepresentations === AllowedRepresentations.COINS_ONLY ? ViewMode.COINS : ViewMode.VARIABLES
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

  expressionExchange.register( 'EEGameLevel', EEGameLevel );

  return inherit( ExpressionManipulationModel, EEGameLevel, {

    /**
     * @public
     */
    reset: function() {
      ExpressionManipulationModel.prototype.reset.call( this );
      this.clearLevelCompleted();
      this.scoreProperty.reset();
      this.currentChallengeNumber = 0;
      this.currentChallengeProperty.set(
        EEChallengeDescriptors.getChallengeDescriptor( this.levelNumber, this.currentChallengeNumber )
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

    /**
     * get a boolean value indicating whether this level has been fully completed, meaning that it was fully unsolved
     * and is now fully solved, since the sim was launched or since the last time the flag was reset
     * @returns {boolean}
     * @public
     */
    getLevelCompleted: function() {
      return this.levelCompleted;
    },

    /**
     * clear the indicators that track whether this level has been fully completed
     * @public
     */
    clearLevelCompleted: function() {
      this.levelCompleted = false;
      this.scorePassedThroughZero = false;
    },

    /**
     * increment the challenge number and load the associated challenge
     * @private
     */
    loadNextChallenge: function() {
      this.currentChallengeNumber = ( this.currentChallengeNumber + 1 ) % EEChallengeDescriptors.CHALLENGES_PER_LEVEL;
      this.currentChallengeProperty.set( EEChallengeDescriptors.getChallengeDescriptor(
        this.levelNumber,
        this.currentChallengeNumber
      ) );
    }
  } );
} );