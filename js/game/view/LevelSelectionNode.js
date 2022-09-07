// Copyright 2016-2022, University of Colorado Boulder

/**
 * A node that fills most of the screen and allows the user to select the game level that they wish to play.
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import LevelSelectionButton from '../../../../vegas/js/LevelSelectionButton.js';
import ScoreDisplayStars from '../../../../vegas/js/ScoreDisplayStars.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import EESharedConstants from '../../common/EESharedConstants.js';
import expressionExchange from '../../expressionExchange.js';
import EEGameModel from '../model/EEGameModel.js';

const chooseYourLevelString = VegasStrings.chooseYourLevel;

class LevelSelectionNode extends Node {

  /**
   * @param {Function} startLevelFunction - Function used to initiate a game level, will be called with a zero-based
   * index value.
   * @param {Function} resetFunction - Function to reset game and scores.
   * @param {Array.<Node>} iconNodes - Set of iconNodes to use on the buttons, sizes should be the same, length of array
   * must match number of levels.
   * @param {Array.<Property.<number>>} scores - Current scores, used to decide which stars to illuminate on the level
   * start buttons, length must match number of levels.
   * @param {Object} [options] - See code below for options and default values.
   */
  constructor( startLevelFunction, resetFunction, iconNodes, scores, options ) {

    super();

    options = merge( {

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
    const title = new Text( options.titleString, { font: new PhetFont( 30 ), maxWidth: options.maxTitleWidth } );
    this.addChild( title );

    // add the buttons
    function createLevelStartFunction( level ) {
      return () => { startLevelFunction( level ); };
    }

    const buttons = new Array( options.numLevels );
    for ( let i = 0; i < options.numLevels; i++ ) {
      buttons[ i ] = new LevelSelectionButton(
        iconNodes[ i ],
        scores[ i ],
        {
          listener: createLevelStartFunction( i ),
          baseColor: options.buttonBackgroundColor,
          createScoreDisplay: scoreProperty => new ScoreDisplayStars( scoreProperty, {
            numberOfStars: options.numStarsOnButtons,
            perfectScore: options.perfectScore,
            scale: options.buttonScale
          } ),
          soundPlayerIndex: i
        }
      );
      this.addChild( buttons[ i ] );
    }

    // Reset button.
    const resetButton = new ResetAllButton( {
      listener: resetFunction,
      radius: EESharedConstants.RESET_ALL_BUTTON_RADIUS
    } );
    this.addChild( resetButton );

    // Layout
    const numColumns = options.numLevels / options.numButtonRows;
    const buttonSpacingX = buttons[ 0 ].width * 1.2; // Note: Assumes all buttons are the same size.
    const buttonSpacingY = buttons[ 0 ].height * 1.2;  // Note: Assumes all buttons are the same size.
    const initialLayoutBounds = options.layoutBoundsProperty.get();
    const firstButtonOrigin = new Vector2( initialLayoutBounds.width / 2 - ( numColumns - 1 ) * buttonSpacingX / 2,
      initialLayoutBounds.height * 0.5 - ( ( options.numButtonRows - 1 ) * buttonSpacingY ) / 2 );
    for ( let row = 0; row < options.numButtonRows; row++ ) {
      for ( let col = 0; col < numColumns; col++ ) {
        const buttonIndex = row * numColumns + col;
        buttons[ buttonIndex ].centerX = firstButtonOrigin.x + col * buttonSpacingX;
        buttons[ buttonIndex ].centerY = firstButtonOrigin.y + row * buttonSpacingY;
      }
    }
    title.centerX = initialLayoutBounds.width / 2;
    title.centerY = buttons[ 0 ].top / 2;

    resetButton.bottom = initialLayoutBounds.height - options.controlsInset;

    // have the reset button have a floating X position
    options.layoutBoundsProperty.link( layoutBounds => {
      resetButton.right = layoutBounds.maxX - options.controlsInset;
    } );
  }
}

expressionExchange.register( 'LevelSelectionNode', LevelSelectionNode );

export default LevelSelectionNode;