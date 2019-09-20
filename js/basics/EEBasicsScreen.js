// Copyright 2016-2019, University of Colorado Boulder

/**
 * The 'Explore' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const CoinTermCreatorSetID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermCreatorSetID' );
  const EEBasicsIconNode = require( 'EXPRESSION_EXCHANGE/basics/view/EEBasicsIconNode' );
  const EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  const expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  const ExpressionExplorationScreenView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionExplorationScreenView' );
  const ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Property = require( 'AXON/Property' );
  const Screen = require( 'JOIST/Screen' );

  // strings
  const basicsString = require( 'string!EXPRESSION_EXCHANGE/basics' );

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

  return inherit( Screen, EEBasicsScreen );
} );
