/**
 */

"use strict";

angular.module("myApp").controller("HomeCtrl", ["$scope", "ngBlobeval", function ($scope, ngBlobeval) {

    $scope.blobEvalOptions = {
        timeout: 1000,
        includes: [],
        blacklist: [
            "Worker",
            "addEventListener",
            "removeEventListener",
            "importScripts",
            "XMLHttpRequest",
            "dispatchEvent",
            "eval"
        ]
    };

    $scope.terminalCallback = function (command, term) {
        if (command !== "") {
            term.pause();

            var promise = ngBlobeval.evaluate(command, $scope.person, $scope.blobEvalOptions);

            promise.then(function(msg) {
                term.echo(msg.message);
                console.log(msg);
                $scope.person = msg.scope;
            }, function(err) {
                term.error(err.message);
            }, function(note) {
                term.echo(note);
            }).finally(function(){
                term.resume();
            });

        } else {
            term.echo("");
        }
    };

    $scope.terminalOptions = {
        greetings: "-- BlobEval Testing",
        name: "js_demo",
        height: 200,
        prompt: "eval> "
    };

    $scope.person = {
        name: "Bob",
        age: 23,
        timestamp: new Date()
    };

    //TODO - put any directive code here
}]);