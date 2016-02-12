// Copyright 2015, University of Colorado Boulder

/**
 * The 'Explore' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EEExploreScreenView = require( 'EXPRESSION_EXCHANGE/explore/view/EEExploreScreenView' );
  var EEExploreModel = require( 'EXPRESSION_EXCHANGE/explore/model/EEExploreModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var exploreString = require( 'string!EXPRESSION_EXCHANGE/explore' );

  /**
   * @constructor
   */
  function EEExploreScreen() {

    // TODO: temporary icon, will need to be replaced
    var icon = new Rectangle( 0, 0, 548, 373, 0, 0, { fill: 'green' } );

    Screen.call( this, exploreString, icon,
      function() { return new EEExploreModel(); },
      function( model ) { return new EEExploreScreenView( model ); },
      { backgroundColor: '#AFF6CC' }
    );
  }

  return inherit( Screen, EEExploreScreen );
} );