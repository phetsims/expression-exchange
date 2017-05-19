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
  var EEQueryParameters = require( 'EXPRESSION_EXCHANGE/common/EEQueryParameters' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var expressionExchangeTitleString = require( 'string!EXPRESSION_EXCHANGE/expression-exchange.title' );

  // credits
  var simOptions = {
    credits: {
      leadDesign: 'Amanda McGarry',
      softwareDevelopment: 'John Blanco',
      team: 'Amanda McGarry, Ariel Paul, Kathy Perkins',
      qualityAssurance: 'Steele Dalton, Elise Morgan, Oliver Nix, Oliver Orejola, Bryan Yoelin'
    }
  };

  //REVIEW: For logging, ideally we'd want to enable it ASAP before all of the startup code executes?
  //REVIEW: Chicken-and-egg issue with putting this code in the namespace, since EEQueryParameters relies on the namespace?
  // add support for logging
  if ( EEQueryParameters.enableLogging ) {
    console.log( 'enabling log' );
    expressionExchange.log = function( message ) {
      console.log( '%clog: ' + message, 'color: #009900' ); // green
    };
  }

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