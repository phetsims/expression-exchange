// Copyright 2016-2019, University of Colorado Boulder

/**
 * The 'Explore' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import inherit from '../../../phet-core/js/inherit.js';
import EESharedConstants from '../common/EESharedConstants.js';
import AllowedRepresentations from '../common/enum/AllowedRepresentations.js';
import CoinTermCreatorSetID from '../common/enum/CoinTermCreatorSetID.js';
import ExpressionManipulationModel from '../common/model/ExpressionManipulationModel.js';
import ExpressionExplorationScreenView from '../common/view/ExpressionExplorationScreenView.js';
import expressionExchangeStrings from '../expression-exchange-strings.js';
import expressionExchange from '../expressionExchange.js';
import EENegativesIconNode from './view/EENegativesIconNode.js';

const negativesString = expressionExchangeStrings.negatives;

/**
 * @constructor
 */
function EENegativesScreen() {

  const options = {
    name: negativesString,
    backgroundColorProperty: new Property( EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR ),
    homeScreenIcon: new EENegativesIconNode()
  };

  Screen.call(
    this,
    function() {
      return new ExpressionManipulationModel( {
        allowedRepresentations: AllowedRepresentations.VARIABLES_ONLY
      } );
    },
    function( model ) { return new ExpressionExplorationScreenView( model, CoinTermCreatorSetID.VARIABLES ); },
    options
  );
}

expressionExchange.register( 'EENegativesScreen', EENegativesScreen );

inherit( Screen, EENegativesScreen );
export default EENegativesScreen;