## Blobeval

An asyncronous, blobworker based, (mostly) safe evaluator and sandbox for untrusted javascript. Some highlights of the system include:

* A customizable blacklist system for possibly unsafe functions.
* An AngularJS service.
* External library importer, for including helpers like Underscore.
* Custom context, which sets `this` for the function being evaluated.
* Customizable timeout period for evaluation, which prevents infinite looping.
* Spawns a new webworker for each evaluation.
* Feature detection.

The main goal is to allow end users to share content that is submitted as javascript, and run that script on the users browser without worrying that their browser might be hijacked.

## Getting Started

1. Install the bower dependency in your project using `bower install blobeval`, this will grab the library and the angular service.
2. Add the script tag to your HTML, the global `Blobeval` should be available in your console.

## Evaluate

the global `Blobeval.evaluate` can be run using these parameters:

```js
Blobeval.evaluate(func, onsuccess, onerror, data, options);
```

| Parameter | Accepts            | Description                                                                                                                                                                 |
|-----------|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **func**      | *string or function* | A string or function that is to be evaluated, examples are `"return 1+1;"` or `function(){ return 1+1; }`.                                                                  |
| **onsuccess** | *function*           | Callback for successful evaluation, passes in an object containing the return statement as `message` and the transformed data as `scope`.                                   |
| **onerror**   | *function*           | returns a standard `Error` object.                                                                                                                                          |
| **scope**     | *object*             | Data to be made available to the function wrapped in an object. This data can be accessed/edited by the function using `scope.someData` and is returned with the message on success. |
| **options**   | *object*             | Additional configuration options described below                                                                                                                            |
