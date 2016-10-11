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
    this.soundEnabledProperty = new Property( true );

    // @public - an array of properties, each one of which is the best score for a level
    this.bestScoreProperties = [];
    _.times( this.numberOfLevels, function() {
      self.bestScoreProperties.push( new Property( 0 ) );
    } );

    //------------------------------------------------------------------------
    // other attributes
    //------------------------------------------------------------------------

    this.numberOfLevels = 8; // @public
    self.bestTimes = []; // @public
    _.times( this.numberOfLevels, function() {
      self.bestTimes.push( null );
    } );
    this.challengesPerSet = 6; // @public
    this.maxPointsPerChallenge = 2; // @public
    this.maxPossibleScore = this.challengesPerSet * this.maxPointsPerChallenge; // @public
  }

  expressionExchange.register( 'EEGameModel', EEGameModel );

  return inherit( Object, EEGameModel, {

    //TODO Called by the animation loop. Optional, so if your model has no animation, please delete this.
    step: function( dt ) {
      //TODO Handle model animation here.
    },

    startLevel: function() {
      // TODO: This is stubbed.
    }
  } );
} );