angular.module('JSON', []).directive("editobject", function($templateCache) {
    // self template
    var template =
        '<pre>{<span ng-repeat="propertyname in sortedKeysArray(object)"><editpropertyvalue object="object"></editpropertyvalue></span>}</pre>';
    $templateCache.put('editobject.html', template);

    return {
        restrict : 'E',
        //*
        templateUrl: 'editobject.html',
        /*/
         template : template,
         //*/
        scope : {
            object : '='
        },
        controller : function($scope) {
            $scope.sortedKeysArray = function(o) {
                var keysArray = [];
                for (var prop in $scope.object) {
                    if (typeof prop === 'function') {
                        continue;
                    }
                    if (prop == '$$hashKey') {
                        continue;
                    }
                    keysArray.push(prop);
                }
                return keysArray.sort(/* function (a, b) {
                 return a.toLowerCase().localeCompare(b.toLowerCase());
                 } */);
            }
        }
    };
}).directive("editpropertyvalue", function($templateCache) {
    // recursion template
    var subPropertyValueTemplate =
        '<div><div ng-repeat="subObject in propertyValueHolder"><editobjectproperty object="subObject"></editobjectproperty></div></div>'
    $templateCache.put('editsubpropertyvalue.html', subPropertyValueTemplate);

    // self template
    var template =
        '<div><span style="padding-left:15px;">"{{propertyname}}": </span><input type="text" ng-show="isPrimitive()" ng-model="propertyValue" ng-change="propertyValueStyle={\'background-color\':\'yellow\'}" ng-style="propertyValueStyle" editenter="updateProperty()" placeholder="value" title="Type ENTER to update"/><select style="width:1.5em;" ng-model="valueType" ng-options="vt for vt in valueTypeEnum"></select><button ng-visible="removeVisible" ng-click="removeProperty()" title="Remove"><b>-</b></button></span><div style="font-family: monospace;padding-left: 15px" ng-show="isObject()"><div ng-include="\'editsubpropertyvalue.html\'"></div></div><div style="font-family: monospace;padding-left: 15px" ng-show="isArray()">[<br/>]</div></div>';
    $templateCache.put('editpropertyvalue.html', template);

    return {
        restrict : 'E',
        //*
        templateUrl: 'editpropertyvalue.html',
        /*/
         template : template,
         //*/
        scope : {
            object : '='
        },
        controller : function($scope) {
            $scope.propertyname = $scope.$parent.propertyname;
            $scope.propertyValueHolder = [];
            $scope.propertyValue = $scope.object[$scope.propertyname];
            $scope.propertyValueStyle = {};
            $scope.valueTypeEnum = [
                'Primitive',
                'Object',
                'Array'
            ];
            $scope.valueType = $scope.valueTypeEnum[0];
            $scope.operation = '=';
            $scope.operationTitle = 'Update';
            $scope.removeVisibility = false;

            function adjustAddUpdateDisabled() {
                $scope.operation = '=';
                $scope.operationTitle = 'Update';
                $scope.removeVisible = true;
                if (valueToSet($scope.propertyValue) === $scope.object[$scope.propertyname]) {
                    $scope.operationTitle += '(change value to enable)';
                }
            }

            function valueToSet(value) {
                var f = parseFloat(value);
                if (f !== NaN && f == value) {
                    return f;
                } else {
                    var i = parseInt(value);
                    if (i !== NaN && i == value) {
                        return i;
                    }
                }
                return value;
            }

            function watchPropertyValue() {
                if ($scope.propertyValue instanceof Array) {
                    $scope.propertyValueHolder.splice(0,1);
                    $scope.valueType = $scope.valueTypeEnum[2];
                } else if (typeof $scope.propertyValue === 'object') {
                    $scope.propertyValueHolder.push($scope.propertyValue);
                    $scope.valueType = $scope.valueTypeEnum[1];
                } else {
                    $scope.propertyValueHolder.splice(0,1);
                    $scope.valueType = $scope.valueTypeEnum[0];
                }
                adjustAddUpdateDisabled();
            }

            $scope.$watch('object[propertyname]', function() {
                $scope.propertyValue = $scope.object[$scope.propertyname];
            });

            $scope.$watch('propertyValue', watchPropertyValue);

            $scope.$watch('valueType', function() {
                if ($scope.valueType === $scope.valueTypeEnum[2]) {
                    if (!($scope.propertyValue instanceof Array)) {
                        $scope.propertyValue = [];
                        $scope.updateProperty();
                    }
                } else if ($scope.valueType === $scope.valueTypeEnum[1]) {
                    if (typeof $scope.propertyValue !== 'object') {
                        $scope.propertyValue = {};
                        $scope.updateProperty();
                    }
                } else {
                    if (typeof $scope.propertyValue === 'object' || $scope.propertyValue instanceof Array) {
                        $scope.propertyValue = '';
                        $scope.updateProperty();
                    }
                }
            });

            $scope.isPrimitive = function() {
                return ($scope.valueType === $scope.valueTypeEnum[0]);
            }

            $scope.isObject = function() {
                return ($scope.valueType === $scope.valueTypeEnum[1]);
            }

            $scope.isArray = function() {
                return ($scope.valueType === $scope.valueTypeEnum[2]);
            }

            $scope.updateProperty = function() {
                $scope.propertyValueStyle = {};
                if ($scope.valueType == $scope.valueTypeEnum[2]) {
                    $scope.object[$scope.propertyName] = [];
                } else if ($scope.valueType == $scope.valueTypeEnum[1]) {
                    $scope.object[$scope.propertyname] = {};
                } else {
                    $scope.object[$scope.propertyname] = valueToSet($scope.propertyValue);
                }
                adjustAddUpdateDisabled();
            };

            $scope.removeProperty = function() {
                delete $scope.object[$scope.propertyname];
            };

            adjustAddUpdateDisabled();
        }
    };
}).directive("editproperty", function($templateCache) {

    // recursion template
    var subTemplate =
        '<div><div ng-repeat="subProperty in $parent.propertyValueHolder"><editproperty object="subProperty" nojson="true"></editproperty></div></div>'
    $templateCache.put('editsubobject.html', subTemplate);

    // self template
    var template =
        '<div><pre ng-hide="nojson">{{object|sortedjson}}</pre><input type="text" ng-model="propertyName" ng-change="propertyNameStyle={\'background-color\':\'yellow\'}" ng-style="propertyNameStyle" editenter="addProperty()" placeholder="property name" title="Type property name"/><select style="width:1.5em;" ng-hide="onlyadd" ng-model="propertyName" ng-options="p as p for (p,v) in object | removeDollarDollarProperties:this"></select><span>:</span><input type="text" ng-show="isPrimitive()" ng-disabled="onlyadd && addUpdateDisabled" ng-model="propertyValue" ng-change="propertyValueStyle={\'background-color\':\'yellow\'}" ng-style="propertyValueStyle" editenter="addProperty()" placeholder="value" title="Type ENTER to add/update"/><select style="width:1.5em;" ng-hide="onlyadd && addUpdateDisabled" ng-model="valueType" ng-options="vt for vt in valueTypeEnum"></select><label></label></button><button ng-visible="removeVisible" ng-click="removeProperty()" title="Remove"><b>-</b></button><div style="font-family: monospace; padding-left: 15px" ng-show="isObject()"><div ng-include="\'editsubobject.html\'"></div></div><div style="font-family: monospace;; padding-left: 15px" ng-show="isArray()">[<br/>]</div></div>';
    $templateCache.put('editproperty.html', template);

    return {
        restrict : 'E',
        //*
        templateUrl: 'editproperty.html',
        /*/
         template : template,
         //*/
        scope : {
            object : '=',
            nojson: '@',
            onlyadd: '@',
        },
        controller : function($scope) {
            $scope.propertyName = '';
            $scope.propertyNameStyle = {};
            $scope.propertyValue = '';
            $scope.propertyValueHolder = [];
            $scope.propertyValueStyle = {};
            $scope.valueTypeEnum = [
                'Primitive',
                'Object',
                'Array'
            ];
            $scope.valueType = $scope.valueTypeEnum[0];
            $scope.operation = '+';
            $scope.operationTitle = 'Add';
            $scope.addUpdateDisabled = false;
            $scope.removeVisibility = false;

            function adjustAddUpdateDisabled() {
                $scope.addUpdateDisabled = false;
                if ($scope.propertyName === '') {
                    $scope.addUpdateDisabled = true;
                    $scope.operation = '+';
                    $scope.operationTitle = 'Add';
                    $scope.removeVisible = false;
                } else {
                    if ($scope.object.hasOwnProperty($scope.propertyName)) {
                        if ($scope.onlyadd) {
                            $scope.operation = '+';
                            $scope.operationTitle = 'Add';
                            $scope.addUpdateDisabled = true;
                            $scope.removeVisible = false;
                        } else {
                            $scope.operation = '=';
                            $scope.operationTitle = 'Update';
                            $scope.removeVisible = true;
                            if (valueToSet($scope.propertyValue) === $scope.object[$scope.propertyName]) {
                                $scope.addUpdateDisabled = true;
                                $scope.operationTitle += '(change value to enable)';
                            }
                        }
                    } else {
                        $scope.operation = '+';
                        $scope.operationTitle = 'Add';
                        $scope.removeVisible = false;
                    }
                }
            }

            function valueToSet(value) {
                var f = parseFloat(value);
                if (f !== NaN && f == value) {
                    return f;
                } else {
                    var i = parseInt(value);
                    if (i !== NaN && i == value) {
                        return i;
                    }
                }
                return value;
            }

            function watchPropertyValue() {
                if ($scope.propertyValue instanceof Array) {
                    $scope.propertyValueHolder.splice(0,1);
                    $scope.valueType = $scope.valueTypeEnum[2];
                } else if (typeof $scope.propertyValue === 'object') {
                    $scope.propertyValueHolder.push($scope.propertyValue);
                    $scope.valueType = $scope.valueTypeEnum[1];
                } else {
                    $scope.propertyValueHolder.splice(0,1);
                    $scope.valueType = $scope.valueTypeEnum[0];
                }
                adjustAddUpdateDisabled();
            }

            $scope.$watch('object[propertyName]', function() {
                $scope.propertyValue = $scope.object[$scope.propertyName];
            });

            $scope.$watch('propertyValue', watchPropertyValue);

            $scope.$watch('propertyName', function() {
                if ($scope.propertyName !== '' && $scope.object.hasOwnProperty($scope.propertyName)) {
                    $scope.propertyNameStyle = {};
                    $scope.propertyValue = $scope.object[$scope.propertyName];
                } else {
                    $scope.propertyValue = '';
                }
                adjustAddUpdateDisabled();
            });

            $scope.$watch('valueType', function() {
                if ($scope.valueType === $scope.valueTypeEnum[2]) {
                    if (!($scope.propertyValue instanceof Array)) {
                        $scope.propertyValue = [];
                        $scope.addProperty();
                        $scope.valueType = $scope.valueTypeEnum[0];
                    }
                } else if ($scope.valueType === $scope.valueTypeEnum[1]) {
                    if (typeof $scope.propertyValue !== 'object') {
                        $scope.propertyValue = {};
                        $scope.addProperty();
                        $scope.valueType = $scope.valueTypeEnum[0];
                    }
                } else {
                    if (typeof $scope.propertyValue === 'object' || $scope.propertyValue instanceof Array) {
                        $scope.propertyValue = '';
                        $scope.addProperty();
                    }
                }
            });

            $scope.isPrimitive = function() {
                return ($scope.valueType === $scope.valueTypeEnum[0]);
            }

            $scope.isObject = function() {
                return ($scope.valueType === $scope.valueTypeEnum[1]);
            }

            $scope.isArray = function() {
                return ($scope.valueType === $scope.valueTypeEnum[2]);
            }

            $scope.addProperty = function() {
                $scope.propertyNameStyle = {};
                $scope.propertyValueStyle = {};
                if ($scope.valueType == $scope.valueTypeEnum[2]) {
                    $scope.object[$scope.propertyName] = [];
                } else if ($scope.valueType == $scope.valueTypeEnum[1]) {
                    $scope.object[$scope.propertyName] = {};
                } else {
                    $scope.object[$scope.propertyName] = valueToSet($scope.propertyValue);
                }
                if ($scope.onlyadd) {
                    $scope.propertyName = '';
                    $scope.propertyValue = '';
                }
                adjustAddUpdateDisabled();
            };

            $scope.removeProperty = function() {
                delete $scope.object[$scope.propertyName];
                $scope.propertyName = '';
                $scope.propertyValue = '';

                adjustAddUpdateDisabled();
            };

            adjustAddUpdateDisabled();
        }
    };
}).directive("editobjectproperty", function($templateCache) {
    // self template
    var template =
        '<editobject object="object"></editobject><editproperty object="object" nojson="true" onlyadd="true"></editproperty>';
    $templateCache.put('editobjectproperty.html', template);

    return {
        restrict : 'E',
        //*
        templateUrl: 'editobjectproperty.html',
        /*/
         template : template,
         //*/
        scope : {
            object : '='
        }
    };
}).filter('removeDollarDollarProperties', function() {
    return function(input, scope) {
        input = angular.copy(input);
        angular.forEach( input, function(v,k)
        {
            if(k === '$$hashKey') {
                delete input[k];
            }
        });
        return input;
    }
}).filter('sortedjson', function() {
    return function(object) {

        function toJsonReplacer(key, value) {
            var val = value;

            if (/^\$+/.test(key)) {
                val = undefined;
            }

            return val;
        }

        /*
         Further modifications to https://raw.github.com/mirkokiefer/canonical-json/master/index.js
         */

        /*
         The original version of this code is taken from Douglas Crockford's json2.js:
         https://github.com/douglascrockford/JSON-js/blob/master/json2.js

         I made some modifications to ensure a canonical output.
         */

        function f(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            gap,
            indent,
            meta = {    // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"' : '\\"',
                '\\': '\\\\'
            },
            rep;


        function quote(string) {

            // If the string contains no control characters, no quote characters, and no
            // backslash characters, then we can safely slap some quotes around it.
            // Otherwise we must also replace the offending characters with safe escape
            // sequences.

            escapable.lastIndex = 0;
            return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string'
                    ? c
                    : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
        }


        function str(key, holder) {

            // Produce a string from holder[key].

            var i,          // The loop counter.
                k,          // The member key.
                v,          // The member value.
                length,
                mind = gap,
                partial,
                value = holder[key];

            // If the value has a toJSON method, call it to obtain a replacement value.

            if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }

            // If we were called with a replacer function, then call the replacer to
            // obtain a replacement value.

            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }

            // What happens next depends on the value's type.

            switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

                // JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

                // If the value is a boolean or null, convert it to a string. Note:
                // typeof null does not produce 'null'. The case is included here in
                // the remote chance that this gets fixed someday.

                return String(value);

                // If the type is 'object', we might be dealing with an object or an array or
                // null.

            case 'object':

                // Due to a specification blunder in ECMAScript, typeof null is 'object',
                // so watch out for that case.

                if (!value) {
                    return 'null';
                }

                // Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

                // Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

                    // The value is an array. Stringify every element. Use null as a placeholder
                    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

                    // Join all of the elements together, separated with commas, and wrap them in
                    // brackets.

                    v = partial.length === 0
                        ? '[]'
                        : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

                // If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

                    // Otherwise, iterate through all of the keys in the object.
                    var keysSorted = Object.keys(value).sort();
                    for (i in keysSorted) {
                        k = keysSorted[i]
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.

                v = partial.length === 0
                    ? '{}'
                    : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
            }
        }

        // If the JSON object does not yet have a stringify method, give it one.
        var stringify = function (value, replacer, space) {

            // The stringify method takes a value and an optional replacer, and an optional
            // space parameter, and returns a JSON text. The replacer can be a function
            // that can replace values, or an array of strings that will select the keys.
            // A default replacer method can be provided. Use of the space parameter can
            // produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

            // If the space parameter is a number, make an indent string containing that
            // many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

                // If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

            // If there is a replacer, it must be a function or an array.
            // Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

            // Make a fake root object containing our value under the key of ''.
            // Return the result of stringifying the value.

            return str('', {'': value});
        };

        return stringify(object, toJsonReplacer, '  ');
    };
}).directive('ngVisible', function() {
    return function(scope, element, attr) {
        scope.$watch(attr.ngVisible, function(visible) {
            element.css('visibility', visible ? 'visible' : 'hidden');
        });
    };
}).directive('editenter', function() {
    return function(scope, elm, attrs) {
        elm.bind('keypress', function(e) {
            if (e.keyCode === 13) {
                scope[attrs.ngModel] = this.value;
                scope.$apply(attrs.editenter);
            }
        });
    };
});