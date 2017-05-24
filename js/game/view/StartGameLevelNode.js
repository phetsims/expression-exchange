// Copyright 2016, University of Colorado Boulder

/**
 * A node that fills most of the screen and allows the user to select the game level that they wish to play.
 * REVIEW: Lots of duplicated code here with other files of the same name. Should be consolidated into vegas, or
 * simplified in each use case.
 *
 * REVIEW: Created as a 'levelSelectionNode' variable, can we change name to LevelSelectionNode?
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
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var chooseYourLevelString = require( 'string!EXPRESSION_EXCHANGE/chooseYourLevel' );

  // constants
  var CONTROL_BUTTON_TOUCH_AREA_DILATION = 4;

  /**
   * @param {Function} startLevelFunction - Function used to initiate a game level, will be called with a zero-based
   *                                        index value.
   * @param {Function} resetFunction - Function to reset game and scores.
   * @param {Property.<boolean>} soundEnabledProperty
   * @param {Array.<Node>} iconNodes - Set of iconNodes to use on the buttons, sizes should be the same, length of array
   *                                   must match number of levels.
   * @param {Array.<Property.<number>>} scores - Current scores, used to decide which stars to illuminate on the level
   *                                             start buttons, length must match number of levels.
   *                                             REVIEW: added type doc here, but can you verify it's correct?
   * @param {Object} [options] - See code below for options and default values.
   * @constructor
   */
  function StartGameLevelNode( startLevelFunction, resetFunction, soundEnabledProperty, iconNodes, scores, options ) {

    Node.call( this );

    //REVIEW: Options not really ever needed, should just be inlined (there is only one constructor call!)
    options = _.extend( {

      // defaults
      numLevels: 4, // REVIEW: Move actual value (EEGameModel.NUMBER_OF_LEVELS) from EEGameScreenView to here.
      titleString: chooseYourLevelString,
      maxTitleWidth: 500,
      numStarsOnButtons: 5, // REVIEW: Move actual value (EEGameModel.CHALLENGES_PER_LEVEL) from EEGameScreenView to here.
      perfectScore: 10, // REVIEW: Move actual value (EEGameModel.MAX_SCORE_PER_LEVEL) from EEGameScreenView to here.
      buttonBackgroundColor: '#EDA891',
      numButtonRows: 1, // For layout REVIEW: Move actual value (2) from EEGameScreenView to here. Confusing to have two values when only one is ever used
      controlsInset: 12, // REVIEW: move from EEGameScreenView, actual value 10
      size: EESharedConstants.LAYOUT_BOUNDS // REVIEW: Don't specify default here, only usage uses layoutBounds
    }, options );

    // Verify parameters
    //REVIEW: Looks like this should be an assertion instead?
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

    //REVIEW: Using a game Level object should help clean this code up?
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
      //REVIEW: Why is this scale done here, instead of { scale: 0.8 } in the above options? (and 0.8 instead of 0.80)
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
    var resetButton = new ResetAllButton( {
      listener: resetFunction,
      radius: EESharedConstants.RESET_BUTTON_RADIUS,
      touchAreaDilation: 7
    } );
    this.addChild( resetButton );

    // Layout
    //REVIEW: Lots of copy-pasted code from other StartGameLevelNodes? Clean up, use layout boxes if possible
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

  return inherit( Node, StartGameLevelNode );
} );
