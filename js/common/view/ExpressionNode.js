// Copyright 2016-2022, University of Colorado Boulder

/**
 * This type represents an expression in the view, which basically looks like a rectangle with two or more coin terms
 * in it and plus signs between them.
 *
 * Note that this works in conjunction with ExpressionOverlayNode to implement the view-oriented behaviors of the
 * expressions so, if you don't find what you're looking for here, you may want to check that type.
 *
 * @author John Blanco
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import { Shape } from '../../../../kite/js/imports.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Text } from '../../../../scenery/js/imports.js';
import expressionExchange from '../../expressionExchange.js';
import EESharedConstants from '../EESharedConstants.js';

// constants
const BACKGROUND_COLOR = EESharedConstants.EXPRESSION_BACKGROUND_COLOR;
const NUM_ZIG_ZAGS = 5;
const ZIG_ZAG_AMPLITUDE = 2; // in screen coordinates, empirically determined
const HINT_OFFSET = 3; // in screen coordinates, empirically determined
const LEFT_HINT_TRANSLATION = Matrix3.translation( -HINT_OFFSET, 0 );
const RIGHT_HINT_TRANSLATION = Matrix3.translation( HINT_OFFSET, 0 );
const OPERATOR_FONT = new PhetFont( 32 );

class ExpressionNode extends Node {

  /**
   * @param {Expression} expression - model of an expression
   * @param {Property.<boolean>} simplifyNegativesProperty - controls whether to depict minus signs
   */
  constructor( expression, simplifyNegativesProperty ) {

    super( { pickable: false } );
    const self = this;

    // shape and path used to define and display the background
    const backgroundPath = new Path( null, { fill: BACKGROUND_COLOR, lineWidth: 5 } );
    this.addChild( backgroundPath );

    // left and right 'hints' that are used to indicate to the user that a coin term can be added
    const leftHintNode = new Path( null, { fill: BACKGROUND_COLOR } );
    this.addChild( leftHintNode );

    const rightHintNode = new Path( null, { fill: BACKGROUND_COLOR } );
    this.addChild( rightHintNode );

    // layer where the plus and/or minus symbols go
    const operatorsLayer = new Node();
    this.addChild( operatorsLayer );

    // function to update the background and the plus/minus symbols
    function updateBackgroundAndSymbols() {

      // symbols are recreated each time to keep things simple
      operatorsLayer.removeAllChildren();

      if ( expression.coinTerms.length > 0 ) {

        const coinTermsLeftToRight = expression.coinTerms.slice().sort( ( ct1, ct2 ) => ct1.destinationProperty.get().x - ct2.destinationProperty.get().x );

        const backgroundShape = new Shape();
        backgroundShape.moveTo( 0, 0 );
        backgroundShape.lineTo( expression.widthProperty.get(), 0 );
        const expressionWidth = expression.widthProperty.get();
        const expressionHeight = expression.heightProperty.get();

        // if the hint is active, the edge is zig zagged
        if ( expression.rightHintActiveProperty.get() ) {
          backgroundShape.zigZagTo( expressionWidth, expressionHeight, ZIG_ZAG_AMPLITUDE, NUM_ZIG_ZAGS, false );
        }
        else {
          backgroundShape.lineTo( expressionWidth, expressionHeight );
        }
        backgroundShape.lineTo( 0, expressionHeight );

        // zig zag on left side if hint is active
        if ( expression.leftHintActiveProperty.get() ) {
          backgroundShape.zigZagTo( 0, 0, ZIG_ZAG_AMPLITUDE, NUM_ZIG_ZAGS, false );
        }
        else {
          backgroundShape.lineTo( 0, 0 );
        }

        backgroundShape.close();
        backgroundPath.visible = true;
        backgroundPath.shape = null;
        backgroundPath.shape = backgroundShape;

        // add the operators
        for ( let i = 0; i < coinTermsLeftToRight.length - 1; i++ ) {

          // determine whether to show a plus sign or a minus sign
          let symbolText;
          if ( simplifyNegativesProperty.value &&
               coinTermsLeftToRight[ i + 1 ].totalCountProperty.get() < 0 && !coinTermsLeftToRight[ i + 1 ].userControlledProperty.get() ) {
            symbolText = MathSymbols.MINUS;
          }
          else {
            symbolText = MathSymbols.PLUS;
          }

          // add the operator
          const operator = new Text( symbolText, {
            font: OPERATOR_FONT,
            scale: expression.scaleProperty.get(),
            centerX: ( coinTermsLeftToRight[ i ].destinationProperty.get().x +
                       coinTermsLeftToRight[ i ].localViewBoundsProperty.get().maxX +
                       coinTermsLeftToRight[ i + 1 ].destinationProperty.get().x +
                       coinTermsLeftToRight[ i + 1 ].localViewBoundsProperty.get().minX ) / 2 -
                     expression.upperLeftCornerProperty.get().x,
            centerY: expressionHeight / 2
          } );
          operatorsLayer.addChild( operator );
        }
      }
      else {
        // no terms in this expression, so no background should be shown
        backgroundPath.visible = false;
      }
    }

    // update the appearance if the layout changes
    expression.layoutChangedEmitter.addListener( updateBackgroundAndSymbols );

    // make the background invisible whenever this expression is in a collection area
    expression.collectedProperty.link( collected => {
      backgroundPath.fill = collected ? 'transparent' : BACKGROUND_COLOR;
    } );

    // update the shape when hint states of the expression change
    const updateBackgroundAndSymbolsMultilink = Multilink.multilink(
      [ expression.leftHintActiveProperty, expression.rightHintActiveProperty, simplifyNegativesProperty ],
      updateBackgroundAndSymbols
    );

    // update the position when the expression moves
    function updatePosition( upperLeftCorner ) {
      self.translation = upperLeftCorner;
    }

    expression.upperLeftCornerProperty.link( updatePosition );

    // update the visibility of the left and right hints
    const leftHintHandle = visible => {leftHintNode.visible = visible;};
    const rightHintHandle = visible => {rightHintNode.visible = visible;};
    expression.leftHintActiveProperty.link( leftHintHandle );
    expression.rightHintActiveProperty.link( rightHintHandle );

    // turn the halo on and off based on the associated property
    function activateCombineHint( combineHintActive ) {
      backgroundPath.stroke = combineHintActive ? 'yellow' : null;
    }

    expression.combineHaloActiveProperty.link( activateCombineHint );

    // update the shape of the left hint
    const leftHintMultilink = Multilink.multilink(
      [ expression.heightProperty, expression.widthProperty, expression.leftHintWidthProperty ],
      ( expressionHeight, expressionWidth, hintWidth ) => {
        let leftHintShape = new Shape()
          .moveTo( -hintWidth, 0 )
          .lineTo( 0, 0 );
        leftHintShape.zigZagTo( 0, expressionHeight, ZIG_ZAG_AMPLITUDE, NUM_ZIG_ZAGS, false );
        leftHintShape
          .lineTo( -hintWidth, expressionHeight )
          .close();
        leftHintShape = leftHintShape.transformed( LEFT_HINT_TRANSLATION );
        leftHintNode.shape = leftHintShape;
      }
    );

    // update the shape of the right hint
    const rightHintMultilink = Multilink.multilink(
      [ expression.heightProperty, expression.widthProperty, expression.rightHintWidthProperty ],
      ( expressionHeight, expressionWidth, hintWidth ) => {
        let rightHintShape = new Shape().moveTo( expressionWidth, 0 );
        rightHintShape.zigZagTo( expressionWidth, expressionHeight, ZIG_ZAG_AMPLITUDE, NUM_ZIG_ZAGS, false );
        rightHintShape
          .lineTo( expressionWidth + hintWidth, expressionHeight )
          .lineTo( expressionWidth + hintWidth, 0 )
          .close();
        rightHintShape = rightHintShape.transformed( RIGHT_HINT_TRANSLATION );
        rightHintNode.shape = rightHintShape;
      }
    );

    // create a dispose function
    this.disposeExpressionNode = () => {
      expression.layoutChangedEmitter.removeListener( updateBackgroundAndSymbols );
      updateBackgroundAndSymbolsMultilink.dispose();
      expression.upperLeftCornerProperty.unlink( updatePosition );
      expression.leftHintActiveProperty.unlink( leftHintHandle );
      expression.rightHintActiveProperty.unlink( rightHintHandle );
      expression.combineHaloActiveProperty.unlink( activateCombineHint );
      leftHintMultilink.dispose();
      rightHintMultilink.dispose();
    };

    // do the initial update
    updateBackgroundAndSymbols();
  }

  // @public
  dispose() {
    this.disposeExpressionNode();
    super.dispose();
  }
}

expressionExchange.register( 'ExpressionNode', ExpressionNode );

export default ExpressionNode;