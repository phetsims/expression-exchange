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
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var EEChallengeDescriptors = require( 'EXPRESSION_EXCHANGE/game/model/EEChallengeDescriptors' );
  var EECollectionArea = require( 'EXPRESSION_EXCHANGE/game/model/EECollectionArea' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
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

    this.levelNumber = levelNumber; // @public (read-only) {number}
    this.soundEnabledProperty = soundEnabledProperty; // @public  (read-only){Property.<boolean>}, used by view to enable/disable sounds
    this.currentChallengeNumber = 0; // {number} @private

    // @public (read-only) {EEChallengeDescriptor} - property that refers to the current challenge
    this.currentChallengeProperty = new Property(
      EEChallengeDescriptors.getChallengeDescriptor( levelNumber, this.currentChallengeNumber )
    );

    // @public (read-only) {Property.<number>} - current score for this level
    this.scoreProperty = new Property( 0 );

    // @private {boolean}
    this.scoreWasZeroSinceLastCompletion = true;

    // @public (read-only) {Property.<boolean>} - a flag used to track whether this level has been completed since the
    // last time this flag was cleared.  For this to be true, the score must have gone from zero to the max since the
    // last time this flag was set.
    this.completedSinceLastClearProperty = new Property( false );

    // update the variable that track whether the user has fully solved the level since the last time this flag was
    // cleared
    this.scoreProperty.link( function( score ) {
      if ( score === 0 ) {
        self.scoreWasZeroSinceLastCompletion = true;
      }
      self.completedSinceLastClearProperty.set( score === NUM_EXPRESSION_COLLECTION_AREAS && self.scoreWasZeroSinceLastCompletion );
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

    // create a property that indicate whether undo of collection areas should be allowed
    var undoAllowedProperty = new DerivedProperty( [ this.scoreProperty ], function( score ) {
      return score < NUM_EXPRESSION_COLLECTION_AREAS;
    } );

    // initialize the collection areas
    var collectionAreaYPos = EXPRESSION_COLLECTION_AREA_INITIAL_Y_OFFSET;
    _.times( NUM_EXPRESSION_COLLECTION_AREAS, function() {
      var collectionArea = new EECollectionArea(
        EXPRESSION_COLLECTION_AREA_X_OFFSET,
        collectionAreaYPos,
        allowedRepresentations === AllowedRepresentations.COINS_ONLY ? ViewMode.COINS : ViewMode.VARIABLES,
        undoAllowedProperty
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