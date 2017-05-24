// Copyright 2016, University of Colorado Boulder

/**
 * main model type for the game
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AllowedRepresentationsEnum = require( 'EXPRESSION_EXCHANGE/common/enum/AllowedRepresentationsEnum' );
  var EEChallengeDescriptors = require( 'EXPRESSION_EXCHANGE/game/model/EEChallengeDescriptors' );
  var EEGameLevelModel = require( 'EXPRESSION_EXCHANGE/game/model/EEGameLevelModel' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );

  // constants
  var NUMBER_OF_LEVELS = 8;
  var CHALLENGES_PER_LEVEL = 3;
  var POINTS_PER_CHALLENGE = 1;
  var MAX_SCORE_PER_LEVEL = CHALLENGES_PER_LEVEL * POINTS_PER_CHALLENGE;
  var MAX_TOTAL_SCORE = NUMBER_OF_LEVELS * MAX_SCORE_PER_LEVEL;

  /**
   * @constructor
   */
  function EEGameModel() {

    var self = this;

    //------------------------------------------------------------------------
    // properties
    //------------------------------------------------------------------------

    // @public
    this.soundEnabledProperty = new Property( true );
    this.timerEnabledProperty = new Property( true );
    this.allLevelsCompletedProperty = new Property( false );

    // @public, currently selected level, null indicates no level selected which means that the level selection screen
    // should be shown in the view
    //REVIEW: Why is this not just a property of the EEGameLevelModel objects? Should simplify a lot of code
    this.currentLevelProperty = new Property( null );

    //------------------------------------------------------------------------
    // other initialization
    //------------------------------------------------------------------------

    // shuffle the challenge descriptors before creating the levels
    EEChallengeDescriptors.shuffleChallenges();

    // @public (read-only) - models for each of the game levels REVIEW: gameLevels is a better name?
    this.gameLevelModels = [];
    _.times( NUMBER_OF_LEVELS, function( level ) {
      self.gameLevelModels.push( new EEGameLevelModel(
        level,
        level < 3 ? AllowedRepresentationsEnum.COINS_ONLY : AllowedRepresentationsEnum.VARIABLES_ONLY,
        self.soundEnabledProperty
      ) );
    } );

    // function to total up the score and update the property that tracks whether all levels are completed
    function updateAllLevelsCompleted() {
      var totalScore = 0;
      self.gameLevelModels.forEach( function( gameLevelModel ) {
        totalScore += gameLevelModel.scoreProperty.get();
      } );
      self.allLevelsCompletedProperty.set( totalScore === MAX_TOTAL_SCORE );
    }

    // Hook up a listener to the score property of each level that will keep track of whether all levels have been
    // successfully completed.
    this.gameLevelModels.forEach( function( gameLevelModel ) {
      gameLevelModel.scoreProperty.lazyLink( updateAllLevelsCompleted );
    } );

    // @public - score properties for each level
    this.levelScoreProperties = []; // @public, read only
    _.times( NUMBER_OF_LEVELS, function( index ) {
      self.levelScoreProperties.push( self.gameLevelModels[ index ].scoreProperty );
    } );
  }

  expressionExchange.register( 'EEGameModel', EEGameModel );

  return inherit( Object, EEGameModel, {

      step: function( dt ) {

        // step the currently active level model (if there is one)
        if ( this.currentLevelProperty.get() !== null ) {
          this.gameLevelModels[ this.currentLevelProperty.get() ].step( dt );
        }
      },

      // @public
      selectLevel: function( levelNumber ) {
        this.currentLevelProperty.set( levelNumber );
      },

      // @public
      //REVIEW: docs?
      //REVIEW: This is done right after creating the views for each level. Can we just pass it as part of the view
      // construction?
      setCoinTermRetrievalBounds: function( bounds ) {
        this.gameLevelModels.forEach( function( gameLevelModel ) {
          gameLevelModel.setCoinTermRetrievalBounds( bounds );
        } );
      },

      // @public
      returnToLevelSelection: function() {
        this.currentLevelProperty.reset();
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
        this.gameLevelModels.forEach( function( levelModel ) {
          levelModel.reset();
        } );
      }
    },

    {
      // statics
      CHALLENGES_PER_LEVEL: CHALLENGES_PER_LEVEL,
      MAX_SCORE_PER_LEVEL: MAX_SCORE_PER_LEVEL,
      NUMBER_OF_LEVELS: NUMBER_OF_LEVELS
    } );
} );