// Copyright 2015-2026, University of Colorado Boulder

/**
 * main model for the 'Explore' screen
 *
 * @author John Blanco
 */

import AllowedRepresentations from '../../common/enum/AllowedRepresentations.js';
import CoinTermCreatorSetID from '../../common/enum/CoinTermCreatorSetID.js';
import ExpressionManipulationModel from '../../common/model/ExpressionManipulationModel.js';

class EENegativesModel extends ExpressionManipulationModel {

  /**
   */
  constructor() {

    super( {
      coinTermCollection: CoinTermCreatorSetID.VARIABLES,
      allowedRepresentations: AllowedRepresentations.VARIABLES_ONLY
    } );

  }
}

export default EENegativesModel;
