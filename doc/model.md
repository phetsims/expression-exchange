# Expression Exchange Model Description

This is a high-level description of the model used in the Expression Exchange simulation. It it intended for audiences
that are not necessarily technical.

Compared to other PhET simulations, the model in this simulation is relatively simple and doesn't include any sort of
numerical calculations relating to physical phenomena.  The simulation is built around simulated objects that can either
be shown as coins or as mathematical terms.  These "coin terms" can be combined into expressions which can then be
edited, combined with other expressions, broken apart, or removed from the play area.  In the case of coin terms of the
same type, these can be combined together and broken apart as well.  The model continually monitors the positions of
coin terms and expressions and turns on various "hints" for the user to let them know what can and can't be combined.
The model makes decisions about when to show hints, when to let coin terms combine, when to form expressions, when to
combine expressions, and when to return coin terms to the "creator box" based on the amount of overlap between the
various items as the are moved about in the play area.

For the game screen, the basic rules of manipulation are similar, but coin terms can't be broken down into smaller
numbers values than when they were initially dragged from the creator box.  For example, if a 2x is created by dragging
it from the creator box, it can't be broken down into two single instances of x.
 
On the game screen, the user makes expressions to match those specified in a set of "collection areas" on the right
hand side of the play area.  The model evaluates the expression and accepts it if it matches the specification and
rejects it if not.  Expressions are considered correct whether or not they are fully reduced.
