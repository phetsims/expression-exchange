// Copyright 2016, University of Colorado Boulder

/**
 * main model type for the game
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EEBasicsModel = require( 'EXPRESSION_EXCHANGE/basics/model/EEBasicsModel' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );

  // constants
  var NUMBER_OF_LEVELS = 8;
  var CHALLENGES_PER_LEVEL = 3;
  var POINTS_PER_CHALLENGE = 2;

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
    // other attributes
    //------------------------------------------------------------------------

    // create the game level models, one model per level
    this.gameLevelModels = [];
    _.times( NUMBER_OF_LEVELS, function() {
      self.gameLevelModels.push( new EEBasicsModel() );
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

    //TODO Called by the animation loop. Optional, so if your model has no animation, please delete this.
    step: function( dt ) {
      //TODO Handle model animation here.
    },

    startLevel: function( levelNumber ) {
      this.selectingLevelProperty.set( false );
      this.currentLevelProperty.set( levelNumber );
    },

    returnToLevelSelectState: function(){
      this.selectingLevelProperty.set( true );
    },

    refreshCurrentLevel: function(){
      // TODO: This is stubbed, needs to be implemented.
    },

    reset: function(){
      this.selectingLevelProperty.reset();
    }
  } );
} );