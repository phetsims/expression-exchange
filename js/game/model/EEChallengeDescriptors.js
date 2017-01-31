// Copyright 2017, University of Colorado Boulder

/**
 * an array of static objects that describe the Expression Exchange challenges, organized by game level
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );

  /*
   * two-dimensional array of game challenge descriptors, organized as a 2D array where the first dimension corresponds
   * to the game level and the 2nd is the available challenges within that level
   *
   * TODO: document challenge descriptor format when finalized
   */
  var EEChallengeDescriptors = [

    // level 1 challenges
    [
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 5 }
        ],
        expressionsToCollect: [
          '2x + y',
          '2x + 2y',
          'x + 2y'
        ]
      },
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 3 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 4 },
          { typeID: CoinTermTypeID.Z, minimumDecomposition: 1, creationLimit: 3 }
        ],
        expressionsToCollect: [
          'x + y + z',
          '2x + y',
          '2y + 2z'
        ]
      },
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Z, minimumDecomposition: 1, creationLimit: 4 }
        ],
        expressionsToCollect: [
          '3xf + 2y',
          'y + 2z',
          '2x + 2y + 2z'
        ]
      }
    ],

    // level 2
    [
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 5 }
        ],
        expressionsToCollect: [
          '2x + y',
          '2x + 2y',
          'x + 2y'
        ]
      },
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 4 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 2 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 2, creationLimit: 2 }
        ],
        expressionsToCollect: [
          'x + y',
          '2x + 2y',
          'x + 3y'
        ]
      }
    ],

    // level 3
    [
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 7 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 2 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 4, creationLimit: 1 }
        ],
        expressionsToCollect: [
          '5x',
          '5x',
          '5x'
        ]
      }
    ],

    // level 4
    [
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 2 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 2 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 3 }
        ],
        expressionsToCollect: [
          '3x',
          '2x + y',
          'x + 2y'
        ]
      },
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 4 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 2 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 2, creationLimit: 2 }
        ],
        expressionsToCollect: [
          'x + y',
          '2x + 2y',
          'x + 3y'
        ]
      }
    ],

    // level 5
    [
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 2 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: -1, creationLimit: 2 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 4 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: -1, creationLimit: 5 }
        ],
        expressionsToCollect: [
          '2x - y',
          'x - 2y',
          '-x + y'
        ]
      },
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 3 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: 3, creationLimit: 2 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 2, creationLimit: 3 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: -1, creationLimit: 3 }
        ],
        expressionsToCollect: [
          '5x + y',
          '4x - 2y',
          '3x + 4y'
        ]
      }
    ],

    // level 6
    [
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: -4, creationLimit: 1 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: -2, creationLimit: 2 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: -1, creationLimit: 4 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 1 }
        ],
        expressionsToCollect: [
          '3x',
          '3x',
          '3x'
        ]
      },
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 4 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 1 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: 3, creationLimit: 1 },
          { typeID: CoinTermTypeID.Y, minimumDecomposition: 1, creationLimit: 3 }
        ],
        expressionsToCollect: [
          '3x + y',
          '3x + y',
          '3x + y'
        ]
      }
    ],

    // level 7
    [
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X, minimumDecomposition: 1, creationLimit: 4 },
          { typeID: CoinTermTypeID.X, minimumDecomposition: 2, creationLimit: 1 },
          { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: 1, creationLimit: 6 },
          { typeID: CoinTermTypeID.CONSTANT, minimumDecomposition: -1, creationLimit: 4 }
        ],
        expressionsToCollect: [
          'x^2 + y^2',
          'y^2 + z',
          'x^2 + z'
        ]
      }
    ],

    // level 8
    [
      {
        carouselContents: [
          { typeID: CoinTermTypeID.X_SQUARED, minimumDecomposition: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Y_SQUARED, minimumDecomposition: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Z, minimumDecomposition: 1, creationLimit: 5 }
        ],
        expressionsToCollect: [
          'x^2 + y^2',
          'y^2 + z',
          'x^2 + z'
        ]
      }
    ]
  ];

  expressionExchange.register( 'EEChallengeDescriptors', EEChallengeDescriptors );

  return EEChallengeDescriptors;

} );