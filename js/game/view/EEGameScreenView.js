// Copyright 2016, University of Colorado Boulder

/**
 * main view for the 'Game' screen
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Text = require( 'SCENERY/nodes/Text' );

  /**
   * @param {EEGameModel} gameModel
   * @constructor
   */
  function EEGameScreenView( gameModel ) {

    ScreenView.call( this );

    this.addChild( new Text( 'Game coming soon', {
      font: new PhetFont( { size: 60 } ),
      fill: 'rgba( 0, 0, 0, 0.5 )',
      centerX: this.layoutBounds.centerX,
      centerY: this.layoutBounds.height * 0.3
    } ) );

    // Reset All button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        gameModel.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );
    this.addChild( resetAllButton );
  }

  return inherit( ScreenView, EEGameScreenView, {

    //TODO Called by the animation loop. Optional, so if your view has no animation, please delete this.
    step: function( dt ) {
      //TODO Handle view animation here.
    }
  } );
} );