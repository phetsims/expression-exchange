// Copyright 2016, University of Colorado Boulder

/**
 * main model type for the game
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );

  /**
   * @constructor
   */
  function EEGameModel() {

    var self = this;

    //------------------------------------------------------------------------
    // properties
    //------------------------------------------------------------------------

    this.soundEnabledProperty = new Property( true );
    this.timerEnabledProperty = new Property( true );
    this.selectingLevelProperty = new Property( true );

    //------------------------------------------------------------------------
    // other attributes
    //------------------------------------------------------------------------

    this.numberOfLevels = 8; // @public TODO: shouldn't this be a constant?
    this.bestScoreProperties = [];
    _.times( this.numberOfLevels, function() {
      self.bestScoreProperties.push( new Property( 0 ) );
    } );
    self.bestTimes = []; // @public
    _.times( this.numberOfLevels, function() {
      self.bestTimes.push( null );
    } );
    this.challengesPerSet = 6; // @public TODO: shouldn't this be a constant?
    this.maxPointsPerChallenge = 2; // @public TODO: shouldn't this be a constant?
    this.maxPossibleScore = this.challengesPerSet * this.maxPointsPerChallenge; // @public  TODO: shouldn't this be a constant?
  }

  expressionExchange.register( 'EEGameModel', EEGameModel );

  return inherit( Object, EEGameModel, {

    //TODO Called by the animation loop. Optional, so if your model has no animation, please delete this.
    step: function( dt ) {
      //TODO Handle model animation here.
    },

    startLevel: function() {
      this.selectingLevelProperty.set( false );
    },

    returnToLevelSelectState: function(){
      this.selectingLevelProperty.set( true );
    },

    reset: function(){
      this.selectingLevelProperty.reset();
    }
  } );
} );