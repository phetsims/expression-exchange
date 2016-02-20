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
  var ZIG_ZAG_X_SIZE = 4; // empirically determined

  // TODO: Need to consolidate this with duplicated function in ExpressionHintNode if that node is retained
  // utility function for drawing a vertical zig zag line on a shape between two endpoints
  function addVerticalZigZagLine( shape, x1, y1, x2, y2, zigRightFirst ) {
    assert && assert( x1 === x2, 'this function is not general enough to handle non-vertical zig-zag lines' );
    var segmentYLength = ( y2 - y1 ) / ( NUM_ZIG_ZAGS - 1 ); // can be negative if line is headed upwards
    var nextPoint = new Vector2( x1, y1 );
    _.times( NUM_ZIG_ZAGS - 1, function( index ) {
      if ( index === 0 ){
        // the first zig is half size so that the line stays centered around a straight line between the two points
        nextPoint.x = nextPoint.x + ZIG_ZAG_X_SIZE / 2 * ( zigRightFirst ? 1 : -1 );
        nextPoint.y = nextPoint.y + segmentYLength / 2;
      }
      else{
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

    // update the shape if the height, width, or hint states change
    Property.multilink(
      [ expression.widthProperty, expression.heightProperty, expression.leftHintActiveProperty, expression.rightHintActiveProperty ],
      updateShapeAndPlusSymbols
    );

    // update the position when the expression moves
    expression.upperLeftCornerProperty.link( function( upperLeftCorner ) {
      self.left = upperLeftCorner.x;
      self.top = upperLeftCorner.y;
    } );

    // update whenever coin terms are added or removed
    expression.coinTerms.addItemAddedListener( updateShapeAndPlusSymbols );
    expression.coinTerms.addItemRemovedListener( updateShapeAndPlusSymbols );

    // do the initial update
    updateShapeAndPlusSymbols();
  }

  return inherit( Node, ExpressionNode );
} );