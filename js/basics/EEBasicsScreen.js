// Copyright 2016, University of Colorado Boulder

/**
 * The 'Explore' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTermCreatorSetID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermCreatorSetID' );
  var EEBasicsIconNode = require( 'EXPRESSION_EXCHANGE/basics/view/EEBasicsIconNode' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionExplorationScreenView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionExplorationScreenView' );
  var ExpressionManipulationModel = require( 'EXPRESSION_EXCHANGE/common/model/ExpressionManipulationModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Property = require( 'AXON/Property' );
  var Color = require( 'SCENERY/util/Color' );

  // strings
  var basicsString = require( 'string!EXPRESSION_EXCHANGE/basics' );

  /**
   * @constructor
   */
  function EEBasicsScreen() {

    var options = {
      name: basicsString,
      backgroundColorProperty: new Property( Color.toColor( EESharedConstants.NON_GAME_SCREENS_BACKGROUND_COLOR ) ),
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