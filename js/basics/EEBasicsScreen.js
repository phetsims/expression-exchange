// Copyright 2016-2020, University of Colorado Boulder

/**
 * The 'Explore' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import inherit from '../../../phet-core/js/inherit.js';
import EESharedConstants from '../common/EESharedConstants.js';
import CoinTermCreatorSetID from '../common/enum/CoinTermCreatorSetID.js';
import ExpressionManipulationModel from '../common/model/ExpressionManipulationModel.js';
import ExpressionExplorationScreenView from '../common/view/ExpressionExplorationScreenView.js';
import expressionExchangeStrings from '../expressionExchangeStrings.js';
import expressionExchange from '../expressionExchange.js';
import EEBasicsIconNode from './view/EEBasicsIconNode.js';

const basicsString = expressionExchangeStrings.basics;

/**
 * @constructor
 */
function EEBasicsScreen() {

  const options = {
    name: basicsString,
    backgroundColorProperty: new Property( EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR ),
    homeScreenIcon: new EEBasicsIconNode()
  };

  Screen.call( this,
    function() { return new ExpressionManipulationModel(); },
    function( model ) { return new ExpressionExplorationScreenView( model, CoinTermCreatorSetID.BASICS ); },
    options
  );
}

expressionExchange.register( 'EEBasicsScreen', EEBasicsScreen );

inherit( Screen, EEBasicsScreen );
export default EEBasicsScreen;