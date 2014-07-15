"use strict";

(function() {

    var Blobeval = {
        version: "0.1"
    };

    // TypeError old chrome and FF
    var BlobBuilder =
        window.BlobBuilder ||
        window.WebKitBlobBuilder ||
        window.MozBlobBuilder ||
        window.MSBlobBuilder;

    var URL = window.URL || window.webkitURL;

    function getFuncBody(func) {
        return func.toString()
            //remove function(){ and }
            .match(/\{([\s\S]*)\}/m)[1]
            //remove whitespace
            .replace(/(^\s+|\s+$)/g,"");
    }

    function getBlobBody(func, blacklist, whitelist) {
        var funcBody = "";
        var bl = blacklist || [];
        var wl = whitelist || [];
        funcBody += "'use strict';\n\n";

        if (wl.length) {
            for (var e = 0; e < wl.length; e++) {
                funcBody += "self.importScripts('" + wl[e] + "');\n";
            }
        }

        funcBody += "\n";

        if (bl.length) {
            for (var i = 0; i < bl.length; i++) {
                funcBody += "self['" + bl[i] + "'] = undefined;\n";
            }
        }

        funcBody += "\n";
        funcBody += getFuncBody(func);

        return funcBody;
    }

    function createWorker(settings, onerror) {

        var blobFunc, blob, blobURL;

        /* jshint ignore:start */
        blobFunc = function (){
            self.onmessage = function(_msg) {
                var scope = _msg.data.scope;
                var func = new Function(_msg.data.func);
                var output = func.call(scope);
                self.postMessage({message: output, scope: scope});
            };
        };
        /* jshint ignore:end */

        var funcBody = getBlobBody(blobFunc, settings.blacklist, settings.includes, true);

        try {
            blob = new Blob([funcBody], { type: "text/javascript" });
        } catch (err) {
            if (err.name === "TypeError" && BlobBuilder){
                var bb = new BlobBuilder();
                bb.append(getBlobBody(blobFunc, true));
                blob = bb.getBlob("text/javascript");
            } else {
                // We're screwed, blob constructor unsupported entirely
                onerror(err);
            }
        }

        blobURL = URL.createObjectURL(blob);

        return new Worker(blobURL);
    }

    function extend(destination, source) {
        for (var property in source) {
            if (source.hasOwnProperty(property)) {
                destination[property] = source[property];
            }
        }
        return destination;
    }

    var defaults = {
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

    Blobeval.evaluate = function (func, onsuccess, onerror, data, options) {

        var evalString, evalTimeout, worker;

        var successCallback = onsuccess || function(){};
        var errorCallback = onerror || function(){};

        var scope = extend({}, data);
        var settings = extend(defaults, options);

        if (typeof func === "function") {
            evalString = getFuncBody(func);
        } else if (typeof func === "string") {
            evalString = func;
        } else {
            errorCallback(new TypeError("Evaluation parameter must be a function or a string."));
            return false;
        }

        if (settings.timeout) {
            evalTimeout = window.setTimeout(function(){
                worker.onerror(new Error("TimeoutError: Evaluation failed after "+settings.timeout+"ms."));
            }, settings.timeout);
        }

        worker = createWorker(settings, errorCallback);

        worker.postMessage({
            func: evalString,
            scope: scope
        });

        worker.onerror = function(err) {
            window.clearTimeout(evalTimeout);
            errorCallback(err);
            worker.terminate();
        };

        worker.onmessage = function(msg){
            window.clearTimeout(evalTimeout);
            successCallback({message: msg.data.message, scope: msg.data.scope});
            worker.terminate();
        };

        return true;

    };

    this.Blobeval = Blobeval;

}).call(this);