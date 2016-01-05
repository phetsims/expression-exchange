// Copyright 2015, University of Colorado Boulder

/**
 * The 'Explore' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ExpressionExchangeExploreScreenView = require( 'EXPRESSION_EXCHANGE/explore/view/ExpressionExchangeExploreScreenView' );
  var ExpressionExchangeExploreModel = require( 'EXPRESSION_EXCHANGE/explore/model/ExpressionExchangeExploreModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var exploreString = require( 'string!EXPRESSION_EXCHANGE/explore' );

  /**
   * @constructor
   */
  function ExpressionExchangeExploreScreen() {

    // TODO: temporary icon, will need to be replaced
    var icon = new Rectangle( 0, 0, 548, 373, 0, 0, { fill: 'green' } );

    Screen.call( this, exploreString, icon,
      function() { return new ExpressionExchangeExploreModel(); },
      function( model ) { return new ExpressionExchangeExploreScreenView( model ); },
      { backgroundColor: '#AFF6CC' }
    );
  }

  return inherit( Screen, ExpressionExchangeExploreScreen );
} );