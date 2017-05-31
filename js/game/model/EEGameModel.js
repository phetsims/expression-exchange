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
  var EEGameLevelModel = require( 'EXPRESSION_EXCHANGE/game/model/EEGameLevelModel' );
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

    // @public, currently selected level, null indicates no level selected which means that the level selection screen
    // should be shown in the view
    //REVIEW: Why is this not just a property of the EEGameLevelModel objects? Should simplify a lot of code
    this.currentLevelProperty = new Property( null );

    //------------------------------------------------------------------------
    // other initialization
    //------------------------------------------------------------------------

    // shuffle the challenge descriptors before creating the levels
    EEChallengeDescriptors.shuffleChallenges();

    // @public {Array.<EEGameLevelModel>} (read-only) - models for each of the game levels REVIEW: gameLevels is a
    //                                                  better name?
    this.gameLevelModels = [];
    _.times( NUMBER_OF_LEVELS, function( level ) {
      self.gameLevelModels.push( new EEGameLevelModel(
        level,
        level < 3 ? AllowedRepresentations.COINS_ONLY : AllowedRepresentations.VARIABLES_ONLY,
        self.soundEnabledProperty
      ) );
    } );

    // @public - score properties for each level
    //REVIEW: visibility, type?
    //REVIEW: Why is this necessary? Just access the gameLevelModels?
    this.levelScoreProperties = []; // @public, read only
    _.times( NUMBER_OF_LEVELS, function( index ) {
      self.levelScoreProperties.push( self.gameLevelModels[ index ].scoreProperty );
    } );
  }

  expressionExchange.register( 'EEGameModel', EEGameModel );

  return inherit( Object, EEGameModel, {

      //REVIEW: doc
      step: function( dt ) {

        // step the currently active level model (if there is one)
        if ( this.currentLevelProperty.get() !== null ) {
          this.gameLevelModels[ this.currentLevelProperty.get() ].step( dt );
        }
      },

      // @public
      //REVIEW: doc, any why is this necessary? currentLevelProperty is public.
      selectLevel: function( levelNumber ) {
        this.currentLevelProperty.set( levelNumber );
      },

      nextLevel: function() {
        this.currentLevelProperty.set( ( this.currentLevelProperty.get() + 1  ) % NUMBER_OF_LEVELS );
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

      // @public
      getAllLevelsCompleted: function() {
        return _.every( this.gameLevelModels, function( gameLevelModel ) { return gameLevelModel.getLevelCompleted(); } );
      },

      clearAllLevelsCompleted: function() {
        this.gameLevelModels.forEach( function( gameLevelModel ) { gameLevelModel.clearLevelCompleted(); } );
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
      NUMBER_OF_LEVELS: NUMBER_OF_LEVELS,
      POINTS_PER_CHALLENGE: POINTS_PER_CHALLENGE
    } );
} );