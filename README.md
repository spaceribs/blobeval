## Blobeval

An asyncronous, blobworker based, (mostly) safe evaluator and sandbox for untrusted javascript. Some highlights of the system include:

    1. A customizable blacklist system for possibly unsafe functions.
    2. External library importer, for including helpers like Underscore.
    3. Custom context, which sets `this` for the function being evaluated.
    4. Customizable timeout period for evaluation, which prevents infinite looping.
    5. Spawns a new webworker for each evaluation.
    6. Feature detection.