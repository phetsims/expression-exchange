// Copyright 2016, University of Colorado Boulder

/**
 * The 'Explore' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ExpressionManipulationView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionManipulationView' );
  var EEBasicsModel = require( 'EXPRESSION_EXCHANGE/basics/model/EEBasicsModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RandomIcon = require( 'EXPRESSION_EXCHANGE/common/view/RandomIcon' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var exploreString = require( 'string!EXPRESSION_EXCHANGE/basics' );

  /**
   * @constructor
   */
  function EEExploreScreen() {

    // TODO: temporary icon, will need to be replaced
    var icon = new RandomIcon();

    Screen.call( this, exploreString, icon,
      function() { return new EEBasicsModel(); },
      function( model ) { return new ExpressionManipulationView( model ); },
      { backgroundColor: '#AFF6CC' }
    );
  }

  return inherit( Screen, EEExploreScreen );
} );