"use strict";

angular.module("spaceribs.Blobeval", [])
    .factory("ngBlobeval", [ "$q", function ($q) {

        /**
         * @ngdoc method
         * @name evaluate
         * @methodOf composApp.runSafe
         * @callback onSuccess
         * @param {string|function} func The function being evaluated, this can be a javascript function or a string (which will be evaluated as `return "the string";`)
         * @param {object} [scope={}] The data passed to "this" within the function being run. a value of `{x: 10, y: 20}` is accessible in the function as `this.x`. The object will be passed back after evaluation.
         * @param {object=} options Overrides for code evaluation
         * @param {number|boolean=} [options.timeout=1000] If the evaluation takes longer than the milliseconds provided here, it will automatically terminate the worker and return an error. To turn off this feature, set to `0` or `false`.
         * @param {string[]=} [options.includes=test] List of external javascript files to load in before starting the evaluation.
         * @param {string[]=} [options.blacklist=test] Prevent these core functions from being called by the evaluated script.
         * @return {Promise} The $q promise of the evaluation. Use `.then()` to access the callbacks.
         */
        function evaluate(func, scope, options) {
            var deferred = $q.defer();

            var blobEval = Blobeval.evaluate(func, function(success){
                deferred.resolve(success);
            }, function(error){
                deferred.reject(error);
            }, scope, options);

            if (blobEval) {
                deferred.notify('Evaluating...');
            } else {
                deferred.notify('Internal Error Incoming...');
            }

            return deferred.promise;
        }

        return {
            evaluate: evaluate
        };
    }]);