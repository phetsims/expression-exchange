// Copyright 2015, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EEBasicsScreen = require( 'EXPRESSION_EXCHANGE/basics/EEBasicsScreen' );
  var EEExploreScreen = require( 'EXPRESSION_EXCHANGE/explore/EEExploreScreen' );
  var EEGameScreen = require( 'EXPRESSION_EXCHANGE/game/EEGameScreen' );
  var EENegativesScreen = require( 'EXPRESSION_EXCHANGE/negatives/EENegativesScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var expressionExchangeTitleString = require( 'string!EXPRESSION_EXCHANGE/expression-exchange.title' );

  // credits
  var simOptions = {
    credits: {
      leadDesign: 'Amanda McGarry',
      softwareDevelopment: 'John Blanco',
      graphicArts: 'Mariah Hermsmeyer',
      team: 'Ariel Paul, Kathy Perkins, David Webb',
      qualityAssurance: 'Steele Dalton, Alex Dornan, Ethan Johnson'
    }
  };

  // launch the sim
  SimLauncher.launch( function() {
    var sim = new Sim(
      expressionExchangeTitleString,
      [
        new EEBasicsScreen(),
        new EEExploreScreen(),
        new EENegativesScreen(),
        new EEGameScreen()
      ],
      simOptions );
    sim.start();
  } );
} );
