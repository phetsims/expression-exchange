// Copyright 2015-2019, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const EEBasicsScreen = require( 'EXPRESSION_EXCHANGE/basics/EEBasicsScreen' );
  const EEExploreScreen = require( 'EXPRESSION_EXCHANGE/explore/EEExploreScreen' );
  const EEGameScreen = require( 'EXPRESSION_EXCHANGE/game/EEGameScreen' );
  const EENegativesScreen = require( 'EXPRESSION_EXCHANGE/negatives/EENegativesScreen' );
  const Sim = require( 'JOIST/Sim' );
  const SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  const expressionExchangeTitleString = require( 'string!EXPRESSION_EXCHANGE/expression-exchange.title' );

  // credits
  const simOptions = {
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
    const sim = new Sim(
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
