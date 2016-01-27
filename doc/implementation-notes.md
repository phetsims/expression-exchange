Implementation Notes
====================

TODO: This is a collection of thoughts recorded during the implementation process, and will need to be edited into a
coherent document before the simulation development can be considered complete.

CoinTerm is a fundamental model element, and it represents a thing that can either appear to be a coin or a
mathematical term.  The name is used a lot throughout the code, so it's important to have a clear idea of what it is.
It is a model object with a position, a front and back image to be used for the coin representation, and formula (which
may be as simple as 'x' or as complex as 'x squared times y squared', and several other attributes that define its
behavior and appearance.
