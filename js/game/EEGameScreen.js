// Copyright 2016-2022, University of Colorado Boulder

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
import ExpressionExchangeStrings from '../ExpressionExchangeStrings.js';
import EEGameModel from './model/EEGameModel.js';
import EEGameIconNode from './view/EEGameIconNode.js';
import EEGameScreenView from './view/EEGameScreenView.js';

class EEGameScreen extends Screen {

  constructor() {

    const options = {
      name: ExpressionExchangeStrings.gameStringProperty,
      backgroundColorProperty: new Property( EESharedConstants.GAME_SCREEN_BACKGROUND_COLOR ),
      homeScreenIcon: new ScreenIcon( new EEGameIconNode(), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } )
    };

    super(
      () => new EEGameModel(),
      model => new EEGameScreenView( model ),
      options
    );
  }
}

expressionExchange.register( 'EEGameScreen', EEGameScreen );
export default EEGameScreen;