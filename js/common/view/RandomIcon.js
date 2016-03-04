// Copyright 2016, University of Colorado Boulder

define( function( require ) {
    'use strict';

    // modules
    var Color = require( 'SCENERY/util/Color' );
    var inherit = require( 'PHET_CORE/inherit' );
    var LinearGradient = require( 'SCENERY/util/LinearGradient' );
    var Node = require( 'SCENERY/nodes/Node' );
    var Path = require( 'SCENERY/nodes/Path' );
    var Rectangle = require( 'SCENERY/nodes/Rectangle' );
    var Screen = require( 'JOIST/Screen' );
    var Shape = require( 'KITE/Shape' );
    var Vector2 = require( 'DOT/Vector2' );

    // constants
    var NUM_SHAPES = 2;
    var NUM_SEGMENTS_PER_SHAPE = 5;

    // utility function to generate a random color
    function generateRandomColor() {
      var r = Math.floor( Math.random() * 256 );
      var g = Math.floor( Math.random() * 256 );
      var b = Math.floor( Math.random() * 256 );
      return new Color( r, g, b );
    }

    // utility function to generate a random linear gradient
    function generateRandomLinearGradient( maxX, maxY ) {
      var vertical = Math.random() > 0.5;
      var gradient;
      if ( vertical ) {
        gradient = new LinearGradient( Math.random() * maxX, 0, Math.random() * maxX, maxY );
      }
      else {
        gradient = new LinearGradient( 0, Math.random() * maxY, maxX, Math.random() * maxY );
      }
      gradient.addColorStop( 0, generateRandomColor() );
      gradient.addColorStop( 1, generateRandomColor() );
      return gradient;
    }

    // utility function to generate a random point
    function generateRandomPoint( maxX, maxY ) {
      return new Vector2( Math.random() * maxX, Math.random() * maxY );
    }

    // utility function to generate a random shape segment
    function addRandomSegment( shape, maxX, maxY ) {
      var decider = Math.random();
      var endpoint = generateRandomPoint( maxX, maxY );
      var controlPoint1;
      var controlPoint2;
      if ( decider < 0.33 ) {
        // add a line segment
        shape.lineToPoint( endpoint );
      }
      else if ( decider < 0.66 ) {
        // add a quadratic curve
        controlPoint1 = generateRandomPoint( maxX, maxY );
        shape.quadraticCurveTo( controlPoint1.x, controlPoint1.y, endpoint.x, endpoint.y );
      }
      else {
        // add a cubic curve
        controlPoint1 = generateRandomPoint( maxX, maxY );
        controlPoint2 = generateRandomPoint( maxX, maxY );
        shape.cubicCurveTo( controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, endpoint.x, endpoint.y );
      }
    }

    // utility function to generate random shape
    function generateRandomShape( numSegments, maxX, maxY ) {
      var shape = new Shape();
      shape.moveToPoint( generateRandomPoint( maxX, maxY ) );
      for ( var i = 0; i < numSegments; i++ ) {
        addRandomSegment( shape, maxX, maxY );
      }
      shape.close();
      return shape;
    }

    /**
     * @constructor
     */
    function RandomIcon() {
      Node.call( this );

      var maxX = Screen.HOME_SCREEN_ICON_SIZE.width;
      var maxY = Screen.HOME_SCREEN_ICON_SIZE.height;

      // add the background
      var background = new Rectangle( 0, 0, maxX, maxY, 0, 0, { fill: generateRandomLinearGradient( maxX, maxY ) } );
      this.addChild( background );

      // set a clip area, since sometimes the random control points can cause the shape to go outside the icon bounds
      background.clipArea = new Shape.rect( 0, 0, maxX, maxY );

      _.times( NUM_SHAPES, function() {
        var shape = generateRandomShape( NUM_SEGMENTS_PER_SHAPE, maxX, maxY );
        background.addChild( new Path( shape, {
          fill: generateRandomLinearGradient( maxX, maxY ),
          stroke: generateRandomColor()
        } ) );
      } );

    }

    return inherit( Node, RandomIcon );
  }
);