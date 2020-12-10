// Copyright 2015-2020, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import EEBasicsScreen from './basics/EEBasicsScreen.js';
import EEExploreScreen from './explore/EEExploreScreen.js';
import expressionExchangeStrings from './expressionExchangeStrings.js';
import EEGameScreen from './game/EEGameScreen.js';
import EENegativesScreen from './negatives/EENegativesScreen.js';

const expressionExchangeTitleString = expressionExchangeStrings[ 'expression-exchange' ].title;

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
simLauncher.launch( () => {
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