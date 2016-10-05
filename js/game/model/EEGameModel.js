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
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @constructor
   */
  function EEGameModel() {

    var self = this;

    PropertySet.call( this, {
      soundEnabled: true,
      timerEnabled: false
    } );

    this.numberOfLevels = 8; // @public
    self.bestTimes = []; // @public
    this.bestScoreProperties = []; // @public
    _.times( this.numberOfLevels, function() {
      self.bestTimes.push( null );
      self.bestScoreProperties.push( new Property( 0 ) );
    } );
    this.challengesPerSet = 6; // @public
    this.maxPointsPerChallenge = 2; // @public
    this.maxPossibleScore = this.challengesPerSet * this.maxPointsPerChallenge; // @public
  }

  expressionExchange.register( 'EEGameModel', EEGameModel );

  return inherit( PropertySet, EEGameModel, {

    //TODO Called by the animation loop. Optional, so if your model has no animation, please delete this.
    step: function( dt ) {
      //TODO Handle model animation here.
    },

    startLevel: function(){
      // TODO: This is stubbed.
    }
  } );
} );