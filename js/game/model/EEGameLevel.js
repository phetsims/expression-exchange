// Copyright 2017-2020, University of Colorado Boulder

/**
 * model for a single level of the Expression Exchange game
 *
 * @author John Blanco
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import AllowedRepresentations from '../../common/enum/AllowedRepresentations.js';
import ViewMode from '../../common/enum/ViewMode.js';
import ExpressionManipulationModel from '../../common/model/ExpressionManipulationModel.js';
import expressionExchange from '../../expressionExchange.js';
import EEChallengeDescriptors from './EEChallengeDescriptors.js';
import EECollectionArea from './EECollectionArea.js';

// constants
const EXPRESSION_COLLECTION_AREA_X_OFFSET = 750;
const EXPRESSION_COLLECTION_AREA_INITIAL_Y_OFFSET = 50;
const EXPRESSION_COLLECTION_AREA_Y_SPACING = 60;
const NUM_EXPRESSION_COLLECTION_AREAS = 3;

class EEGameLevel extends ExpressionManipulationModel {

  /**
   * @param {number} levelNumber
   * @param {AllowedRepresentations} allowedRepresentations
   */
  constructor( levelNumber, allowedRepresentations ) {

    assert && assert(
      allowedRepresentations !== AllowedRepresentations.COINS_AND_VARIABLES,
      'games do not support switching between coin and variable view'
    );

    super( {
      allowedRepresentations: allowedRepresentations,
      partialCancellationEnabled: false, // partial cancellation isn't performed in the games
      simplifyNegativesDefault: true
    } );

    const self = this;

    this.levelNumber = levelNumber; // @public (read-only) {number}
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
    this.scoreProperty.link( score => {
      if ( score === 0 ) {
        this.scoreWasZeroSinceLastCompletion = true;
      }
      this.completedSinceLastClearProperty.set( score === NUM_EXPRESSION_COLLECTION_AREAS && this.scoreWasZeroSinceLastCompletion );
    } );

    // helper function to update the score when items are collected or un-collected
    function updateScore() {
      let score = 0;
      self.collectionAreas.forEach( collectionArea => {
        if ( !collectionArea.isEmpty() ) {
          score++;
        }
      } );
      self.scoreProperty.set( score );
    }

    // create a property that indicate whether undo of collection areas should be allowed
    const undoAllowedProperty = new DerivedProperty( [ this.scoreProperty ], score => score < NUM_EXPRESSION_COLLECTION_AREAS );

    // initialize the collection areas
    let collectionAreaYPos = EXPRESSION_COLLECTION_AREA_INITIAL_Y_OFFSET;
    _.times( NUM_EXPRESSION_COLLECTION_AREAS, () => {
      const collectionArea = new EECollectionArea(
        EXPRESSION_COLLECTION_AREA_X_OFFSET,
        collectionAreaYPos,
        allowedRepresentations === AllowedRepresentations.COINS_ONLY ? ViewMode.COINS : ViewMode.VARIABLES,
        undoAllowedProperty
      );
      collectionArea.collectedItemProperty.link( updateScore );
      this.collectionAreas.push( collectionArea );
      collectionAreaYPos += collectionArea.bounds.height + EXPRESSION_COLLECTION_AREA_Y_SPACING;
    } );

    // update the expression description associated with the expression collection areas each time a new challenge is set
    this.currentChallengeProperty.link( currentChallenge => {
      this.collectionAreas.forEach( ( expressionCollectionArea, index ) => {
        expressionCollectionArea.expressionDescriptionProperty.set( currentChallenge.expressionsToCollect[ index ] );
      } );
    } );
  }

  /**
   * @public
   */
  reset() {
    super.reset();
    this.scoreProperty.reset();
    this.currentChallengeNumber = 0;
    this.currentChallengeProperty.set(
      EEChallengeDescriptors.getChallengeDescriptor( this.levelNumber, this.currentChallengeNumber )
    );
  }

  /**
   * @public
   */
  refresh() {
    this.collectionAreas.forEach( collectionArea => {
      collectionArea.reset();
    } );
    super.reset();
    this.loadNextChallenge();
  }

  /**
   * increment the challenge number and load the associated challenge
   * @private
   */
  loadNextChallenge() {
    this.currentChallengeNumber = ( this.currentChallengeNumber + 1 ) % EEChallengeDescriptors.CHALLENGES_PER_LEVEL;
    this.currentChallengeProperty.set( EEChallengeDescriptors.getChallengeDescriptor(
      this.levelNumber,
      this.currentChallengeNumber
    ) );
  }
}

expressionExchange.register( 'EEGameLevel', EEGameLevel );

export default EEGameLevel;