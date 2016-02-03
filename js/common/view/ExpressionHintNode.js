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
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // constants
  var HINT_BACKGROUND_COLOR = 'rgba( 255, 255, 255, 0.5 )';
  var INSET = 10; // in screen coordinates

  /**
   * @param {ExpressionHint} expressionHint - model of an expression hint
   * @constructor
   */
  function ExpressionHintNode( expressionHint ) {
    Node.call( this, { pickable: false } );
    var self = this;

    Property.multilink(
      [
        expressionHint.anchorCoinTerm.viewInfoProperty,
        expressionHint.anchorCoinTerm.viewInfoProperty
      ],
      function() {
        // convenience vars
        var anchorCTSize = expressionHint.anchorCoinTerm.viewInfo.dimensions;
        var movingCTSize = expressionHint.movingCoinTerm.viewInfo.dimensions;

          // clear out any previous hint
          self.removeAllChildren();

        // the hint can be on the left or right side of the 'anchor coin', depending upon where the moving coin term is
        var anchorCoinTermOnLeft = expressionHint.movingCoinTerm.position.x > expressionHint.anchorCoinTerm.position.x;

        // calculate size and position for each half of the hint
        var height = Math.max( anchorCTSize.height, movingCTSize.height ) + 2 * INSET;
        var top = expressionHint.anchorCoinTerm.position.y - height / 2;
        var leftHalfWidth;
        var rightHalfWidth;
        var leftHalfCenterX;
        if ( anchorCoinTermOnLeft ) {
          leftHalfWidth = anchorCTSize.width + 2 * INSET;
          rightHalfWidth = movingCTSize.width + 2 * INSET;
          leftHalfCenterX = expressionHint.anchorCoinTerm.position.x + expressionHint.anchorCoinTerm.viewInfo.xOffset;
        }
        else {
          leftHalfWidth = movingCTSize.width + 2 * INSET;
          rightHalfWidth = anchorCTSize.width + 2 * INSET;
          leftHalfCenterX = expressionHint.anchorCoinTerm.position.x - leftHalfWidth / 2 - rightHalfWidth / 2 +
                            expressionHint.anchorCoinTerm.viewInfo.xOffset;
        }

        var leftHalf = new Rectangle( 0, 0, leftHalfWidth, height, 0, 0, {
          fill: HINT_BACKGROUND_COLOR,
          centerX: leftHalfCenterX,
          top: top
        } );
        self.addChild( leftHalf );

        // add right half
        self.addChild( new Rectangle( 0, 0, rightHalfWidth, height, 0, 0, {
          fill: HINT_BACKGROUND_COLOR,
          left: leftHalf.right,
          top: top
        } ) );

      } );
  }

  return inherit( Node, ExpressionHintNode );
} );