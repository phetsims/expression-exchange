// Copyright 2016, University of Colorado Boulder

/**
 * This type represents an expression in the view, which basically looks like a rectangle with two or more coin terms
 * in it and plus signs between them.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EESharedConstants = require( 'EXPRESSION_EXCHANGE/common/EESharedConstants' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var BACKGROUND_COLOR = EESharedConstants.EXPRESSION_BACKGROUND_COLOR;
  var DEFAULT_SHAPE = Shape.rect( 0, 0, 1, 1 ); // arbitrary initial shape
  var NUM_ZIG_ZAGS = 10;
  var ZIG_ZAG_X_SIZE = 4; // in screen coordinates, empirically determined
  var HINT_OFFSET = 3; // in screen coordinates, empirically determined
  var LEFT_HINT_TRANSLATION = Matrix3.translation( -HINT_OFFSET, 0 );
  var RIGHT_HINT_TRANSLATION = Matrix3.translation( HINT_OFFSET, 0 );
  var OPERATOR_FONT = new PhetFont( 32 );

  // TODO: Need to consolidate this with duplicated function in ExpressionHintNode if that node is retained
  // utility function for drawing a vertical zig zag line on a shape between two endpoints
  function addVerticalZigZagLine( shape, x1, y1, x2, y2, zigRightFirst ) {
    assert && assert( x1 === x2, 'this function is not general enough to handle non-vertical zig-zag lines' );
    var segmentYLength = ( y2 - y1 ) / ( NUM_ZIG_ZAGS - 1 ); // can be negative if line is headed upwards
    var nextPoint = new Vector2( x1, y1 );
    _.times( NUM_ZIG_ZAGS - 1, function( index ) {
      if ( index === 0 ) {
        // the first zig is half size so that the line stays centered around a straight line between the two points
        nextPoint.x = nextPoint.x + ZIG_ZAG_X_SIZE / 2 * ( zigRightFirst ? 1 : -1 );
        nextPoint.y = nextPoint.y + segmentYLength / 2;
      }
      else {
        nextPoint.x = nextPoint.x + ( nextPoint.x > x1 ? -1 : 1 ) * ZIG_ZAG_X_SIZE;
        nextPoint.y = nextPoint.y + segmentYLength;
      }
      shape.lineTo( nextPoint.x, nextPoint.y );
    } );
    shape.lineTo( x2, y2 );
  }

  /**
   * @param {Expression} expression - model of an expression
   * @param {Property.<boolean>} simplifyNegativesProperty - controls whether to depict minus signs
   * @constructor
   */
  function ExpressionNode( expression, simplifyNegativesProperty ) {

    Node.call( this, { pickable: false } );
    var self = this;

    // shape and path used to define and display the background
    var backgroundShape = DEFAULT_SHAPE;
    var backgroundPath = new Path( backgroundShape, { fill: BACKGROUND_COLOR, lineWidth: 5 } );
    this.addChild( backgroundPath );

    // left and right 'hints' that are used to indicate to the user that a coin term can be added
    var leftHintShape = DEFAULT_SHAPE;
    var leftHintNode = new Path( leftHintShape, { fill: BACKGROUND_COLOR } );
    this.addChild( leftHintNode );
    var rightHintShape = DEFAULT_SHAPE;
    var rightHintNode = new Path( rightHintShape, { fill: BACKGROUND_COLOR } );
    this.addChild( rightHintNode );

    // layer where the plus symbols go
    var symbolsLayer = new Node();
    this.addChild( symbolsLayer );

    // function to update the background and the plus/minus symbols
    function updateBackgroundAndSymbols() {

      // plus symbols are recreated each time to keep things simple
      symbolsLayer.removeAllChildren();

      if ( expression.coinTerms.length > 0 ) {

        var coinTermsLeftToRight = expression.coinTerms.getArray().slice().sort( function( ct1, ct2 ) {
          return ct1.destinationProperty.get().x - ct2.destinationProperty.get().x;
        } );

        backgroundShape = new Shape();
        backgroundShape.moveTo( 0, 0 );
        backgroundShape.lineTo( expression.widthProperty.get(), 0 );
        var expressionWidth = expression.widthProperty.get();
        var expressionHeight = expression.heightProperty.get();

        // if the hint is active, the edge is zig zagged
        if ( expression.rightHintActiveProperty.get() ) {
          addVerticalZigZagLine( backgroundShape, expressionWidth, 0, expressionWidth, expressionHeight, true );
        }
        else {
          backgroundShape.lineTo( expressionWidth, expressionHeight );
        }
        backgroundShape.lineTo( 0, expressionHeight );

        // zig zag on left side if hint is active
        if ( expression.leftHintActiveProperty.get() ) {
          addVerticalZigZagLine( backgroundShape, 0, expressionHeight, 0, 0, true );
        }
        else {
          backgroundShape.lineTo( 0, 0 );
        }

        backgroundShape.close();
        if ( !backgroundPath.visible ) {
          backgroundPath.visible = true;
        }
        backgroundPath.shape = null;
        backgroundPath.shape = backgroundShape;

        // add the operators
        for ( var i = 0; i < coinTermsLeftToRight.length - 1; i++ ) {

          // determine whether to show a plus sign or a minus sign
          var symbolText;
          if ( simplifyNegativesProperty.value &&
               coinTermsLeftToRight[ i + 1 ].totalCountProperty.get() < 0 &&
               !coinTermsLeftToRight[ i + 1 ].userControlledProperty.get() ){
            symbolText = '\u2212'; // unicode minus sign
          }
          else{
            symbolText = '+';
          }

          // add the operator
          var operator = new Text( symbolText, {
            font: OPERATOR_FONT,
            centerX: ( coinTermsLeftToRight[ i ].destinationProperty.get().x +
                       coinTermsLeftToRight[ i ].relativeViewBoundsProperty.get().maxX +
                       coinTermsLeftToRight[ i + 1 ].destinationProperty.get().x +
                       coinTermsLeftToRight[ i + 1 ].relativeViewBoundsProperty.get().minX ) / 2 -
                     expression.upperLeftCornerProperty.get().x,
            centerY: expression.heightProperty.get() / 2
          } );
          symbolsLayer.addChild( operator );
        }
      }
      else {
        // no terms in this expression, so no background should be shown
        backgroundPath.visible = false;
      }
    }

    // update the appearance if the layout changes
    expression.layoutChangedEmitter.addListener( updateBackgroundAndSymbols );

    // update the shape when hint states of the expression change
    var updateBackgroundAndSymbolsMultilink = Property.multilink(
      [ expression.leftHintActiveProperty, expression.rightHintActiveProperty, simplifyNegativesProperty ],
      updateBackgroundAndSymbols
    );

    // update the position when the expression moves
    function updatePosition( upperLeftCorner ) {
      self.x = upperLeftCorner.x;
      self.y = upperLeftCorner.y;
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
        leftHintShape = new Shape();
        leftHintShape.moveTo( -hintWidth, 0 );
        leftHintShape.lineTo( 0, 0 );
        addVerticalZigZagLine( leftHintShape, 0, 0, 0, expressionHeight, true );
        leftHintShape.lineTo( -hintWidth, expressionHeight );
        leftHintShape.close();
        leftHintShape = leftHintShape.transformed( LEFT_HINT_TRANSLATION );
        leftHintNode.shape = leftHintShape;
      }
    );

    // update the shape of the right hint
    var rightHintMultilink = Property.multilink(
      [ expression.heightProperty, expression.widthProperty, expression.rightHintWidthProperty ],
      function( expressionHeight, expressionWidth, hintWidth ) {
        rightHintShape = new Shape();
        rightHintShape.moveTo( expressionWidth, 0 );
        addVerticalZigZagLine( rightHintShape, expressionWidth, 0, expressionWidth, expressionHeight, true );
        rightHintShape.lineTo( expressionWidth + hintWidth, expressionHeight );
        rightHintShape.lineTo( expressionWidth + hintWidth, 0 );
        rightHintShape.close();
        rightHintShape = rightHintShape.transformed( RIGHT_HINT_TRANSLATION );
        rightHintNode.shape = rightHintShape;
      }
    );

    // create a dispose function
    this.disposeExpressionNode = function(){
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
    dispose: function(){
      this.disposeExpressionNode();
    }
  } );
} );