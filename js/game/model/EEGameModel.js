// Copyright 2016, University of Colorado Boulder

/**
 * main model type for the game
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AllowedRepresentations = require( 'EXPRESSION_EXCHANGE/common/enum/AllowedRepresentations' );
  var EEChallengeDescriptors = require( 'EXPRESSION_EXCHANGE/game/model/EEChallengeDescriptors' );
  var EEGameLevel = require( 'EXPRESSION_EXCHANGE/game/model/EEGameLevel' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );

  // constants
  var NUMBER_OF_LEVELS = 8;
  var CHALLENGES_PER_LEVEL = 3;
  var POINTS_PER_CHALLENGE = 1;
  var MAX_SCORE_PER_LEVEL = CHALLENGES_PER_LEVEL * POINTS_PER_CHALLENGE;

  /**
   * @constructor
   */
  function EEGameModel() {

    var self = this;

    //------------------------------------------------------------------------
    // properties
    //------------------------------------------------------------------------

    // @public {Property.<boolean>}
    this.soundEnabledProperty = new Property( true );
    this.timerEnabledProperty = new Property( true );

    // @public {Property.<GameLevel>} - (read-only) currently selected level, null indicates no level selected, which
    // means that the level selection screen should appear to the user
    this.currentLevelProperty = new Property( null );

    //------------------------------------------------------------------------
    // other initialization
    //------------------------------------------------------------------------

    // shuffle the challenge descriptors before creating the levels
    EEChallengeDescriptors.shuffleChallenges();

    // @public {Array.<EEGameLevel>} (read-only) - models for each of the game levels
    this.gameLevels = [];
    _.times( NUMBER_OF_LEVELS, function( level ) {
      self.gameLevels.push( new EEGameLevel(
        level,
        level < 3 ? AllowedRepresentations.COINS_ONLY : AllowedRepresentations.VARIABLES_ONLY,
        self.soundEnabledProperty
      ) );
    } );
  }

  expressionExchange.register( 'EEGameModel', EEGameModel );

  return inherit( Object, EEGameModel, {

      /**
       * step the model
       * @param {number} dt - delta time
       * @public
       */
      step: function( dt ) {

        // step the currently active level model (if there is one)
        this.currentLevelProperty.get() && this.currentLevelProperty.get().step( dt );
      },

      /**
       * set the game level using a number (0-based)
       * @param {number} levelNumber
       * @public
       */
      selectLevel: function( levelNumber ) {
        this.currentLevelProperty.set( this.gameLevels[ levelNumber ] );
      },

      /**
       * move to the next level
       * @public
       */
      nextLevel: function() {
        this.currentLevelProperty.set(
          this.gameLevels[ ( this.currentLevelProperty.get().levelNumber + 1  ) % NUMBER_OF_LEVELS ]
        );
      },

      // @public
      returnToLevelSelection: function() {
        this.currentLevelProperty.reset();
      },

      // @public
      getAllLevelsCompleted: function() {
        return _.every( this.gameLevels, function( gameLevelModel ) { return gameLevelModel.getLevelCompleted(); } );
      },

      // @public
      clearAllLevelsCompleted: function() {
        this.gameLevels.forEach( function( gameLevelModel ) { gameLevelModel.clearLevelCompleted(); } );
      },

      // reset
      reset: function() {

        // re-shuffle the challenges
        EEChallengeDescriptors.shuffleChallenges();

        // reset local properties
        this.currentLevelProperty.reset();
        this.soundEnabledProperty.reset();
        this.timerEnabledProperty.reset();

        // reset each of the levels
        this.gameLevels.forEach( function( levelModel ) {
          levelModel.reset();
        } );
      }
    },

    {
      // statics
      CHALLENGES_PER_LEVEL: CHALLENGES_PER_LEVEL,
      MAX_SCORE_PER_LEVEL: MAX_SCORE_PER_LEVEL,
      NUMBER_OF_LEVELS: NUMBER_OF_LEVELS,
      POINTS_PER_CHALLENGE: POINTS_PER_CHALLENGE
    } );
} );