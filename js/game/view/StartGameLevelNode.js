// Copyright 2016, University of Colorado Boulder

/**
 * A node that fills most of the screen and allows the user to select the game level that they wish to play.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LevelSelectionButton = require( 'VEGAS/LevelSelectionButton' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var SoundToggleButton = require( 'SCENERY_PHET/buttons/SoundToggleButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TimerToggleButton = require( 'SCENERY_PHET/buttons/TimerToggleButton' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var chooseYourLevelString = require( 'string!EXPRESSION_EXCHANGE/chooseYourLevel' );

  // constants
  var CONTROL_BUTTON_TOUCH_AREA_DILATION = 4;

  /**
   * @param {Function} startLevelFunction - Function used to initiate a game
   * level, will be called with a zero-based index value.
   * @param {Function} resetFunction - Function to reset game and scores.
   * @param {Property} soundEnabledProperty
   * @param {Array} iconNodes - Set of iconNodes to use on the buttons, sizes
   * should be the same, length of array must match number of levels.
   * @param {Array} scores - Current scores, used to decide which stars to
   * illuminate on the level start buttons, length must match number of levels.
   * @param {Object} [options] - See code below for options and default values.
   * @constructor
   */
  function StartGameLevelNode( startLevelFunction, resetFunction, soundEnabledProperty, iconNodes, scores, options ) {

    Node.call( this );

    options = _.extend( {
      // Defaults
      numLevels: 4,
      titleString: chooseYourLevelString,
      maxTitleWidth: 500,
      numStarsOnButtons: 5,
      perfectScore: 10,
      buttonBackgroundColor: '#e9967a',
      numButtonRows: 1, // For layout
      controlsInset: 12,
      size: EESharedConstants.LAYOUT_BOUNDS
    }, options );

    // Verify parameters
    if ( iconNodes.length !== options.numLevels || scores.length !== options.numLevels ) {
      throw new Error( 'Number of game levels doesn\'t match length of provided arrays' );
    }

    // Title
    var title = new Text( options.titleString, { font: new PhetFont( 30 ), maxWidth: options.maxTitleWidth } );
    this.addChild( title );

    // Add the buttons
    function createLevelStartFunction( level ) {
      return function() { startLevelFunction( level ); };
    }

    var buttons = new Array( options.numLevels );
    for ( var i = 0; i < options.numLevels; i++ ) {
      buttons[ i ] = new LevelSelectionButton(
        iconNodes[ i ],
        options.numStarsOnButtons,
        createLevelStartFunction( i ),
        scores[ i ],
        options.perfectScore,
        {
          baseColor: options.buttonBackgroundColor
        }
      );
      buttons[ i ].scale( 0.80 );
      this.addChild( buttons[ i ] );
    }

    // sound on/off button
    var soundToggleButton = new SoundToggleButton( soundEnabledProperty, {
      touchAreaXDilation: CONTROL_BUTTON_TOUCH_AREA_DILATION,
      touchAreaYDilation: CONTROL_BUTTON_TOUCH_AREA_DILATION
    } );
    this.addChild( soundToggleButton );

    // Reset button.
    var resetButton = new ResetAllButton( { listener: resetFunction, radius: 22, touchAreaDilation: 7 } );
    this.addChild( resetButton );

    // Layout
    var numColumns = options.numLevels / options.numButtonRows;
    var buttonSpacingX = buttons[ 0 ].width * 1.2; // Note: Assumes all buttons are the same size.
    var buttonSpacingY = buttons[ 0 ].height * 1.2;  // Note: Assumes all buttons are the same size.
    var firstButtonOrigin = new Vector2( options.size.width / 2 - ( numColumns - 1 ) * buttonSpacingX / 2,
      options.size.height * 0.5 - ( ( options.numButtonRows - 1 ) * buttonSpacingY ) / 2 );
    for ( var row = 0; row < options.numButtonRows; row++ ) {
      for ( var col = 0; col < numColumns; col++ ) {
        var buttonIndex = row * numColumns + col;
        buttons[ buttonIndex ].centerX = firstButtonOrigin.x + col * buttonSpacingX;
        buttons[ buttonIndex ].centerY = firstButtonOrigin.y + row * buttonSpacingY;
      }
    }
    resetButton.right = options.size.width - options.controlsInset;
    resetButton.bottom = options.size.height - options.controlsInset;
    title.centerX = options.size.width / 2;
    title.centerY = buttons[ 0 ].top / 2;
    soundToggleButton.left = options.controlsInset;
    soundToggleButton.bottom = options.size.height - options.controlsInset;
  }

  expressionExchange.register( 'StartGameLevelNode', StartGameLevelNode );

  // Inherit from Node.
  return inherit( Node, StartGameLevelNode );
} );
