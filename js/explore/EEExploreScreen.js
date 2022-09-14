// Copyright 2016-2022, University of Colorado Boulder

/**
 * The 'Explore' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import EESharedConstants from '../common/EESharedConstants.js';
import CoinTermCreatorSetID from '../common/enum/CoinTermCreatorSetID.js';
import ExpressionManipulationModel from '../common/model/ExpressionManipulationModel.js';
import ExpressionExplorationScreenView from '../common/view/ExpressionExplorationScreenView.js';
import expressionExchange from '../expressionExchange.js';
import ExpressionExchangeStrings from '../ExpressionExchangeStrings.js';
import EEExploreIconNode from './view/EEExploreIconNode.js';

class EEExploreScreen extends Screen {

  constructor() {

    const options = {
      name: ExpressionExchangeStrings.exploreStringProperty,
      backgroundColorProperty: new Property( EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR ),
      homeScreenIcon: new ScreenIcon( new EEExploreIconNode(), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } )
    };

    super(
      () => new ExpressionManipulationModel(),
      model => new ExpressionExplorationScreenView( model, CoinTermCreatorSetID.EXPLORE ),
      options
    );
  }
}

expressionExchange.register( 'EEExploreScreen', EEExploreScreen );
export default EEExploreScreen;