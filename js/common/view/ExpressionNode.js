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
   * @constructor
   */
  function ExpressionNode( expression ) {

    Node.call( this, { pickable: false } );
    var self = this;

    // shape and path used to define and display the background
    var backgroundShape = DEFAULT_SHAPE;
    var backgroundPath = new Path( backgroundShape, { fill: BACKGROUND_COLOR } );
    this.addChild( backgroundPath );

    // left and right 'hints' that are used to indicate to the user that a coin term can be added
    var leftHintShape = DEFAULT_SHAPE;
    var leftHintNode = new Path( leftHintShape, { fill: BACKGROUND_COLOR } );
    this.addChild( leftHintNode );
    var rightHintShape = DEFAULT_SHAPE;
    var rightHintNode = new Path( leftHintShape, { fill: BACKGROUND_COLOR } );
    this.addChild( rightHintNode );

    // layer where the plus symbols go
    var plusSymbolsLayer = new Node();
    this.addChild( plusSymbolsLayer );

    // function to update the background and the plus symbols
    function updateShapeAndPlusSymbols() {

      // plus symbols are recreated each time to keep things simple
      plusSymbolsLayer.removeAllChildren();

      if ( expression.coinTerms.length > 0 ) {

        var coinTermsLeftToRight = expression.coinTerms.getArray().slice().sort( function( ct1, ct2 ) {
          return ct1.position.x - ct2.position.x;
        } );

        backgroundShape = new Shape();
        backgroundShape.moveTo( 0, 0 );
        backgroundShape.lineTo( expression.width, 0 );

        // if the hint is active, the edge is zig zagged
        if ( expression.rightHintActive ) {
          addVerticalZigZagLine( backgroundShape, expression.width, 0, expression.width, expression.height, true );
        }
        else {
          backgroundShape.lineTo( expression.width, expression.height );
        }
        backgroundShape.lineTo( 0, expression.height );

        // zig zag on left side if hint is active
        if ( expression.leftHintActive ) {
          addVerticalZigZagLine( backgroundShape, 0, expression.height, 0, 0, true );
        }
        else {
          backgroundShape.lineTo( 0, 0 );
        }

        backgroundShape.close();
        backgroundPath.shape = null;
        backgroundPath.shape = backgroundShape;

        // add the plus signs
        for ( var i = 0; i < coinTermsLeftToRight.length - 1; i++ ) {
          var plusSign = new Text( '+', {
            font: new PhetFont( 32 ),
            centerY: coinTermsLeftToRight[ i ].position.y - expression.upperLeftCorner.y,
            centerX: ( coinTermsLeftToRight[ i ].position.x + coinTermsLeftToRight[ i ].relativeViewBounds.maxX +
                       coinTermsLeftToRight[ i + 1 ].position.x +
                       coinTermsLeftToRight[ i + 1 ].relativeViewBounds.minX ) / 2 - expression.upperLeftCorner.x
          } );
          plusSymbolsLayer.addChild( plusSign );
        }
      }
      else {
        // no terms in this expression, so no background should be shown
        if ( backgroundPath !== null ) {
          self.removeChild( backgroundPath );
          backgroundPath = null;
        }
      }
    }

    // update the shape of the background if the height, width, or hint states of the expression change
    Property.multilink(
      [ expression.widthProperty, expression.heightProperty, expression.leftHintActiveProperty, expression.rightHintActiveProperty ],
      updateShapeAndPlusSymbols
    );

    // update the position when the expression moves
    expression.upperLeftCornerProperty.link( function( upperLeftCorner ) {
      self.x = upperLeftCorner.x;
      self.y = upperLeftCorner.y;
    } );

    // update whenever coin terms are added or removed
    expression.coinTerms.addItemAddedListener( updateShapeAndPlusSymbols );
    expression.coinTerms.addItemRemovedListener( updateShapeAndPlusSymbols );

    // update the visibility of the left and right hints
    expression.leftHintActiveProperty.linkAttribute( leftHintNode, 'visible' );
    expression.rightHintActiveProperty.linkAttribute( rightHintNode, 'visible' );

    // update the shape of the left and right hints
    Property.multilink( [ expression.heightProperty, expression.widthProperty, expression.leftHintWidthProperty ],
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
    Property.multilink( [ expression.heightProperty, expression.widthProperty, expression.rightHintWidthProperty ],
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

    // do the initial update
    updateShapeAndPlusSymbols();
  }

  return inherit( Node, ExpressionNode );
} );