// Copyright 2016, University of Colorado Boulder

/**
 * This type represents a Scenery node that represents a hint that is presented to the user when two coins can be
 * combined into an expression.  The hint looks like a rectangle with a rip in the middle, and the coins are enclosed
 * on either side of the rip.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );

  // constants
  var HINT_BACKGROUND_COLOR = 'rgba( 255, 255, 255, 0.5 )';
  var INSET = 10; // in screen coordinates
  var NUM_ZIG_ZAGS = 10;
  var ZIG_ZAG_X_SIZE = 2; // empirically determined

  // utility function for drawing a zig zag line on a shape between two endpoints
  function addZigZagLine( shape, x1, y1, x2, y2, zigRightFirst ) {
    assert && assert( x1 === x2, 'this function is not general enough to handle non-vertical zig-zag lines' );
    shape.moveTo( x1, y1 );
    var segmentYLength = ( y2 - y1 ) / NUM_ZIG_ZAGS;
    _.times( NUM_ZIG_ZAGS - 1, function( index ) {
      var zig = index % 2 === 0 ? ZIG_ZAG_X_SIZE : -ZIG_ZAG_X_SIZE;
      if ( !zigRightFirst ){
        zig = -zig;
      }
      shape.lineTo( x1 + zig, y1 + ( index + 1 ) * segmentYLength );
    } );
    shape.lineTo( x2, y2 );
  }


  /**
   * @param {ExpressionHint} expressionHint - model of an expression hint
   * @constructor
   */
  function ExpressionHintNode( expressionHint ) {
    Node.call( this, { pickable: false } );
    var self = this;

    Property.multilink(
      [
        expressionHint.anchorCoinTerm.relativeViewBoundsProperty,
        expressionHint.movingCoinTerm.relativeViewBoundsProperty
      ],
      function() {
        // convenience vars
        var anchorCTBounds = expressionHint.anchorCoinTerm.relativeViewBounds;
        var movingCTBounds = expressionHint.movingCoinTerm.relativeViewBounds;

        // clear out any previous hint
        self.removeAllChildren();

        // the hint can be on the left or right side of the 'anchor coin', depending upon where the moving coin term is
        var anchorCoinTermOnLeft = expressionHint.movingCoinTerm.position.x > expressionHint.anchorCoinTerm.position.x;

        // calculate size and position for each half of the hint
        var height = Math.max( anchorCTBounds.height, movingCTBounds.height ) + 2 * INSET;
        var top = expressionHint.anchorCoinTerm.position.y - height / 2;
        var leftHalfWidth;
        var rightHalfWidth;
        var leftHalfCenterX;
        if ( anchorCoinTermOnLeft ) {
          leftHalfWidth = anchorCTBounds.width + 2 * INSET;
          rightHalfWidth = movingCTBounds.width + 2 * INSET;
          leftHalfCenterX = expressionHint.anchorCoinTerm.position.x + ( anchorCTBounds.minX + anchorCTBounds.maxX ) / 2;
        }
        else { // anchor coin term is on the right
          leftHalfWidth = movingCTBounds.width + 2 * INSET;
          rightHalfWidth = anchorCTBounds.width + 2 * INSET;
          leftHalfCenterX = expressionHint.anchorCoinTerm.position.x +
                            ( anchorCTBounds.minX + anchorCTBounds.maxX ) / 2 -
                            anchorCTBounds.width / 2 -INSET -
                            movingCTBounds.width / 2 - INSET;
        }

        var leftHalfShape = new Shape()
          .moveTo( leftHalfWidth, 0 )
          .lineTo( 0, 0 )
          .lineTo( 0, height )
          .lineTo( leftHalfWidth, height );
        addZigZagLine( leftHalfShape, leftHalfWidth, height, leftHalfWidth, 0, true );
        leftHalfShape.close();

        var leftHalf = new Path( leftHalfShape, {
          fill: HINT_BACKGROUND_COLOR,
          centerX: leftHalfCenterX,
          top: top
        } );
        self.addChild( leftHalf );

        // add right half
        var rightHalfShape = new Shape()
          .moveTo( 0, 0 )
          .lineTo( rightHalfWidth, 0 )
          .lineTo( rightHalfWidth, height )
          .lineTo( 0, height );
        addZigZagLine( rightHalfShape, 0, height, 0, 0, true );
        rightHalfShape.close();

        self.addChild( new Path( rightHalfShape, {
          fill: HINT_BACKGROUND_COLOR,
          left: leftHalf.right,
          top: top
        } ) );

      } );
  }

  return inherit( Node, ExpressionHintNode );
} );