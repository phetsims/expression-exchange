// Copyright 2015-2020, University of Colorado Boulder

/**
 * main model for the 'Explore' screen
 *
 * @author John Blanco
 */

import inherit from '../../../../phet-core/js/inherit.js';
import AllowedRepresentations from '../../common/enum/AllowedRepresentations.js';
import CoinTermCreatorSetID from '../../common/enum/CoinTermCreatorSetID.js';
import ExpressionManipulationModel from '../../common/model/ExpressionManipulationModel.js';
import expressionExchange from '../../expressionExchange.js';

/**
 * @constructor
 */
function EENegativesModel() {

  ExpressionManipulationModel.call( this, {
    coinTermCollection: CoinTermCreatorSetID.VARIABLES,
    allowedRepresentations: AllowedRepresentations.VARIABLES_ONLY
  } );

}

expressionExchange.register( 'EENegativesModel', EENegativesModel );

inherit( ExpressionManipulationModel, EENegativesModel );
export default EENegativesModel;