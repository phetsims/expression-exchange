// Copyright 2016-2022, University of Colorado Boulder

/**
 * This type represents a Scenery node that represents a hint that is presented to the user when two coins can be
 * combined into an expression.  The hint looks like a rectangle with a rip in the middle, and the coins are enclosed
 * on either side of the rip.
 *
 * @author John Blanco
 */

import Multilink from '../../../../axon/js/Multilink.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import expressionExchange from '../../expressionExchange.js';
import EESharedConstants from '../EESharedConstants.js';

// constants
const HINT_BACKGROUND_COLOR = EESharedConstants.EXPRESSION_BACKGROUND_COLOR;
const INSET = 10; // in screen coordinates
const NUM_ZIG_ZAGS = 5;
const ZIG_ZAG_AMPLITUDE = 2;

class ExpressionHintNode extends Node {

  /**
   * @param {ExpressionHint} expressionHint - model of an expression hint
   */
  constructor( expressionHint ) {
    super( { pickable: false } );

    const boundsUpdateMultilink = Multilink.multilink(
      [
        expressionHint.anchorCoinTerm.localViewBoundsProperty,
        expressionHint.movingCoinTerm.localViewBoundsProperty
      ],
      () => {

        // convenience vars
        const anchorCTBounds = expressionHint.anchorCoinTerm.localViewBoundsProperty.get();
        const movingCTBounds = expressionHint.movingCoinTerm.localViewBoundsProperty.get();

        // clear out any previous hint
        this.removeAllChildren();

        // the hint can be on the left or right side of the 'anchor coin', depending upon where the moving coin term is
        const anchorCoinTermOnLeft = expressionHint.movingCoinTerm.positionProperty.get().x >
                                     expressionHint.anchorCoinTerm.positionProperty.get().x;

        // calculate size and position for each half of the hint
        const height = Math.max( anchorCTBounds.height, movingCTBounds.height ) + 2 * INSET;
        const top = expressionHint.anchorCoinTerm.positionProperty.get().y - height / 2;
        let leftHalfWidth;
        let rightHalfWidth;
        let leftHalfCenterX;
        if ( anchorCoinTermOnLeft ) {
          leftHalfWidth = anchorCTBounds.width + 2 * INSET;
          rightHalfWidth = movingCTBounds.width + 2 * INSET;
          leftHalfCenterX = expressionHint.anchorCoinTerm.positionProperty.get().x + anchorCTBounds.centerX;
        }
        else { // anchor coin term is on the right
          leftHalfWidth = movingCTBounds.width + 2 * INSET;
          rightHalfWidth = anchorCTBounds.width + 2 * INSET;
          leftHalfCenterX = expressionHint.anchorCoinTerm.positionProperty.get().x + anchorCTBounds.centerX
                            - anchorCTBounds.width / 2 - INSET - movingCTBounds.width / 2 - INSET;
        }

        // draw rectangle on three sides with zig-zag line on remaining side
        const leftHalfShape = new Shape()
          .moveTo( leftHalfWidth, 0 )
          .lineTo( 0, 0 )
          .lineTo( 0, height )
          .lineTo( leftHalfWidth, height );
        leftHalfShape.zigZagTo( leftHalfWidth, 0, ZIG_ZAG_AMPLITUDE, NUM_ZIG_ZAGS, false );
        leftHalfShape.close();

        const leftHalf = new Path( leftHalfShape, {
          fill: HINT_BACKGROUND_COLOR,
          centerX: leftHalfCenterX,
          top: top
        } );
        this.addChild( leftHalf );

        // draw rectangle on three sides with zig-zag line on remaining side
        const rightHalfShape = new Shape()
          .moveTo( 0, 0 )
          .lineTo( rightHalfWidth, 0 )
          .lineTo( rightHalfWidth, height )
          .lineTo( 0, height );
        rightHalfShape.zigZagTo( 0, 0, ZIG_ZAG_AMPLITUDE, NUM_ZIG_ZAGS, false );
        rightHalfShape.close();

        this.addChild( new Path( rightHalfShape, {
          fill: HINT_BACKGROUND_COLOR,
          left: leftHalf.right,
          top: top
        } ) );
      } );

    // define dispose function
    this.expressionHintNodeDispose = () => {
      boundsUpdateMultilink.dispose();
    };
  }

  // @public
  dispose() {
    this.expressionHintNodeDispose();
    super.dispose();
  }
}

expressionExchange.register( 'ExpressionHintNode', ExpressionHintNode );

export default ExpressionHintNode;