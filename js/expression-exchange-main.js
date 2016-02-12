// Copyright 2015, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EEExploreScreen = require( 'EXPRESSION_EXCHANGE/explore/EEExploreScreen' );
  var EEGameScreen = require( 'EXPRESSION_EXCHANGE/game/EEGameScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var expressionExchangeTitleString = require( 'string!EXPRESSION_EXCHANGE/expression-exchange.title' );

  var simOptions = {
    credits: {
      leadDesign: 'Amanda McGarry',
      softwareDevelopment: 'John Blanco',
      team: 'Amanda McGarry, Ariel Paul, Kathy Perkins',
      qualityAssurance: 'Steele Dalton, Elise Morgan, Oliver Nix, Oliver Orejola, Bryan Yoelin'
    }
  };

  SimLauncher.launch( function() {
    var sim = new Sim(
      expressionExchangeTitleString,
      [
        new EEExploreScreen(),
        new EEGameScreen()
      ],
      simOptions );
    sim.start();
  } );
} );