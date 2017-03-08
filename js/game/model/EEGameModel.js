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

    // @public
    this.soundEnabledProperty = new Property( true );
    this.timerEnabledProperty = new Property( true );
    this.selectingLevelProperty = new Property( true );
    this.currentLevelProperty = new Property( -1 ); // currently selected level, 0 indexed, -1 indicates none

    //------------------------------------------------------------------------
    // other initialization
    //------------------------------------------------------------------------

    // shuffle the challenge descriptors before creating the levels
    // TODO: Uncomment the line below when we want to start actually shuffling the challenges
    //EEChallengeDescriptors.shuffleChallenges();

    // create the game level models, one model per level
    this.gameLevelModels = [];
    _.times( NUMBER_OF_LEVELS, function( level ) {
      self.gameLevelModels.push( new EEGameLevelModel(
        level,
        level < 3 ? AllowedRepresentationsEnum.COINS_ONLY : AllowedRepresentationsEnum.VARIABLES_ONLY,
        self.soundEnabledProperty
      ) );
    } );

    // TODO: The next several lines will need to be modded based on answers to outstanding questions about game flow and behavior.
    this.numberOfLevels = NUMBER_OF_LEVELS; // @public, read only
    this.bestScoreProperties = []; // @public, read only
    _.times( this.numberOfLevels, function() {
      self.bestScoreProperties.push( new Property( 0 ) );
    } );
    self.bestTimes = []; // @public, read only
    _.times( this.numberOfLevels, function() {
      self.bestTimes.push( null );
    } );

    // TODO: Make these static constants?
    this.maxPointsPerChallenge = POINTS_PER_CHALLENGE; // @public, read only
    this.maxPossibleScore = NUMBER_OF_LEVELS * CHALLENGES_PER_LEVEL * POINTS_PER_CHALLENGE; // @public, read only
  }

  expressionExchange.register( 'EEGameModel', EEGameModel );

  return inherit( Object, EEGameModel, {

      step: function( dt ) {
        if ( this.currentLevelProperty.get() >= 0 ) {
          this.gameLevelModels[ this.currentLevelProperty.get() ].step( dt );
        }
      },

      // @public
      startLevel: function( levelNumber ) {
        this.selectingLevelProperty.set( false );
        this.currentLevelProperty.set( levelNumber );
      },

      // @public
      setLevelModelBounds: function( bounds ) {
        this.gameLevelModels.forEach( function( gameLevelModel ) {
          gameLevelModel.setCoinTermRetrievalBounds( bounds );
        } );
      },

      returnToLevelSelectState: function() {
        this.selectingLevelProperty.set( true );
      },

      refreshCurrentLevel: function() {
        this.gameLevelModels[ this.currentLevelProperty.get() ].refresh();
      },

      reset: function() {
        this.selectingLevelProperty.reset();
      }
    },
    {
      // statics
      MAX_SCORE_PER_LEVEL: MAX_SCORE_PER_LEVEL
    } );
} );