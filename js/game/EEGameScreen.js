// Copyright 2016-2020, University of Colorado Boulder

/**
 * The 'Game' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import EESharedConstants from '../common/EESharedConstants.js';
import expressionExchange from '../expressionExchange.js';
import expressionExchangeStrings from '../expressionExchangeStrings.js';
import EEGameModel from './model/EEGameModel.js';
import EEGameIconNode from './view/EEGameIconNode.js';
import EEGameScreenView from './view/EEGameScreenView.js';

class EEGameScreen extends Screen {
  constructor() {

    const options = {
      name: expressionExchangeStrings.game,
      backgroundColorProperty: new Property( EESharedConstants.GAME_SCREEN_BACKGROUND_COLOR ),
      homeScreenIcon: new ScreenIcon( new EEGameIconNode(), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } )
    };

    super(
      function() { return new EEGameModel(); },
      function( model ) { return new EEGameScreenView( model ); },
      options
    );
  }
}

expressionExchange.register( 'EEGameScreen', EEGameScreen );
export default EEGameScreen;