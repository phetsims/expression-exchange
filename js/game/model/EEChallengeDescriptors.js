// Copyright 2017, University of Colorado Boulder

/**
 * an array of static objects that describe the Expression Exchange game levels
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CoinTermTypeID = require( 'EXPRESSION_EXCHANGE/common/enum/CoinTermTypeID' );
  var expressionExchange = require( 'EXPRESSION_EXCHANGE/expressionExchange' );
  var AllowedRepresentationsEnum = require( 'EXPRESSION_EXCHANGE/common/model/AllowedRepresentationsEnum' );

  /*
   * two-dimensional array of game challenge descriptors, organized as a 2D array where the first dimension corresponds
   * to the game level and the 2nd is the available challenges within that level
   *
   * TODO: Add challenge descriptor format when finalized
   */
  var EEChallengeDescriptors = [

    // level 1 challenges
    [
      {
        representationType: AllowedRepresentationsEnum.COINS_ONLY,
        carouselContents: [
          { typeID: CoinTermTypeID.X, initialCount: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Y, initialCount: 1, creationLimit: 5 }
        ],
        expressionsToCollect: [
          '2x + y',
          '2x + 2y',
          'x + 2y'
        ]
      },
      {
        representationType: AllowedRepresentationsEnum.COINS_ONLY,
        carouselContents: [
          { typeID: CoinTermTypeID.X, initialCount: 1, creationLimit: 3 },
          { typeID: CoinTermTypeID.Y, initialCount: 1, creationLimit: 4 },
          { typeID: CoinTermTypeID.Z, initialCount: 1, creationLimit: 3 }
        ],
        expressionsToCollect: [
          'x + y + z',
          '2x + y',
          '2y + 2z'
        ]
      },
      {
        representationType: AllowedRepresentationsEnum.COINS_ONLY,
        carouselContents: [
          { typeID: CoinTermTypeID.X, initialCount: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Y, initialCount: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Z, initialCount: 1, creationLimit: 4 }
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
        representationType: AllowedRepresentationsEnum.COINS,
        carouselContents: [
          { typeID: CoinTermTypeID.X, initialCount: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Y, initialCount: 1, creationLimit: 5 }
        ],
        expressionsToCollect: [
          '2x + y',
          '2x + 2y',
          'x + 2y'
        ]
      },
      {
        representationType: AllowedRepresentationsEnum.COINS,
        carouselContents: [
          { typeID: CoinTermTypeID.X, initialCount: 1, creationLimit: 4 },
          { typeID: CoinTermTypeID.Y, initialCount: 1, creationLimit: 2 },
          { typeID: CoinTermTypeID.Y, initialCount: 2, creationLimit: 2 }
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
        representationType: AllowedRepresentationsEnum.COINS,
        carouselContents: [
          { typeID: CoinTermTypeID.X, initialCount: 1, creationLimit: 7 },
          { typeID: CoinTermTypeID.X, initialCount: 2, creationLimit: 2 },
          { typeID: CoinTermTypeID.Y, initialCount: 4, creationLimit: 1 }
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
        representationType: AllowedRepresentationsEnum.VARIABLES_ONLY,
        carouselContents: [
          { typeID: CoinTermTypeID.X, initialCount: 1, creationLimit: 2 },
          { typeID: CoinTermTypeID.X, initialCount: 2, creationLimit: 2 },
          { typeID: CoinTermTypeID.Y, initialCount: 1, creationLimit: 3 }
        ],
        expressionsToCollect: [
          '3x',
          '2x + y',
          'x + 2y'
        ]
      },
      {
        representationType: AllowedRepresentationsEnum.VARIABLES_ONLY,
        carouselContents: [
          { typeID: CoinTermTypeID.X, initialCount: 1, creationLimit: 4 },
          { typeID: CoinTermTypeID.Y, initialCount: 1, creationLimit: 2 },
          { typeID: CoinTermTypeID.Y, initialCount: 2, creationLimit: 2 }
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
        representationType: AllowedRepresentationsEnum.VARIABLES_ONLY,
        carouselContents: [
          { typeID: CoinTermTypeID.X, initialCount: 2, creationLimit: 2 },
          { typeID: CoinTermTypeID.X, initialCount: -1, creationLimit: 2 },
          { typeID: CoinTermTypeID.Y, initialCount: 1, creationLimit: 1 },
          { typeID: CoinTermTypeID.Y, initialCount: -1, creationLimit: 3 }
        ],
        expressionsToCollect: [
          '2x - y',
          'x - 2y',
          '-x + y'
        ]
      },
      {
        representationType: AllowedRepresentationsEnum.VARIABLES_ONLY,
        carouselContents: [
          { typeID: CoinTermTypeID.X, initialCount: 2, creationLimit: 3 },
          { typeID: CoinTermTypeID.X, initialCount: 3, creationLimit: 2 },
          { typeID: CoinTermTypeID.Y, initialCount: 2, creationLimit: 3 },
          { typeID: CoinTermTypeID.Y, initialCount: -1, creationLimit: 3 }
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
        representationType: AllowedRepresentationsEnum.VARIABLES_ONLY,
        carouselContents: [
          { typeID: CoinTermTypeID.X, initialCount: -1, creationLimit: 2 },
          { typeID: CoinTermTypeID.X, initialCount: 1, creationLimit: 1 },
          { typeID: CoinTermTypeID.X, initialCount: 2, creationLimit: 3 },
          { typeID: CoinTermTypeID.X, initialCount: 4, creationLimit: 1 }
        ],
        expressionsToCollect: [
          '3x',
          '3x',
          '3x'
        ]
      },
      {
        representationType: AllowedRepresentationsEnum.VARIABLES_ONLY,
        carouselContents: [
          { typeID: CoinTermTypeID.X, initialCount: 1, creationLimit: 4 },
          { typeID: CoinTermTypeID.X, initialCount: 2, creationLimit: 1 },
          { typeID: CoinTermTypeID.X, initialCount: 3, creationLimit: 1 },
          { typeID: CoinTermTypeID.Y, initialCount: 1, creationLimit: 3 }
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
        representationType: AllowedRepresentationsEnum.VARIABLES_ONLY,
        carouselContents: [
          { typeID: CoinTermTypeID.X_SQUARED, initialCount: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Y_SQUARED, initialCount: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Z, initialCount: 1, creationLimit: 5 }
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
        representationType: AllowedRepresentationsEnum.VARIABLES_ONLY,
        carouselContents: [
          { typeID: CoinTermTypeID.X_SQUARED, initialCount: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Y_SQUARED, initialCount: 1, creationLimit: 5 },
          { typeID: CoinTermTypeID.Z, initialCount: 1, creationLimit: 5 }
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