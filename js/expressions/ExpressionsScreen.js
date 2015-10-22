// Copyright 2002-2015, University of Colorado Boulder

/**
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ExpressionsModel = require( 'EXPRESSIONS/expressions/model/ExpressionsModel' );
  var ExpressionsScreenView = require( 'EXPRESSIONS/expressions/view/ExpressionsScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var expressionsSimString = require( 'string!EXPRESSIONS/expressions.title' );

  /**
   * @constructor
   */
  function ExpressionsScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = null;

    Screen.call( this, expressionsSimString, icon,
      function() { return new ExpressionsModel(); },
      function( model ) { return new ExpressionsScreenView( model ); },
      { backgroundColor: 'white' }
    );
  }

  return inherit( Screen, ExpressionsScreen );
} );