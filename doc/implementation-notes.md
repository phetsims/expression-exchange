Implementation Notes
====================

TODO: This is a collection of thoughts recorded during the implementation process, and will need to be edited into a
coherent document before the simulation development can be considered complete.

There is no MVT.

CoinTerm is a fundamental model element, and it represents a thing that can either appear to be a coin or a
mathematical term.  The name is used a lot throughout the code, so it's important to have a clear idea of what it is.
It is a model object with a position, a front and back image to be used for the coin representation, and formula (which
may be as simple as 'x' or as complex as 'x squared times y squared', and several other attributes that define its
behavior and appearance.

The CoinTerm model element tracks its bounds in the view relative to its position.  This break strict MVC practices,
but worked well for the needs of the sim.

A decision was made that if a coin term overlaps multiple expressions, on the one with the most overlap should have its
hints activated.  This means that the main model has to compare them and decide which one to activate, which means that
this decision must be centralized in the main model rather than leaving it to the coin terms or expressions.

Term: "join zone".

The interactions between coin terms and expressions gets fairly complicated, which results in a fair amount of code to
enforce the behavioral rules, update the various visual cues that indicate what will combine with what when released.
Some of this code had to be hooked to properties, while some of it was implemented in step functions.  The interactions
can be complicated, so it will be important to have a good understanding of such interactions if some of these
behavioral rules need to be changed or fixed.
