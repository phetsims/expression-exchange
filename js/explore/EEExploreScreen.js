// Copyright 2015, University of Colorado Boulder

/**
 * The 'Explore' screen in the Expression Exchange simulation. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var ExpressionManipulationView = require( 'EXPRESSION_EXCHANGE/common/view/ExpressionManipulationView' );
  var EEExploreModel = require( 'EXPRESSION_EXCHANGE/explore/model/EEExploreModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RandomIcon = require( 'EXPRESSION_EXCHANGE/common/view/RandomIcon' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var exploreString = require( 'string!EXPRESSION_EXCHANGE/explore' );

  /**
   * @constructor
   */
  function EEExploreScreen() {

    // TODO: temporary icon, will need to be replaced
    var icon = new RandomIcon();

    Screen.call(
      this,
      exploreString,
      icon,
      function() { return new EEExploreModel(); },
      function( model ) {
        return new ExpressionManipulationView( model, {

            // spacing need to be large to accommodate worst case expression length
            carouselSpacing: 60
          }
        );
      },
      { backgroundColor: '#AFF6CC' }
    );
  }

  expressionExchange.register( 'EEExploreScreen', EEExploreScreen );

  return inherit( Screen, EEExploreScreen );
} );