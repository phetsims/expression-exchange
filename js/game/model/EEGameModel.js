// Copyright 2015-2020, University of Colorado Boulder

/**
 * main model type for the game
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import EEQueryParameters from '../../common/EEQueryParameters.js';
import AllowedRepresentations from '../../common/enum/AllowedRepresentations.js';
import expressionExchange from '../../expressionExchange.js';
import EEChallengeDescriptors from './EEChallengeDescriptors.js';
import EEGameLevel from './EEGameLevel.js';

// constants
const NUMBER_OF_LEVELS = EEQueryParameters.minimalGameLevels ? 2 : 8;
const CHALLENGES_PER_LEVEL = 3;
const POINTS_PER_CHALLENGE = 1;
const MAX_SCORE_PER_LEVEL = CHALLENGES_PER_LEVEL * POINTS_PER_CHALLENGE;

class EEGameModel {

  /**
   */
  constructor() {

    //------------------------------------------------------------------------
    // properties
    //------------------------------------------------------------------------

    // @public {Property.<boolean>}
    this.timerEnabledProperty = new Property( true );

    // @public (read-only) {Property.<GameLevel>} - currently selected level, null indicates no level selected, which
    // means that the level selection screen should appear to the user
    this.currentLevelProperty = new Property( null );

    // @public (read-only) {Property.<boolean>} - transitions to true when all game levels have been completed
    this.allLevelsCompletedProperty = new Property( false );

    //------------------------------------------------------------------------
    // other initialization
    //------------------------------------------------------------------------

    // shuffle the challenge descriptors before creating the levels
    EEChallengeDescriptors.shuffleChallenges();

    // @public (read-only) {Array.<EEGameLevel>} - models for each of the game levels
    this.gameLevels = [];
    _.times( NUMBER_OF_LEVELS, level => {
      const gameLevel = new EEGameLevel(
        level,
        level < 3 ? AllowedRepresentations.COINS_ONLY : AllowedRepresentations.VARIABLES_ONLY
      );
      this.gameLevels.push( gameLevel );
      gameLevel.completedSinceLastClearProperty.link( () => {
        this.allLevelsCompletedProperty.set( this.getAllLevelsCompleted() );
      } );
    } );
  }

  /**
   * step the model
   * @param {number} dt - delta time
   * @public
   */
  step( dt ) {

    // step the currently active level model (if there is one)
    this.currentLevelProperty.get() && this.currentLevelProperty.get().step( dt );
  }

  /**
   * set the game level using a number (0-based)
   * @param {number} levelNumber
   * @public
   */
  selectLevel( levelNumber ) {
    this.currentLevelProperty.set( this.gameLevels[ levelNumber ] );
  }

  /**
   * move to the next level
   * @public
   */
  nextLevel() {
    this.currentLevelProperty.set(
      this.gameLevels[ ( this.currentLevelProperty.get().levelNumber + 1 ) % NUMBER_OF_LEVELS ]
    );
  }

  // @public
  returnToLevelSelection() {
    this.currentLevelProperty.reset();
  }

  // @public
  getAllLevelsCompleted() {
    return _.every( this.gameLevels, gameLevelModel => gameLevelModel.completedSinceLastClearProperty.get() );
  }

  // @public
  clearAllLevelsCompleted() {
    this.gameLevels.forEach( gameLevelModel => {
      gameLevelModel.completedSinceLastClearProperty.set( false );
    } );
  }

  /**
   * @public
   */
  reset() {

    // re-shuffle the challenges
    EEChallengeDescriptors.shuffleChallenges();

    // reset local properties
    this.currentLevelProperty.reset();
    this.timerEnabledProperty.reset();

    // reset each of the levels
    this.gameLevels.forEach( levelModel => {
      levelModel.reset();
    } );
  }

}

// statics
EEGameModel.CHALLENGES_PER_LEVEL = CHALLENGES_PER_LEVEL;
EEGameModel.MAX_SCORE_PER_LEVEL = MAX_SCORE_PER_LEVEL;
EEGameModel.NUMBER_OF_LEVELS = NUMBER_OF_LEVELS;
EEGameModel.POINTS_PER_CHALLENGE = POINTS_PER_CHALLENGE;

expressionExchange.register( 'EEGameModel', EEGameModel );

export default EEGameModel;