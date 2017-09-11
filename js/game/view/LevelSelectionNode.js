// Copyright 2016, University of Colorado Boulder

/**
 * A node that fills most of the screen and allows the user to select the game level that they wish to play.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EEGameModel = require( 'EXPRESSION_EXCHANGE/game/model/EEGameModel' );
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LevelSelectionItemNode = require( 'VEGAS/LevelSelectionItemNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
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
   * index value.
   * @param {Function} resetFunction - Function to reset game and scores.
   * @param {Property.<boolean>} soundEnabledProperty
   * @param {Array.<Node>} iconNodes - Set of iconNodes to use on the buttons, sizes should be the same, length of array
   * must match number of levels.
   * @param {Array.<Property.<number>>} scores - Current scores, used to decide which stars to illuminate on the level
   * start buttons, length must match number of levels.
   * @param {Object} [options] - See code below for options and default values.
   * @constructor
   */
  function LevelSelectionNode( startLevelFunction, resetFunction, soundEnabledProperty, iconNodes, scores, options ) {

    Node.call( this );

    options = _.extend( {

      // defaults
      numLevels: EEGameModel.NUMBER_OF_LEVELS,
      titleString: chooseYourLevelString,
      maxTitleWidth: 500,
      numStarsOnButtons: EEGameModel.CHALLENGES_PER_LEVEL,
      perfectScore: EEGameModel.MAX_SCORE_PER_LEVEL,
      buttonBackgroundColor: '#EDA891',
      numButtonRows: 2,
      controlsInset: 10,
      layoutBoundsProperty: new Property( EESharedConstants.LAYOUT_BOUNDS ),
      buttonScale: 0.8
    }, options );

    // Verify parameters
    assert && assert(
      iconNodes.length === options.numLevels && scores.length === options.numLevels,
      'Number of game levels doesn\'t match length of provided arrays'
    );

    // title
    var title = new Text( options.titleString, { font: new PhetFont( 30 ), maxWidth: options.maxTitleWidth } );
    this.addChild( title );

    // add the buttons
    function createLevelStartFunction( level ) {
      return function() { startLevelFunction( level ); };
    }

    var buttons = new Array( options.numLevels );
    for ( var i = 0; i < options.numLevels; i++ ) {
      buttons[ i ] = new LevelSelectionItemNode(
        iconNodes[ i ],
        options.numStarsOnButtons,
        createLevelStartFunction( i ),
        scores[ i ],
        options.perfectScore,
        {
          baseColor: options.buttonBackgroundColor,
          scale: options.buttonScale
        }
      );
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
      radius: EESharedConstants.RESET_ALL_BUTTON_RADIUS,
      touchAreaDilation: EESharedConstants.RESET_ALL_BUTTON_TOUCH_AREA_DILATION
    } );
    this.addChild( resetButton );

    // Layout
    var numColumns = options.numLevels / options.numButtonRows;
    var buttonSpacingX = buttons[ 0 ].width * 1.2; // Note: Assumes all buttons are the same size.
    var buttonSpacingY = buttons[ 0 ].height * 1.2;  // Note: Assumes all buttons are the same size.
    var initialLayoutBounds = options.layoutBoundsProperty.get();
    var firstButtonOrigin = new Vector2( initialLayoutBounds.width / 2 - ( numColumns - 1 ) * buttonSpacingX / 2,
      initialLayoutBounds.height * 0.5 - ( ( options.numButtonRows - 1 ) * buttonSpacingY ) / 2 );
    for ( var row = 0; row < options.numButtonRows; row++ ) {
      for ( var col = 0; col < numColumns; col++ ) {
        var buttonIndex = row * numColumns + col;
        buttons[ buttonIndex ].centerX = firstButtonOrigin.x + col * buttonSpacingX;
        buttons[ buttonIndex ].centerY = firstButtonOrigin.y + row * buttonSpacingY;
      }
    }
    title.centerX = initialLayoutBounds.width / 2;
    title.centerY = buttons[ 0 ].top / 2;

    resetButton.bottom = initialLayoutBounds.height - options.controlsInset;
    soundToggleButton.bottom = initialLayoutBounds.height - options.controlsInset;

    // have the reset and volume buttons have floating X positions
    options.layoutBoundsProperty.link( function( layoutBounds ) {
      resetButton.right = layoutBounds.maxX - options.controlsInset;
      soundToggleButton.left = layoutBounds.minX + options.controlsInset;
    } );
  }

  expressionExchange.register( 'LevelSelectionNode', LevelSelectionNode );

  return inherit( Node, LevelSelectionNode );
} );
