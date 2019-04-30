// Copyright 2016-2018, University of Colorado Boulder

/**
 * This type represents an expression in the view, which basically looks like a rectangle with two or more coin terms
 * in it and plus signs between them.
 *
 * Note that this works in conjunction with ExpressionOverlayNode to implement the view-oriented behaviors of the
 * expressions so, if you don't find what you're looking for here, you may want to check that type.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MathSymbols = require( 'SCENERY_PHET/MathSymbols' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var BACKGROUND_COLOR = EESharedConstants.EXPRESSION_BACKGROUND_COLOR;
  var NUM_ZIG_ZAGS = 5;
  var ZIG_ZAG_AMPLITUDE = 2; // in screen coordinates, empirically determined
  var HINT_OFFSET = 3; // in screen coordinates, empirically determined
  var LEFT_HINT_TRANSLATION = Matrix3.translation( -HINT_OFFSET, 0 );
  var RIGHT_HINT_TRANSLATION = Matrix3.translation( HINT_OFFSET, 0 );
  var OPERATOR_FONT = new PhetFont( 32 );

  /**
   * @param {Expression} expression - model of an expression
   * @param {Property.<boolean>} simplifyNegativesProperty - controls whether to depict minus signs
   * @constructor
   */
  function ExpressionNode( expression, simplifyNegativesProperty ) {

    Node.call( this, { pickable: false } );
    var self = this;

    // shape and path used to define and display the background
    var backgroundPath = new Path( null, { fill: BACKGROUND_COLOR, lineWidth: 5 } );
    this.addChild( backgroundPath );

    // left and right 'hints' that are used to indicate to the user that a coin term can be added
    var leftHintNode = new Path( null, { fill: BACKGROUND_COLOR } );
    this.addChild( leftHintNode );

    var rightHintNode = new Path( null, { fill: BACKGROUND_COLOR } );
    this.addChild( rightHintNode );

    // layer where the plus and/or minus symbols go
    var operatorsLayer = new Node();
    this.addChild( operatorsLayer );

    // function to update the background and the plus/minus symbols
    function updateBackgroundAndSymbols() {

      // symbols are recreated each time to keep things simple
      operatorsLayer.removeAllChildren();

      if ( expression.coinTerms.length > 0 ) {

        var coinTermsLeftToRight = expression.coinTerms.getArray().slice().sort( function( ct1, ct2 ) {
          return ct1.destinationProperty.get().x - ct2.destinationProperty.get().x;
        } );

        var backgroundShape = new Shape();
        backgroundShape.moveTo( 0, 0 );
        backgroundShape.lineTo( expression.widthProperty.get(), 0 );
        var expressionWidth = expression.widthProperty.get();
        var expressionHeight = expression.heightProperty.get();

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
        for ( var i = 0; i < coinTermsLeftToRight.length - 1; i++ ) {

          // determine whether to show a plus sign or a minus sign
          var symbolText;
          if ( simplifyNegativesProperty.value &&
               coinTermsLeftToRight[ i + 1 ].totalCountProperty.get() < 0 && !coinTermsLeftToRight[ i + 1 ].userControlledProperty.get() ) {
            symbolText = MathSymbols.MINUS;
          }
          else {
            symbolText = MathSymbols.PLUS;
          }

          // add the operator
          var operator = new Text( symbolText, {
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
    expression.collectedProperty.link( function( collected ) {
      backgroundPath.fill = collected ? 'transparent' : BACKGROUND_COLOR;
    } );

    // update the shape when hint states of the expression change
    var updateBackgroundAndSymbolsMultilink = Property.multilink(
      [ expression.leftHintActiveProperty, expression.rightHintActiveProperty, simplifyNegativesProperty ],
      updateBackgroundAndSymbols
    );

    // update the position when the expression moves
    function updatePosition( upperLeftCorner ) {
      self.translation = upperLeftCorner;
    }

    expression.upperLeftCornerProperty.link( updatePosition );

    // update the visibility of the left and right hints
    var leftHintHandle = expression.leftHintActiveProperty.linkAttribute( leftHintNode, 'visible' );
    var rightHintHandle = expression.rightHintActiveProperty.linkAttribute( rightHintNode, 'visible' );

    // turn the halo on and off based on the associated property
    function activateCombineHint( combineHintActive ) {
      backgroundPath.stroke = combineHintActive ? 'yellow' : null;
    }

    expression.combineHaloActiveProperty.link( activateCombineHint );

    // update the shape of the left hint
    var leftHintMultilink = Property.multilink(
      [ expression.heightProperty, expression.widthProperty, expression.leftHintWidthProperty ],
      function( expressionHeight, expressionWidth, hintWidth ) {
        var leftHintShape = new Shape()
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
    var rightHintMultilink = Property.multilink(
      [ expression.heightProperty, expression.widthProperty, expression.rightHintWidthProperty ],
      function( expressionHeight, expressionWidth, hintWidth ) {
        var rightHintShape = new Shape().moveTo( expressionWidth, 0 );
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
    this.disposeExpressionNode = function() {
      expression.layoutChangedEmitter.removeListener( updateBackgroundAndSymbols );
      updateBackgroundAndSymbolsMultilink.dispose();
      expression.upperLeftCornerProperty.unlink( updatePosition );
      expression.leftHintActiveProperty.unlinkAttribute( leftHintHandle );
      expression.rightHintActiveProperty.unlinkAttribute( rightHintHandle );
      expression.combineHaloActiveProperty.unlink( activateCombineHint );
      leftHintMultilink.dispose();
      rightHintMultilink.dispose();
    };

    // do the initial update
    updateBackgroundAndSymbols();
  }

  expressionExchange.register( 'ExpressionNode', ExpressionNode );

  return inherit( Node, ExpressionNode, {
    // @public
    dispose: function() {
      this.disposeExpressionNode();
      Node.prototype.dispose.call( this );
    }
  } );
} );