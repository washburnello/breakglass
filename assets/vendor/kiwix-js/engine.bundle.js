(function(){
"use strict";
var __mods={};
function __def(n,d,f){__mods[n]={d:d,f:f}}
function __req(n){var m=__mods[n];if(!m.v){var a=[];for(var i=0;i<m.d.length;i++)a.push(__req(m.d[i]));m.v=m.f.apply(null,a)}return m.v}
var __sc=document.currentScript;
var __LIB_URL=new URL("www/js/lib/",(__sc&&__sc.src)||".").href;
__def("util", [], function(){
/**
 * util.js : Utility functions
 *
 * Copyright 2013-2023 Mossroy, Jaifroid and contributors
 * Licence GPL v3:
 *
 * This file is part of Kiwix.
 *
 * Kiwix is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public Licence as published by
 * the Free Software Foundation, either version 3 of the Licence, or
 * (at your option) any later version.
 *
 * Kiwix is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public Licence for more details.
 *
 * You should have received a copy of the GNU General Public Licence
 * along with Kiwix (file LICENSE-GPLv3.txt).  If not, see <http://www.gnu.org/licenses/>
 */

'use strict';

var regExpFindStringParts = /(?:^|.+?)(?:[\s$£€\uFFE5^+=`~<>{}[\]|\u3000-\u303F!-#%-\x2A,-/:;\x3F@\x5B-\x5D_\x7B}\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E3B\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]+|$)/g;

/**
 * Generates an array of strings with all possible combinations of first-letter or all-letter case transformations
 * If caseMatchType is not 'full', then only combinations of first-letter cases for each word are calculated
 * If caseMatchType is 'full', then all-uppercase combinations of each word are added to the variations array
 * NB may produce duplicate strings if string begins with punctuation or if it is in a language with no case
 * @param {String} string The string to be converted
 * @param {String} caseMatchType ('basic'|'full') The type (complexity) of case variations to calculate
 * @return {Array} An array containing strings with all possible combinations of case types
 */
function allCaseFirstLetters (string, caseMatchType) {
    if (string) {
        var comboArray = [];
        // Split string into parts beginning with first word letters
        var strParts = string.match(regExpFindStringParts);
        // Prevent a full search if we have more than 6 string parts
        if (strParts.length > 6) caseMatchType = 'basic';
        // Set the base (binary or ternary) according to the complexity of the search
        var base = caseMatchType === 'full' ? 3 : 2;
        // If n = strParts.length, then the number of possible case combinations (numCombos) is base ^ n
        // For *basic* case calculation: think of numCombos as a binary number of n bits, with each bit representing lcase (0) or ucase (1)
        // For *full* case calculation: think of numCombos as a tertiary base number, e.g. 000, 111, 222,
        // with each bit representing all-lowercase (0), First-Letter-Uppercase (1) or ALL-UPPERCASE (2)
        var numCombos = Math.pow(base, strParts.length);
        // Prevent more than 1024 combinations (2^10) being calculated
        if (numCombos > 1024) numCombos = 1024;
        var typeCase, mixedTypeCaseStr, bitmask, caseBit;
        // Iterate through every possible combination, starting with (base ^ n) - 1 and decreasing; we go from high to low,
        // because title case (e.g. binary 1111) is more common than all lowercase (0000) so will be found first
        for (var i = numCombos; i--;) {
            mixedTypeCaseStr = '';
            bitmask = 1;
            for (var j = 0; j < strParts.length; j++) {
                // Get modulus of division (this is equivalent to bitwise AND for different bases)
                // caseBit will be 0, 1 or 2 (latter only for 'full' case calcualation)
                caseBit = ~~(i / bitmask % base);
                if (caseBit === 2) {
                    // All uppercase
                    typeCase = strParts[j].toLocaleUpperCase();
                } else {
                    // Modify only first letter
                    typeCase = strParts[j].replace(/^./, function (m) {
                        // 1 = uppercase, 0 = lowercase
                        return caseBit ? m.toLocaleUpperCase() : m.toLocaleLowerCase();
                    });
                }
                mixedTypeCaseStr += typeCase;
                // Shift bitmask to the next higher bit
                bitmask *= base;
            }
            comboArray.push(mixedTypeCaseStr);
        }
        return comboArray;
    } else {
        return [string];
    }
}

/**
 * Generates an array of Strings, where all duplicates have been removed
 * (without changing the order)
 * It is optimized for small arrays.
 * Source : http://codereview.stackexchange.com/questions/60128/removing-duplicates-from-an-array-quickly
 * @param {Array} array of String
 * @returns {Array} same array of Strings, without duplicates
 */
function removeDuplicateStringsInSmallArray (array) {
    var unique = [];
    for (var i = 0; i < array.length; i++) {
        var current = array[i];
        if (unique.indexOf(current) < 0) {
            unique.push(current);
        }
    }
    return unique;
}

/**
 * Utility function : return true if the given string ends with the suffix
 * @param {String} str
 * @param {String} suffix
 * @returns {Boolean}
 */
function endsWith (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

/**
 * Read a float encoded in 2 bytes
 * @param {Array} byteArray
 * @param {Integer} firstIndex
 * @param {Boolean} littleEndian (optional)
 * @returns {Float}
 */
function readFloatFrom4Bytes (byteArray, firstIndex, littleEndian) {
    var dataView = new DataView(byteArray.buffer, firstIndex, 4);
    var float = dataView.getFloat32(0, littleEndian);
    return float;
}

/**
 * Reads a Uint8Array from the given file starting at byte offset begin until end
 * @param {File} file The file object to be read
 * @param {Integer} begin The offset in <File> at which to begin reading
 * @param {Integer} end The byte at whcih to stop reading (reads up to and including end - 1)
 * @returns {Promise<Uint8Array>} A Promise for an array buffer with the read data
 */
function readFileSlice (file, begin, end) {
    if (file.slice && 'arrayBuffer' in Blob.prototype) {
        // DEV: This method uses the native arrayBuffer method of Blob, if available, as it eliminates
        // the need to use FileReader and set up event listeners; it also uses the method's native Promise
        // rather than setting up potentially hundreds of new Q promises for small byte range reads
        // Also uses Native FS handle
        return file.slice(begin, end).arrayBuffer().then(function (buffer) {
            return new Uint8Array(buffer);
        });
    } else {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.readAsArrayBuffer(file.slice(begin, end));
            reader.addEventListener('load', function (e) {
                resolve(new Uint8Array(e.target.result));
            });
            reader.addEventListener('error', reject);
            reader.addEventListener('abort', reject);
        });
    }
}

/**
 * Performs a binary search on indices begin <= i < end, utilizing query(i) to return where to
 * continue the search.
 * If lowerBound is not set, returns only indices where query returns 0 and null otherwise.
 * If lowerBound is set, returns the smallest index where query does not return > 0.
 * @param {Integer} begin The beginning of the search window
 * @param {Integer} end The end of the search window
 * @param {Function} query The query to run to test the current point in the window
 * @param {Boolean} lowerBound Determines the type of search
 * @returns {Promise} Promise for the lowest dirEntry that fulfils (or fails to fulfil) the query
 */
function binarySearch (begin, end, query, lowerBound) {
    if (end <= begin) {
        return lowerBound ? begin : null;
    }
    var mid = Math.floor((begin + end) / 2);
    return query(mid).then(function (decision) {
        if (decision < 0) {
            return binarySearch(begin, mid, query, lowerBound);
        } else if (decision > 0) {
            return binarySearch(mid + 1, end, query, lowerBound);
        } else {
            return mid;
        }
    });
}

/**
 * Does a "left shift" on an integer.
 * It is equivalent to int << bits (which works only on 32-bit integers),
 * but compatible with 64-bit integers.
 *
 * @param {Integer} int
 * @param {Integer} bits
 * @returns {Integer}
 */
function leftShift (int, bits) {
    return int * Math.pow(2, bits);
}

/**
 * Converts base 64 code to Uint6
 * From https://developer.mozilla.org/en-US/docs/Glossary/Base64
 * @param {Integer} nChr Numerical character code
 * @returns {Integer} Converted character code
 */
function b64ToUint6 (nChr) {
    return nChr > 64 && nChr < 91
        ? nChr - 65
        : nChr > 96 && nChr < 123
        ? nChr - 71
        : nChr > 47 && nChr < 58
        ? nChr + 4
        : nChr === 43
        ? 62
        : nChr === 47
        ? 63
        : 0;
}

/**
 * Recommended rewrite of the faulty .btoa() function in JavaScript because of the problem with UTF-8-encoded data
 * From https://developer.mozilla.org/en-US/docs/Glossary/Base64
 * @param {String} sBase64 Base 64 encoded string
 * @param {Integer} nBlocksSize Optional block size
 * @returns {Uint8Array} A Uint8Array containing the converted data
 */
function base64DecToArr (sBase64, nBlocksSize) {
    var sB64Enc = sBase64.replace(/[^A-Za-z0-9+/]/g, ''),
        nInLen = sB64Enc.length,
        nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
        taBytes = new Uint8Array(nOutLen);
    for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
        nMod4 = nInIdx & 3;
        nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 6 * (3 - nMod4);
        if (nMod4 === 3 || nInLen - nInIdx === 1) {
            for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
                taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
            }
            nUint24 = 0;
        }
    }
    return taBytes;
}

/**
 Converts a dataURI to Uint8Array
 * @param {String} dataURI The data URI to convert
 * @returns {Uint8Array} A Uint8Array with the converted buffer
 */
function dataURItoUint8Array (dataURI) {
    var parsedString = dataURI.match(/^data:([^,]*),(.*)/i);
    if (parsedString && /base64/i.test(parsedString[1])) {
        return base64DecToArr(parsedString[2]);
    } else {
        var byteString = decodeURI(parsedString[2]);
        var ab = [];
        for (var i = 0; i < byteString.length; i++) {
            ab[i] = byteString.charCodeAt(i);
        }
        return new Uint8Array(ab);
    }
}

/**
 * Queues Promise Factories* to be resolved or rejected sequentially. This helps to avoid overlapping Promise functions.
 * Primarily used by uiUtil.systemAlert, to prevent alerts showing while others are being displayed.
 *
 *   *A Promise Factory is merely a Promise wrapped in a function to prevent it from executing immediately. E.g. to use
 *   this function with a Promise, call it like this (or, more likely, use your own pre-wrapped Promise):
 *
 *      return util.PromiseQueue.enqueue(function () {
 *          return new Promise(function (resolve, reject) { ... });
 *      });
 *
 * Adapted from https://medium.com/@karenmarkosyan/how-to-manage-promises-into-dynamic-queue-with-vanilla-javascript-9d0d1f8d4df5
 *
 * @type {Object} PromiseQueue
 * @property {Function} enqueue Queues a Promise Factory. Call this function repeatedly to queue Promises sequentially
 * @param {Function<Promise>} promiseFactory A Promise wrapped in an ordinary function
 * @returns {Promise} A Promise that resolves or rejects with the resolved/rejected value of the Promise Factory
 */
var PromiseQueue = {
    _queue: [],
    _working: false,
    enqueue: function (promiseFactory) {
        var that = this;
        return new Promise(function (resolve, reject) {
            // Don't allow more than four dialogues to queue up
            if (that._queue.length >= 4) reject(new Error('PromiseQueue: queue length exceeded'));
            else that._queue.push({ promise: promiseFactory, resolve: resolve, reject: reject });
            if (!that._working) that._dequeue();
        });
    },
    _dequeue: function () {
        this._working = true;
        var deferred = this._queue.shift();
        if (!deferred) {
            this._working = false;
            return false;
        }
        var that = this;
        return deferred.promise().then(function (val) {
            deferred.resolve(val);
            return that._dequeue();
        }).catch(function (err) {
            deferred.reject(err);
            return that._dequeue();
        });
    }
};

/**
 * Get Promise for a JSON object from a given JSONP URL (a JSON-formatted script with a function that returns the JSON object)
 *
 * @param {string} url The URL (JSONP file) from which to get the JSON object
 * @returns {Promise<Object>} A Promise that will be resolved when the JSON object has been loaded, or rejected with the error message
 */
function getJSONPObject (url) {
    return new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.onload = function () {
            resolve(document.localeJson);
            // Remove the objects from the DOM to avoid memory leaks
            delete document.localeJson;
            document.body.removeChild(script);
        };
        script.onerror = function () {
            reject(new Error('Cannot load translation strings from ' + url));
            document.body.removeChild(script);
        };
        script.src = url;
        document.body.appendChild(script);
    });
}

return {
    allCaseFirstLetters: allCaseFirstLetters,
    removeDuplicateStringsInSmallArray: removeDuplicateStringsInSmallArray,
    dataURItoUint8Array: dataURItoUint8Array,
    endsWith: endsWith,
    readFloatFrom4Bytes: readFloatFrom4Bytes,
    readFileSlice: readFileSlice,
    binarySearch: binarySearch,
    leftShift: leftShift,
    PromiseQueue: PromiseQueue,
    getJSONPObject: getJSONPObject
};
});
__def("utf8", [], function(){
/**
 * utf8.js : UTF8 conversion functions
 * Original code from http://stackoverflow.com/users/553542/kadm , taken from
 * http://stackoverflow.com/questions/1240408/reading-bytes-from-a-javascript-string
 *
 * Copyright 2013-2014 Mossroy and contributors
 * Licence GPL v3:
 *
 * This file is part of Kiwix.
 *
 * Kiwix is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public Licence as published by
 * the Free Software Foundation, either version 3 of the Licence, or
 * (at your option) any later version.
 *
 * Kiwix is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public Licence for more details.
 *
 * You should have received a copy of the GNU General Public Licence
 * along with Kiwix (file LICENSE-GPLv3.txt).  If not, see <http://www.gnu.org/licenses/>
 */

'use strict';

var utf8 = {};

/**
 * Convert a String into a byte Array, with UTF8 encoding
 * @param {String} str
 * @returns {Array}
 */
utf8.toByteArray = function (str) {
    var byteArray = [];
    for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) <= 0x7F) {
            byteArray.push(str.charCodeAt(i));
        } else {
            var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
            for (var j = 0; j < h.length; j++) {
                byteArray.push(parseInt(h[j], 16));
            }
        }
    }
    return byteArray;
};

/**
 * Convert a byte Array into a String, with UTF8 encoding
 * @param {Array} data
 * @param {Boolean} zeroTerminated
 * @returns {String}
 */
utf8.parse = function (data, zeroTerminated) {
    var u0, u1, u2, u3, u4, u5;

    var str = '';
    for (var idx = 0; idx < data.length;) {
        u0 = data[idx++];
        if (u0 === 0 && zeroTerminated) {
            break;
        }
        if (!(u0 & 0x80)) {
            str += String.fromCharCode(u0);
            continue;
        }
        u1 = data[idx++] & 63;
        if ((u0 & 0xe0) == 0xc0) {
            str += String.fromCharCode(((u0 & 31) << 6) | u1);
            continue;
        }
        u2 = data[idx++] & 63;
        if ((u0 & 0xf0) == 0xe0) {
            u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
        } else {
            u3 = data[idx++] & 63;
            if ((u0 & 0xF8) == 0xF0) {
                u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | u3;
            } else {
                u4 = data[idx++] & 63;
                if ((u0 & 0xFC) == 0xF8) {
                    u0 = ((u0 & 3) << 24) | (u1 << 18) | (u2 << 12) | (u3 << 6) | u4;
                } else {
                    u5 = data[idx++] & 63;
                    u0 = ((u0 & 1) << 30) | (u1 << 24) | (u2 << 18) | (u3 << 12) | (u4 << 6) | u5;
                }
            }
        }
        if (u0 < 0x10000) {
            str += String.fromCharCode(u0);
        } else {
            var ch = u0 - 0x10000;
            str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
        }
    }
    return str;
};

return {
    toByteArray: utf8.toByteArray,
    parse: utf8.parse
};
});
__def("translateUI", ['util'], function(util){
/**
 * translateUi.js : Translation of the user interface
 *
 * Copyright 2023 Jaifroid and contributors
 * Licence GPL v3:
 *
 * This file is part of Kiwix.
 *
 * Kiwix is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public Licence as published by
 * the Free Software Foundation, either version 3 of the Licence, or
 * (at your option) any later version.
 *
 * Kiwix is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public Licence for more details.
 *
 * You should have received a copy of the GNU General Public Licence
 * along with Kiwix (file LICENSE-GPLv3.txt).  If not, see <http://www.gnu.org/licenses/>
 */

'use strict';

// DEV: We are currently not using any features of i18next that cannot be provided simply by loading the translation strings
// and looking up the key in the object. If you need more features, you can switch to using i18next by installing it, importing
// it here, and using the commented-out code below. Instead of currentLanguage[string], use i18next.t(string). You will also need
// to add a dependency on i18next in /scripts/gitignore.patch. To support IE11 and older browsers, you should use a version of
// i18next that is no higher than 14.0.

// import i18next from '../../../node_modules/i18next/dist/es/i18next.js';

var currentLanguage = {};

// Fallbacks come from the HTML, which is in English by default
var fallback = true;
// DEV: Uncomment line below to force placeholder (useful when writing new translations)
// fallback = false;

// Load the translation strings as a JSONP object for a given language code
function loadTranslationStrings (langCode) {
    // Ensure the language code is safe to use as part of a URL
    langCode = encodeURI(langCode);
    if (!/^[a-zA-Z]{2,4}$/.test(langCode)) {
        return Promise.reject(new Error('Invalid language code: ' + langCode));
    }
    return util.getJSONPObject('../i18n/' + langCode + '.jsonp.js').then(function (translations) {
        currentLanguage = translations[langCode]['translation'];
        // i18next.init({
        //     lng: langCode, // if you're using a language detector, do not define the lng option
        //     debug: true,
        //     resources: translations
        // });
    }).catch(function (err) {
        console.error('Error loading translation strings for language code ' + langCode, err);
        throw err;
    });
}

// Check if a translation exists for a given key
function exists (key) {
    return currentLanguage[key] !== undefined;
};

// Translate a single string
function translateString (string) {
    return (!fallback || exists(string)) ? currentLanguage[string] : '';
}

// Translate the UI
function translateApp (languageCode) {
    // Load the translation strings for the given language code
    return loadTranslationStrings(languageCode).then(function () {
        document.querySelectorAll('[data-i18n]').forEach(function (element) {
            var key = element.dataset.i18n;
            if (!fallback || exists(key)) {
                element.innerHTML = currentLanguage[key];
            }
        });
        document.querySelectorAll('[data-i18n-tip]').forEach(function (element) {
            var key = element.dataset.i18nTip;
            if (!fallback || exists(key)) {
                element.title = currentLanguage[key];
            }
        });
        document.getElementById('prefix').setAttribute('placeholder',
            translateString('home-prefix-placeholder') || 'Search...');
    }).catch(function (err) {
        console.error('Error translating the UI', err);
        throw err;
    });
}

return {
    t: translateString,
    translateApp: translateApp
};
});
__def("settingsStore", [], function(){
'use strict';

/* global params */

var regexpCookieKeysToMigrate = new RegExp([
    'hideActiveContentWarning', 'showUIAnimations', 'appTheme', 'useCache',
    'contentInjectionMode', 'listOfArchives', 'lastSelectedArchive'
].join('|'));

/**
 * A list of deprecated keys that should be removed. Add any further keys to the list of strings separated by a comma.
 * @type {Array}
 */
var deprecatedKeys = [
    'lastContentInjectionMode',
    'useCache'
];

/**
 * The prefix that will be added to keys when stored in localStorage: this is used to prevent
 * potential collision of key names with localStorage keys used by code inside ZIM archives
 * It is set in init.js because it is needed early in app loading
 * @type {String}
 */
var keyPrefix = params.keyPrefix;

// Tests for available Storage APIs (document.cookie or localStorage) and returns the best available of these
function getBestAvailableStorageAPI() {
    // DEV: In FF extensions, cookies are blocked since at least FF 68.6 but possibly since FF 55 [kiwix-js #612]
    var type = 'none';
    // First test for localStorage API support
    var localStorageTest;
    try {
        localStorageTest = 'localStorage' in window && window['localStorage'] !== null;
        // DEV: Above test returns true in IE11 running from file:// protocol, but attempting to write a key to
        // localStorage causes an exception; so to test fully, we must now attempt to write and remove a test key
        if (localStorageTest) {
            localStorage.setItem('tempKiwixStorageTest', '');
            localStorage.removeItem('tempKiwixStorageTest');
        }
    } catch (e) {
        localStorageTest = false;
        console.warn('localStorage not supported in this context', e);
    }
    // Now test for document.cookie API support
    document.cookie = 'tempKiwixCookieTest=working; expires=Fri, 31 Dec 9999 23:59:59 GMT; SameSite=Strict';
    var kiwixCookieTest = /tempKiwixCookieTest=working/.test(document.cookie);
    // Remove test value by expiring the key
    document.cookie = 'tempKiwixCookieTest=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    if (kiwixCookieTest) type = 'cookie';
    // Prefer localStorage if supported due to some platforms removing cookies once the session ends in some contexts
    if (localStorageTest) type = 'local_storage';
    // If both cookies and localStorage are supported, and document.cookie contains keys to migrate,
    // migrate settings to use localStorage
    if (kiwixCookieTest && localStorageTest && regexpCookieKeysToMigrate.test(document.cookie)) _migrateStorageSettings();
    // Remove any deprecated keys
    deprecatedKeys.forEach(function (key) {
        if (localStorageTest) localStorage.removeItem(keyPrefix + key);
        settingsStore.removeItem(key); // Because this runs before we have returned a store type, this will remove from cookie too
    });
    // Note that if this function returns 'none', the cookie implementations below will run anyway. This is because storing a cookie
    // does not cause an exception even if cookies are blocked in some contexts, whereas accessing localStorage may cause an exception
    return type;
}

/**
 * Performs a full app reset, deleting all caches and settings
 * Or, if a parameter is supplied, deletes or disables the object
 * @param {String} object Optional name of the object to disable or delete ('cookie', 'localStorage', 'indexedDB', 'cacheAPI')
 */

function reset (object) {
    // Helper function to handle reload after all operations
    var shouldReload = function() {
        return !object || params.appCache;
    };

    // 1. Clear any cookie entries
    if (!object || object === 'cookie') {
        var regexpCookieKeys = /(?:^|;)\s*([^=]+)=([^;]*)/ig;
        var currentCookie = document.cookie;
        var foundCrumb = false;
        var cookieCrumb = regexpCookieKeys.exec(currentCookie);
        while (cookieCrumb !== null) {
            foundCrumb = true;
            document.cookie = cookieCrumb[1] + '=;expires=Thu, 21 Sep 1979 00:00:01 UTC;';
            cookieCrumb = regexpCookieKeys.exec(currentCookie);
        }
        if (foundCrumb) console.debug('All cookie keys were expired...');
    }

    // 2. Clear any localStorage settings
    if (!object || object === 'localStorage') {
        if (params.storeType === 'local_storage') {
            localStorage.clear();
            console.debug('All Local Storage settings were deleted...');
        }
    }

    // 3. Clear any IndexedDB databases
    var indexedDBPromise = Promise.resolve();
    if (!object || object === 'indexedDB') {
        if (window.indexedDB) {
            if (indexedDB.databases) {
                indexedDBPromise = indexedDB.databases().then(function (dbs) {
                    var deletePromises = dbs.map(function(db) {
                        if (!db.name) return Promise.resolve(); 
                        console.debug('Deleting ' + db.name + '...');
                        return new Promise(function(resolve) {
                            var req = indexedDB.deleteDatabase(db.name);
                            req.onsuccess = resolve;
                            req.onerror = resolve;
                            req.onblocked = function(ev) { 
                                console.warn('IDB delete blocked: ' + db.name, ev);
                                resolve();
                            };
                        });
                    });
                    return Promise.all(deletePromises);
                }).then(function() {
                    console.debug('Deleted all indexedDB databases...');
                }).catch(function (err) {
                    console.error('Error deleting indexedDB databases', err);
                });
            } else {
                // For Firefox
                var dbNames = [params.cacheIDB, 'collDB'];
                var deletePromises = dbNames.map(function(dbName) {
                    if (!dbName) return Promise.resolve(); 
                    return new Promise(function(resolve) {
                        var deleteRequest = indexedDB.deleteDatabase(dbName);
                        deleteRequest.onsuccess = function () {
                            console.debug('Deleted ' + dbName + '...');
                            resolve();
                        };
                        deleteRequest.onerror = function (ev) {
                            console.error('Error deleting ' + dbName + '...', ev);
                            resolve();
                        };
                        deleteRequest.onblocked = function(ev) {
                            console.warn('IDB delete blocked: ' + dbName, ev);
                            resolve();
                        };
                    });
                });
                indexedDBPromise = Promise.all(deletePromises);
            }
        }
    }

    // 4. Clear any Cache API caches - delete ALL caches (no filter)
    var cachePromise = Promise.resolve();
    if (!object || object === 'cacheAPI') {
        if ('caches' in window) {
            cachePromise = caches.keys().then(function (cacheNames) {
                if (cacheNames && cacheNames.length > 0) {
                    var deletePromises = cacheNames.map(function (cacheName) {
                        console.debug('Deleting cache: ' + cacheName);
                        return caches.delete(cacheName);
                    });
                    return Promise.all(deletePromises);
                }
            }).then(function () {
                console.debug('All Cache API caches were deleted...');
            }).catch(function (err) {
                console.error('Error deleting caches:', err);
            });
        } else {
            console.debug('Cache API not available');
        }
    }

    // Wait for all async operations to complete before reloading
    Promise.all([indexedDBPromise, cachePromise]).then(function() {
        if (shouldReload()) {
            _reloadApp();
        }
    }).catch(function(err) {
        console.error('Error during reset:', err);
        if (shouldReload()) {
            _reloadApp();
        }
    });
}

// Gets cache names from Service Worker, as we cannot rely on having them in params.cacheNames
function getCacheNames(callback) {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        var channel = new MessageChannel();
        channel.port1.onmessage = function (event) {
            var names = event.data;
            callback(names);
        };
        navigator.serviceWorker.controller.postMessage({
            action: 'getCacheNames'
        }, [channel.port2]);
    } else {
        callback(null);
    }
}

// Deregisters all Service Workers and reboots the app
function _reloadApp() {
    var reboot = function () {
        console.debug('Performing app reload...');
        setTimeout(function () {
            window.location.href = location.origin + location.pathname + uriParams
        }, 300);
    };
    // Blank the querystring, so that parameters are not set on reload
    var uriParams = '';
    if (~window.location.href.indexOf(params.PWAServer) && params.referrerExtensionURL) {
    // However, if we're in a PWA that was called from local code, then by definition we must remain in SW mode and we need to
    // ensure the user still has access to the referrerExtensionURL (so they can get back to local code from the UI)
        uriParams = '?allowInternetAccess=true&contentInjectionMode=serviceworker';
        uriParams += '&referrerExtensionURL=' + encodeURIComponent(params.referrerExtensionURL);
    }
    if (navigator && navigator.serviceWorker) {
        console.debug('Deregistering Service Workers...');
        var cnt = 0;
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
            if (!registrations.length) {
                reboot();
                return;
            }
            cnt++;
            registrations.forEach(function (registration) {
                registration.unregister().then(function () {
                    cnt--;
                    if (!cnt) {
                        console.debug('All Service Workers unregistered...');
                        reboot();
                    }
                }).catch(function (err) {
                    console.error(err);
                    reboot();
                });
            });
        }).catch(function (err) {
            console.error(err);
            reboot();
        });
    } else {
        console.debug('Performing app reload...');
        reboot();
    }
}

var settingsStore = {
    getItem: function (sKey) {
        if (!sKey) {
            return null;
        }
        if (params.storeType !== 'local_storage') {
            return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(sKey).replace(/[-.+*\\]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
        } else {
            return localStorage.getItem(keyPrefix + sKey);
        }
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (params.storeType !== 'local_storage') {
            if (!sKey || /^(?:expires|max-age|path|domain|secure)$/i.test(sKey)) {
                return false;
            }
            var sExpires = '';
            if (vEnd) {
                switch (vEnd.constructor) {
                    case Number:
                        sExpires = vEnd === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + vEnd;
                        break;
                    case String:
                        sExpires = '; expires=' + vEnd;
                        break;
                    case Date:
                        sExpires = '; expires=' + vEnd.toUTCString();
                        break;
                }
            }
            document.cookie = encodeURIComponent(sKey) + '=' + encodeURIComponent(sValue) + sExpires + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '') + (bSecure ? '; secure' : '');
        } else {
            localStorage.setItem(keyPrefix + sKey, sValue);
        }
        return true;
    },
    removeItem: function (sKey, sPath, sDomain) {
        if (!this.hasItem(sKey)) {
            return false;
        }
        if (params.storeType !== 'local_storage') {
            document.cookie = encodeURIComponent(sKey) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '');
        } else {
            localStorage.removeItem(keyPrefix + sKey);
        }
        return true;
    },
    hasItem: function (sKey) {
        if (!sKey) {
            return false;
        }
        if (params.storeType !== 'local_storage') {
            return (new RegExp('(?:^|;\\s*)' + encodeURIComponent(sKey).replace(/[-.+*\\]/g, '\\$&') + '\\s*\\=')).test(document.cookie);
        } else {
            return localStorage.getItem(keyPrefix + sKey) !== null;
        }
    },
    _cookieKeys: function () {
        // Disabling linter check because this is library code
        // eslint-disable-next-line no-useless-backreference
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^=]+)(?=;|$)|^\s*|\s*(?:=[^;]*)?(?:\1|$)/g, '').split(/\s*(?:=[^;]*)?;\s*/);
        for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
            aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
        }
        return aKeys;
    }
};

// One-off migration of storage settings from cookies to localStorage
function _migrateStorageSettings() {
    console.log('Migrating Settings Store from cookies to localStorage...');
    var cookieKeys = settingsStore._cookieKeys();
    // Note that because migration occurs before setting params.storeType, settingsStore.getItem() will get the item from
    // document.cookie instead of localStorage, which is the intended behaviour
    for (var i = 0; i < cookieKeys.length; i++) {
        if (regexpCookieKeysToMigrate.test(cookieKeys[i])) {
            var migratedKey = keyPrefix + cookieKeys[i];
            localStorage.setItem(migratedKey, settingsStore.getItem(cookieKeys[i]));
            settingsStore.removeItem(cookieKeys[i]);
            console.log('- ' + migratedKey);
        }
    }
    console.log('Migration done.');
}

return {
    getItem: settingsStore.getItem,
    setItem: settingsStore.setItem,
    removeItem: settingsStore.removeItem,
    hasItem: settingsStore.hasItem,
    getCacheNames: getCacheNames,
    reset: reset,
    getBestAvailableStorageAPI: getBestAvailableStorageAPI
};
});
__def("uiUtil", ['util', 'settingsStore', 'translateUI'], function(util, settingsStore, translateUI){
/**
 * uiUtil.js : Utility functions for the User Interface
 *
 * Copyright 2013-2024 Mossroy, Jaifroid and contributors
 * Licence GPL v3:
 *
 * This file is part of Kiwix.
 *
 * Kiwix is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public Licence as published by
 * the Free Software Foundation, either version 3 of the Licence, or
 * (at your option) any later version.
 *
 * Kiwix is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public Licence for more details.
 *
 * You should have received a copy of the GNU General Public Licence
 * along with Kiwix (file LICENSE-GPLv3.txt).  If not, see <http://www.gnu.org/licenses/>
 */

'use strict';

/* global webpMachine, webpHero, params */




// Placeholders for the article container and the article window
const header = document.getElementById('top');
const footer = document.getElementById('footer');
const activeContent = document.getElementById('activeContent');
let articleContainer = document.getElementById('articleContent');

/**
 * Hides slide-away UI elements
 */
function hideSlidingUIElements () {
    const articleContainer = document.getElementById('articleContent');
    const articleElement = document.querySelector('article');
    const footerStyles = getComputedStyle(footer);
    const footerHeight = parseFloat(footerStyles.height) + parseFloat(footerStyles.marginTop) - 2;
    const headerStyles = getComputedStyle(header);
    const headerHeight = parseFloat(headerStyles.height) + parseFloat(headerStyles.marginBottom) + 8;
    const iframeHeight = parseFloat(articleElement.style.height.replace('px', ''));
    footer.style.transform = 'translateY(' + footerHeight + 'px)';
    articleContainer.style.height = iframeHeight + headerHeight + 'px';
    header.style.transform = 'translateY(-' + headerHeight + 'px)';
    articleElement.style.transform = 'translateY(-' + headerHeight + 'px)';
    hideActiveContentWarning();
}

/**
 * Restores slide-away UI elements
 */
function showSlidingUIElements () {
    const articleContainer = document.getElementById('articleContent');
    const articleElement = document.querySelector('article');
    const headerStyles = getComputedStyle(document.getElementById('top'));
    const headerHeight = parseFloat(headerStyles.height) + parseFloat(headerStyles.marginBottom) - 2;
    header.style.transform = 'translateY(0)';
    // Needed for Windows Mobile to prevent header disappearing beneath iframe
    articleElement.style.transform = 'translateY(-1px)';
    footer.style.transform = 'translateY(0)';
    articleElement.style.height = window.innerHeight - headerHeight + 'px';
    articleContainer.style.height = window.innerHeight - headerHeight + 'px';
}

let scrollThrottle = false;

/**
 * Luuncher for the slide-away function, including a throttle to prevent it being called too often
 */
function scroller (e) {
    // We have to refresh the articleContainer when the window changes
    articleContainer = document.getElementById('articleContent');
    // Get the replay_iframe if it exists
    if (articleContainer.contentWindow && articleContainer.contentWindow.document && articleContainer.contentWindow.document.getElementById('replay_iframe')) {
        articleContainer = articleContainer.contentWindow.document.getElementById('replay_iframe');
    }
    if (scrollThrottle) return;
    // windowIsScrollable gets set and reset in slideAway()
    if (windowIsScrollable && e.type === 'wheel') return;
    const newScrollY = articleContainer.contentWindow.pageYOffset;
    // If it's a non-scroll event and we're actually scrolling, get out of the way and let the scroll event handle it
    if ((/^touch|^wheel|^keydown/.test(e.type)) && newScrollY !== oldScrollY) {
        oldScrollY = newScrollY;
        return;
    }
    if (e.type === 'touchstart') {
        oldTouchY = e.touches[0].screenY;
        return;
    }
    scrollThrottle = true;
    // Call the main function
    slideAway(e);
    // Set timeouts for the throttle
    let timeout = 250;
    if (/^touch|^keydown/.test(e.type)) {
        scrollThrottle = false;
        return;
    } else if (e.type === 'wheel' && Math.abs(e.deltaY) > 6) {
        timeout = 1200;
    }
    setTimeout(function () {
        scrollThrottle = false;
    }, timeout);
};

// Edge Legacy requires setting the z-index of the header to prevent it disappearing beneath the iframe
if ('MSBlobBuilder' in window) {
    header.style.position = 'relative';
    header.style.zIndex = 1;
}

let oldScrollY = 0;
let oldTouchY = 0;
let timeoutResetScrollable;
let windowIsScrollable = false;

// Slides away or restores the header and footer
function slideAway (e) {
    const newScrollY = articleContainer.contentWindow.pageYOffset;
    let delta;
    const visibleState = /\(0p?x?\)/.test(header.style.transform);
    // If the search field is focused and elements are not showing, do not slide away
    if (document.activeElement === document.getElementById('prefix')) {
        if (!visibleState) showSlidingUIElements();
    } else if (e.type === 'scroll') {
        windowIsScrollable = true;
        if (newScrollY === oldScrollY) return;
        if (newScrollY < oldScrollY) {
            showSlidingUIElements();
        } else if (newScrollY - oldScrollY > 50 && /\(0p?x?\)/.test(header.style.transform)) {
            // Hide the toolbars if user has scrolled and not already hidden
            hideSlidingUIElements();
        }
        oldScrollY = newScrollY;
        // Debounces the scroll at end of page
        const resetScrollable = function () {
            windowIsScrollable = false;
        };
        clearTimeout(timeoutResetScrollable);
        timeoutResetScrollable = setTimeout(resetScrollable, 3000);
    } else {
        let hideOrShow = visibleState ? hideSlidingUIElements : showSlidingUIElements;
        if (newScrollY === 0 && windowIsScrollable) {
            // If we are at the top of a scrollable page, always restore the UI elements
            hideOrShow = showSlidingUIElements;
        }
        if (e.type === 'touchend') {
            delta = Math.abs(oldTouchY - e.changedTouches[0].screenY);
            if (delta > 50) {
                hideOrShow();
            }
        } else if (e.type === 'wheel') {
            delta = Math.abs(e.deltaY);
            if (delta > 6) {
                hideOrShow();
            }
        } else if (e.type === 'keydown') {
            // IE11 produces Up and Down instead of ArrowUp and ArrowDown
            if ((e.ctrlKey || e.metaKey) && /^(Arrow)?(Up|Down)$/.test(e.key)) {
                hideOrShow();
            }
        }
        // DEBUG for non-scrolling events events
        // console.debug('eventType: ' + e.type + ' oldScrollY: ' + oldScrollY + ' newScrollY: ' + newScrollY + ' windowIsScrollable: ' + windowIsScrollable);
    }
}

/**
 * Extracts a list of headings from an article and provides methods to interact with them.
 *
 * @class
 * @param {Document} articleDoc The document object of the article from which headings are to be extracted.
 */
function HeadingsTOC (articleDoc) {
    this.doc = articleDoc;
    this.headings = this.doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

    this.getHeadingObjects = function () {
        const headings = [];
        for (let i = 0; i < this.headings.length; i++) {
            const element = this.headings[i];
            const obj = {};

            if (element.id) {
                obj.id = element.id;
            } else {
                // generating custom id if id attribute is not present in element
                const generatedId = element.textContent
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-');
                obj.id = 'pph-' + i + '-' + generatedId;
                element.id = obj.id; // to target the element
            }
            obj.index = i;
            obj.textContent = element.textContent;
            obj.tagName = element.tagName;
            headings.push(obj);
        }
        return headings;
    };
}

/**
    * Sets up table of contents (TOC) by extracting all headings from the article.
    * Adds click handlers to scroll to sections and highlight them.
    *
    * @returns {void}
*/
function setUpTOC () {
    const innerDoc = articleContainer ? (articleContainer.contentDocument || articleContainer.contentWindow.document) : null;

    if (!innerDoc) {
        console.warn('null articleContainer');
        return;
    }

    const tableOfContents = new HeadingsTOC(innerDoc);
    const headings = tableOfContents.getHeadingObjects();

    let dropupHtml = '';
    headings.forEach(function (heading) {
        if (/^h1$/i.test(heading.tagName)) {
            dropupHtml += '<li class="toc-item-h1" ><a href="#" data-heading-id="' + heading.id + '">' + heading.textContent + '</a></li>';
        } else if (/^h2$/i.test(heading.tagName)) {
            dropupHtml += '<li class="toc-item-h2" ><a href="#" data-heading-id="' + heading.id + '">' + heading.textContent + '</a></li>';
        } else if (/^h3$/i.test(heading.tagName)) {
            dropupHtml += '<li class="toc-item-h3" ><a href="#" data-heading-id="' + heading.id + '">' + heading.textContent + '</a></li>';
        } else if (/^h4$/i.test(heading.tagName)) {
            dropupHtml += '<li class="toc-item-h4" ><a href="#" data-heading-id="' + heading.id + '">' + heading.textContent + '</a></li>';
        }
        // Skip smaller headings (if there are any) to avoid making list too long
    });
    const ToCList = document.getElementById('ToCList');
    ToCList.style.maxHeight = ~~(window.innerHeight * 0.75) + 'px';
    ToCList.innerHTML = dropupHtml;
    Array.from(ToCList.getElementsByTagName('a'))
        .forEach(function (listElement) {
            listElement.addEventListener('click', function () {
                const sectionEle = innerDoc.getElementById(this.dataset.headingId)

                const sectionsToOpen = getParentSections(sectionEle); // get all parents which are 'section' or 'details'
                openSection(sectionsToOpen); // open all parents
                // why..? because if the section is inside a details element, it will be closed by default

                sectionEle.scrollIntoView();

                // highlighting the section
                sectionEle.style.backgroundColor = '#bdd1e5';
                setTimeout(function () {
                    sectionEle.style.backgroundColor = '';
                }, 2000);
                sectionEle.style.transition = 'background-color 300ms ease-out';
            }
        );
    });
}

// Event listeners to handle interactions with dropup button and TOCList
document.addEventListener('DOMContentLoaded', function () {
    const dropup = document.getElementById('dropup');
    dropup.setAttribute('tabindex', '0'); // dropup focusable with the keyboard
    const ToCList = document.getElementById('ToCList');

    // to close TOC when clicking inside the iframe
    const onContainerLoad = function () {
        if (!articleContainer.contentDocument && !articleContainer.contentWindow) return;
        const innerDoc = articleContainer.contentDocument || articleContainer.contentWindow.document;
        if (innerDoc) {
            innerDoc.addEventListener('click', function () {
                closeTOC();
            });
        }
    };
    articleContainer.removeEventListener('load', onContainerLoad);
    articleContainer.addEventListener('load', onContainerLoad);

    // to close toc when user clicks outside of it
    const documentClickHandler = function (event) {
        if (!dropup.contains(event.target) && !ToCList.contains(event.target)) {
            closeTOC();
        }
    }
    document.removeEventListener('click', documentClickHandler);
    document.addEventListener('click', documentClickHandler);

    // handling clicks on dropup separately
    const dropupClickHandler = function () {
        setTOCVisible(!tocIsOpen());
    };
    dropup.removeEventListener('click', dropupClickHandler);
    dropup.addEventListener('click', dropupClickHandler);

    // Keyboard handling that Bootstrap's dropdown plugin used to provide for us: Escape closes the
    // ToC and returns focus to the button, and Up/Down move between entries (wrapping at each end).
    // NB IE11 reports the legacy key names 'Esc', 'Up' and 'Down', hence the permissive patterns.
    const dropupKeyHandler = function (event) {
        if (!tocIsOpen()) return;
        // Only act on keys aimed at the dropup or its menu, as Bootstrap's delegated handler did.
        // Without this, an open ToC would swallow the arrow keys for the whole document, and pull
        // focus back into the menu from wherever the user had tabbed to [kiwix-js #1460]
        if (!dropup.contains(event.target) && !ToCList.contains(event.target)) return;
        if (/^Esc/.test(event.key)) {
            event.preventDefault();
            closeTOC();
            dropup.focus();
        } else if (/^(?:Arrow)?(?:Down|Up)$/.test(event.key)) {
            const items = Array.from(ToCList.getElementsByTagName('a'));
            if (!items.length) return;
            event.preventDefault();
            const step = /Down$/.test(event.key) ? 1 : -1;
            const current = items.indexOf(document.activeElement);
            // Entering the list from the button starts at whichever end matches the direction of travel
            const next = current === -1 ? (step > 0 ? 0 : items.length - 1)
                : (current + step + items.length) % items.length;
            items[next].focus();
        }
    };
    document.removeEventListener('keydown', dropupKeyHandler);
    document.addEventListener('keydown', dropupKeyHandler);
});

/**
 * Reports whether the Table of Contents dropup is currently open
 * @returns {Boolean} True if the ToC list is visible
 */
function tocIsOpen () {
    const ToCList = document.getElementById('ToCList');
    return !!ToCList && getComputedStyle(ToCList).display !== 'none';
}

/**
 * Shows or hides the Table of Contents, keeping the dropup button's aria-expanded state in sync.
 * Bootstrap's dropdown plugin used to maintain that attribute for us, but we no longer load it.
 * @param {Boolean} visible True to open the ToC, false to close it
 */
function setTOCVisible (visible) {
    const ToCList = document.getElementById('ToCList');
    const dropup = document.getElementById('dropup');
    if (!ToCList) return;
    if (visible) {
        setUpTOC();
        ToCList.style.display = 'flex';
        ToCList.style.flexDirection = 'column';
    } else {
        ToCList.style.display = 'none';
    }
    if (dropup) dropup.setAttribute('aria-expanded', visible ? 'true' : 'false');
}

function closeTOC () {
    setTOCVisible(false);
}

// get all parent elements which are 'section' or 'details'
function getParentSections (element) {
    const parents = [];
    let currentElement = element;
    while (currentElement) {
        if (/section|details/i.test(currentElement.tagName)) {
            parents.push(currentElement);
        }
        currentElement = currentElement.parentElement;
    }
    return parents;
};

// Function to open a specific section and all its parent sections
function openSection (sectionsToOpen) {
    if (!sectionsToOpen) return;
    sectionsToOpen.forEach(section => {
        if (section.tagName === 'DETAILS') {
            section.setAttribute('open', '');
        } else if (section.tagName === 'SECTION') {
            section.style.display = '';
            Array.from(section.children).forEach(child => {
                if (!/SUMMARY|H\d/.test(child.tagName)) {
                    child.style.display = '';
                }
            });
        }
    });
};

/**
 * Displays a Bootstrap alert or confirm dialog box depending on the options provided
 *
 * @param {String} message The alert message(can be formatted using HTML) to display in the body of the modal.
 * @param {String} label The modal's label or title which appears in the header (optional, Default = "Confirmation" or "Message")
 * @param {Boolean} isConfirm If true, the modal will be a confirm dialog box, otherwise it will be a simple alert message
 * @param {String} declineConfirmLabel The text to display on the decline confirmation button (optional, Default = "Cancel")
 * @param {String} approveConfirmLabel  The text to display on the approve confirmation button (optional, Default = "Confirm")
 * @param {String} closeMessageLabel  The text to display on the close alert message button (optional, Default = "Okay")
 * @param {String} hideOptionLabel  The text to display on the hide option button (optional, Default = "Don't ask again")
 * @param {Boolean} displayHideOption If true, option to permanently hide the modal will be shown (currently only implemented for hideExternalLinkWarning)
 * @returns {Promise<Boolean>} A promise which resolves to true if the user clicked Confirm, false if the user clicked Cancel/Okay, backdrop or the cross(x) button
 */
function systemAlert (message, label, isConfirm, declineConfirmLabel, approveConfirmLabel, closeMessageLabel, hideOptionLabel, displayHideOption) {
    declineConfirmLabel = declineConfirmLabel || (translateUI.t('dialog-cancel') || 'Cancel');
    approveConfirmLabel = approveConfirmLabel || (translateUI.t('dialog-confirm') || 'Confirm');
    closeMessageLabel = closeMessageLabel || (translateUI.t('dialog-ok') || 'Okay');
    hideOptionLabel = hideOptionLabel || (translateUI.t('dialog-hide') || "Don't ask again");
    displayHideOption = displayHideOption || false;
    label = label || (isConfirm ? 'Confirmation' : 'Message');
    return util.PromiseQueue.enqueue(function () {
        return new Promise(function (resolve, reject) {
            if (!message) reject(new Error('Missing body message'));
            // Set the text to the modal and its buttons
            document.getElementById('approveConfirm').textContent = approveConfirmLabel;
            document.getElementById('declineConfirm').textContent = declineConfirmLabel;
            document.getElementById('closeMessage').textContent = closeMessageLabel;
            document.getElementById('hideOption').textContent = hideOptionLabel;
            // Some titles need &nbsp; or other HTML, so we have to use innerHTML
            document.getElementById('modalLabel').innerHTML = label;
            // Using innerHTML to set the message to allow HTML formatting
            document.getElementById('modalText').innerHTML = message;
            // Display buttons acc to the type of alert
            document.getElementById('approveConfirm').style.display = isConfirm ? 'inline' : 'none';
            document.getElementById('declineConfirm').style.display = isConfirm ? 'inline' : 'none';
            document.getElementById('closeMessage').style.display = isConfirm ? 'none' : 'inline';
            document.getElementById('hideOption').style.display = displayHideOption ? 'inline' : 'none';
            // Display the modal
            const modal = document.querySelector('#alertModal');
            const backdrop = document.createElement('div');
            backdrop.classList.add('modal-backdrop');
            document.body.appendChild(backdrop);

            // Show the modal
            document.body.classList.add('modal-open');
            modal.classList.add('show');
            modal.style.display = 'block';
            backdrop.classList.add('show');

            // Set the ARIA attributes for the modal
            modal.setAttribute('aria-hidden', 'false');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('role', 'dialog');

            // Hide modal handlers
            var closeModalHandler = function () {
                document.body.classList.remove('modal-open');
                modal.classList.remove('show');
                modal.style.display = 'none';
                backdrop.classList.remove('show');
                if (Array.from(document.body.children).indexOf(backdrop) >= 0) {
                    document.body.removeChild(backdrop);
                }
                // remove event listeners
                document.getElementById('modalCloseBtn').removeEventListener('click', close);
                document.getElementById('declineConfirm').removeEventListener('click', close);
                document.getElementById('closeMessage').removeEventListener('click', close);
                document.getElementById('approveConfirm').removeEventListener('click', closeConfirm);
                document.getElementById('hideOption').removeEventListener('click', hideConfirm);
                modal.removeEventListener('click', close);
                document.getElementsByClassName('modal-dialog')[0].removeEventListener('click', stopOutsideModalClick);
                modal.removeEventListener('keyup', keyHandler);
            };

            // function to call when modal is closed
            var close = function () {
                closeModalHandler();
                resolve(false);
            };
            var closeConfirm = function () {
                closeModalHandler();
                resolve(true);
            };
            var hideConfirm = function () {
                document.getElementById('hideExternalLinkWarningCheck').click();
                closeModalHandler();
                resolve(true);
            };
            var stopOutsideModalClick = function (e) {
                e.stopPropagation();
            };
            var keyHandler = function (e) {
                if (/Enter/.test(e.key)) {
                    // We need to focus before clicking the button, because the handler above is based on document.activeElement
                    if (isConfirm) {
                        document.getElementById('approveConfirm').focus();
                        document.getElementById('approveConfirm').click();
                    } else {
                        document.getElementById('closeMessage').focus();
                        document.getElementById('closeMessage').click();
                    }
                } else if (/Esc/.test(e.key)) {
                    document.getElementById('modalCloseBtn').focus();
                    document.getElementById('modalCloseBtn').click();
                }
            };

            // When hide modal is called, resolve promise with true if hidden using approve button, false otherwise
            document.getElementById('modalCloseBtn').addEventListener('click', close);
            document.getElementById('declineConfirm').addEventListener('click', close);
            document.getElementById('closeMessage').addEventListener('click', close);
            document.getElementById('approveConfirm').addEventListener('click', closeConfirm);
            document.getElementById('hideOption').addEventListener('click', hideConfirm);

            modal.addEventListener('click', close);
            document.getElementsByClassName('modal-dialog')[0].addEventListener('click', stopOutsideModalClick);

            modal.addEventListener('keyup', keyHandler);
            // Set focus to the first focusable element inside the modal
            modal.focus();
        });
    });
}

/**
 * Creates a data: URI from the given content
 * The given attribute of the DOM node (nodeAttribute) is then set to this URI
 *
 * This is used to inject images (and other dependencies) into the article DOM
 *
 * @param {Object} node The node to which the URI should be added
 * @param {String} nodeAttribute The attribute to set to the URI
 * @param {Uint8Array} content The binary content to convert to a URI
 * @param {String} mimeType The MIME type of the content
 * @param {Function} callback An optional function to call to start processing the next item
 */
function feedNodeWithDataURI (node, nodeAttribute, content, mimeType, callback) {
    // Decode WebP data if the browser does not support WebP and the mimeType is webp
    if (webpMachine && /image\/webp/i.test(mimeType)) {
        // If we're dealing with a dataURI, first convert to Uint8Array
        if (/^data:/i.test(content)) {
            content = util.dataURItoUint8Array(content);
        }
        // DEV: Note that webpMachine is single threaded and will reject an image if it is busy
        // However, the loadImagesJQuery() function in app.js is sequential (it waits for a callback
        // before processing another image) so we do not need to queue WebP images here
        var canvas = document.createElement('canvas');
        webpMachine.decodeToCanvas(canvas, content).then(function () {
            if (callback) callback(); // Calling back as soon as possible speeds up extraction
            if (params.useCanvasElementsForWebpTranscoding) {
                // Replace images by canvas. This is necessary for some browsers with obsolete anti-fingerprinting protection, like IceCat 60.7
                webpMachine.constructor.replaceImageWithCanvas(node, canvas);
            } else {
                // For standard browsers that have access to the canvas, we simply convert the canvas to a data URI
                node.setAttribute(nodeAttribute, canvas.toDataURL());
            }
        }).catch(function (err) {
            console.error('There was an error decoding image in WebpMachine', err);
            if (callback) callback();
        });
    } else {
        if (callback) callback(); // Calling back as soon as possible speeds up extraction
        // In browsers that support WebP natively, or for non-WebP images, we can simply convert the Uint8Array to a data URI
        getDataUriFromUint8Array(content, mimeType).then(function (dataUri) {
            node.setAttribute(nodeAttribute, dataUri);
        }).catch(function (err) {
            console.error('There was an error converting Uint8Array to data URI', err);
        });
    }
}

/**
 * Creates a data: URI from the given content
 * @param {Uint8Array} content The binary content to convert to a URI
 * @param {String} mimeType The MIME type of the content
 * @returns {Promise<String>} A promise that resolves to the data URI
 */
function getDataUriFromUint8Array (content, mimeType) {
    // Use FileReader method because btoa fails on utf8 strings (in SVGs, for example)
    // See https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
    // This native browser method is very fast: see https://stackoverflow.com/a/66046176/9727685
    return new Promise((resolve, reject) => {
        var myReader = new FileReader();
        myReader.onloadend = function () {
            var url = myReader.result;
            resolve(url);
        };
        myReader.onerror = function (err) {
            reject(err);
        };
        myReader.readAsDataURL(new Blob([content], { type: mimeType }));
    });
}

/**
 * Determines whether the Canvas Elements Workaround for decoding WebP images is needed, and sets UI accordingly.
 * This also sets a global app parameter (useCanvasElementsForWebpTranscoding) that determines whether the workaround will be used in jQuery mode.
 * Note that the workaround will never be used in Service Worker mode, but we still need to determine it in case the user switches modes.
 * @returns {Boolean} A value to indicate the browser's capability (whether it requires the workaround or not)
 */
function determineCanvasElementsWorkaround () {
    var userPreference = settingsStore.getItem('useCanvasElementsForWebpTranscoding') !== 'false';
    // Determine whether the browser is able to read canvas data correctly
    var browserRequiresWorkaround = webpMachine && webpHero && !webpHero.detectCanvasReadingSupport();
    console.debug('Determination for canvas elements workaround with WebP transcoding is: ' + browserRequiresWorkaround);
    // Hide the UI for this feature (we'll display it below if needed)
    var imgHandlingModeDiv = document.getElementById('imgHandlingModeDiv');
    var useCanvasElementsCheck = document.getElementById('useCanvasElementsCheck');
    imgHandlingModeDiv.style.display = 'none';
    useCanvasElementsCheck.checked = false;
    if (browserRequiresWorkaround && params.contentInjectionMode === 'jquery') {
        // The feature is required, so display the UI
        imgHandlingModeDiv.style.display = 'block';
        useCanvasElementsCheck.checked = userPreference;
    }
    params.useCanvasElementsForWebpTranscoding = browserRequiresWorkaround ? userPreference : false;
    // Return the determined browser capability (which may be different from the user's preference) in case caller wants this
    return browserRequiresWorkaround;
}

/**
 * Replace the given CSS link (from the DOM) with an inline CSS of the given content
 *
 * Due to CSP, Firefox OS does not accept <link> syntax with href="data:text/css..." or href="blob:..."
 * So we replace the tag with a <style type="text/css">...</style>
 * while copying some attributes of the original tag
 * Cf http://jonraasch.com/blog/javascript-style-node
 *
 * @param {Element} link The original link node from the DOM
 * @param {String} cssContent The content to insert as an inline stylesheet
 * @param {String} id An optional id to add to the style element
 */
function replaceCSSLinkWithInlineCSS (link, cssContent, id) {
    var cssElement = document.createElement('style');
    if (id) {
        cssElement.id = id;
    }
    cssElement.type = 'text/css'; // Still needed for FFOS
    if (cssElement.styleSheet) {
        cssElement.styleSheet.cssText = cssContent;
    } else {
        cssElement.appendChild(document.createTextNode(cssContent));
    }
    var mediaAttributeValue = link.getAttribute('media');
    if (mediaAttributeValue) {
        cssElement.media = mediaAttributeValue;
    }
    var disabledAttributeValue = link.getAttribute('disabled');
    if (disabledAttributeValue) {
        cssElement.disabled = disabledAttributeValue;
    }
    link.parentNode.replaceChild(cssElement, link);
}

/**
 * Removes parameters and anchors from a URL
 * @param {type} url The URL to be processed
 * @returns {String} The same URL without its parameters and anchors
 */
function removeUrlParameters (url) {
    // Remove any querystring
    var strippedUrl = url.replace(/\?[^?]*$/, '');
    // Remove any anchor parameters - note that we are deliberately excluding entity references, e.g. '&#39;'.
    strippedUrl = strippedUrl.replace(/#[^#;]*$/, '');
    return strippedUrl;
}

/**
 * Derives the URL.pathname from a relative or semi-relative URL using the given base ZIM URL
 *
 * @param {String} url The (URI-encoded) URL to convert (e.g. "Einstein", "../Einstein",
 *      "../../I/im%C3%A1gen.png", "-/s/style.css", "/A/Einstein.html", "../static/bootstrap/css/bootstrap.min.css")
 * @param {String} base The base ZIM URL of the currently loaded article (e.g. "A/", "A/subdir1/subdir2/", "C/Singapore/")
 * @returns {String} The derived ZIM URL in decoded form (e.g. "A/Einstein", "I/imágen.png", "C/")
 */
function deriveZimUrlFromRelativeUrl (url, base) {
    // We use a dummy domain because URL API requires a valid URI
    var dummy = 'http://d/';
    var deriveZimUrl = function (url, base) {
        if (typeof URL === 'function') return new URL(url, base);
        // IE11 lacks URL API: workaround adapted from https://stackoverflow.com/a/28183162/9727685
        var d = document.implementation.createHTMLDocument('t');
        // innerHTML required as string contains HTML tags
        d.head.innerHTML = '<base href="' + base + '">';
        var a = d.createElement('a');
        a.href = url;
        return { pathname: a.href.replace(dummy, '') };
    };
    var zimUrl = deriveZimUrl(url, dummy + base);
    return decodeURIComponent(zimUrl.pathname.replace(/^\//, ''));
}

/**
 * Displays a Bootstrap warning alert with information about how to access content in a ZIM with unsupported active UI
 */
var activeContentWarningSetup = false;
function displayActiveContentWarning (mode) {
    // Adapt the text for other modes (e.g., ServiceWorkerLocal)
    if (mode) {
        activeContent.innerHTML = activeContent.innerHTML.replace(translateUI.t('alert-activecontentwarning-restrictedmode') || 'Restricted', mode);
        // We have to set up event listeners again
        activeContentWarningSetup = false;
    }
    activeContent.style.display = '';
    if (!activeContentWarningSetup) {
        // We are setting up the active content warning for the first time
        activeContentWarningSetup = true;
        activeContent.querySelector('button[data-hide]').addEventListener('click', function () {
            hideActiveContentWarning();
        });
        ['swModeLink', 'stop'].forEach(function (id) {
            // Define event listeners for both hyperlinks in alert box: these take the user to the Config tab and highlight
            // the options that the user needs to select
            document.getElementById(id).addEventListener('click', function () {
                var elementID = id === 'stop' ? 'hideActiveContentWarningCheck' : 'serviceworkerModeRadio';
                var thisLabel = document.getElementById(elementID).parentNode;
                thisLabel.style.borderColor = 'red';
                thisLabel.style.borderStyle = 'solid';
                var btnHome = document.getElementById('btnHome');
                [thisLabel, btnHome].forEach(function (ele) {
                    // Define event listeners to cancel the highlighting both on the highlighted element and on the Home tab
                    ele.addEventListener('mousedown', function () {
                        thisLabel.style.borderColor = '';
                        thisLabel.style.borderStyle = '';
                    });
                });
                var anchor = this.getAttribute('href');
                document.getElementById('btnConfigure').click();
                // We have to use a timeout or the scroll is cancelled by the slide transtion animation
                // @TODO This is a workaround. The regression should be fixed as it affects the aboutLinks as well
                setTimeout(function () {
                    document.querySelector(anchor).scrollIntoView();
                }, 600);
            });
        });
    }
}

/**
 * Hides the active content warning alert box with a fade-out effect
 */
function hideActiveContentWarning () {
    const alertBoxHeader = document.getElementById('alertBoxHeader');
    if (activeContent.style.display === 'none') return;
    alertBoxHeader.style.opacity = 0;
    alertBoxHeader.style.maxHeight = 0;
    setTimeout(function () {
        activeContent.style.display = 'none';
        alertBoxHeader.style.opacity = 1;
        alertBoxHeader.style.maxHeight = '';
    }, 500);
}

/**
 * Displays a Bootstrap alert box at the foot of the page to enable saving the content of the given title to the device's filesystem
 * and initiates download/save process if this is supported by the OS or Browser
 *
 * @param {String} title The path and filename to the file to be extracted
 * @param {Boolean|String} download A Bolean value that will trigger download of title, or the filename that should
 *     be used to save the file in local FS
 * @param {String} contentType The mimetype of the downloadable file, if known
 * @param {Uint8Array} content The binary-format content of the downloadable file
 */
var downloadAlertSetup = false;
function displayFileDownloadAlert (title, download, contentType, content) {
    var downloadAlert = document.getElementById('downloadAlert');
    downloadAlert.style.display = 'block';
    if (!downloadAlertSetup) {
        downloadAlert.querySelector('button[data-hide]').addEventListener('click', function () {
            // We are setting up the alert for the first time
            downloadAlert.style.display = 'none';
        });
    }
    downloadAlertSetup = true;
    // Download code adapted from https://stackoverflow.com/a/19230668/9727685
    // Set default contentType if none was provided
    if (!contentType) contentType = 'application/octet-stream';
    var a = document.createElement('a');
    var blob = new Blob([content], { type: contentType });
    // If the filename to use for saving has not been specified, construct it from title
    var filename = download === true ? title.replace(/^.*\/([^/]+)$/, '$1') : download;
    // Make filename safe
    filename = filename.replace(/[/\\:*?"<>|]/g, '_');
    a.href = window.URL.createObjectURL(blob);
    a.target = '_blank';
    a.type = contentType;
    a.download = filename;
    a.classList.add('alert-link');
    a.textContent = filename;
    var alertMessage = document.getElementById('alertMessage');
    // innerHTML required as it has HTML tags
    alertMessage.innerHTML = (translateUI.t('alert-download-message') || '<strong>Download</strong> If the download does not begin, please tap the following link:') + ' ';
    // We have to add the anchor to a UI element for Firefox to be able to click it programmatically: see https://stackoverflow.com/a/27280611/9727685
    alertMessage.appendChild(a);
    try {
        a.click();
    } catch (err) {
        // If the click fails, user may be able to download by manually clicking the link
        // But for IE11 we need to force use of the saveBlob method with the onclick event
        if (window.navigator && window.navigator.msSaveBlob) {
            a.addEventListener('click', function (e) {
                window.navigator.msSaveBlob(blob, filename);
                e.preventDefault();
            });
        } else {
            console.error('Error downloading file: ' + err);
        }
    }
    spinnerDisplay(false);
}

/**
 * Check for update of Service Worker (PWA) and display information to user
 */
var updateAlert = document.getElementById('updateAlert');
function checkUpdateStatus (appstate) {
    if ('serviceWorker' in navigator && !appstate.pwaUpdateNeeded) {
        settingsStore.getCacheNames(function (cacheNames) {
            if (cacheNames && !cacheNames.error) {
                // Store the cacheNames globally for use elsewhere
                params.cacheNames = cacheNames;
                caches.keys().then(function (keyList) {
                    updateAlert.style.display = 'none';
                    var cachePrefix = cacheNames.app.replace(/^([^\d]+).+/, '$1');
                    keyList.forEach(function (key) {
                        if (key === cacheNames.app || key === cacheNames.assets) return;
                        // Ignore any keys that do not begin with the appCache prefix (they could be from other apps using the same domain)
                        if (key.indexOf(cachePrefix)) return;
                        // If we get here, then there is a cache key that does not match our version, i.e. a PWA-in-waiting
                        appstate.pwaUpdateNeeded = true;
                        updateAlert.style.display = 'block';
                        document.getElementById('persistentMessage').textContent = (translateUI.t('alert-update-version') || 'Version') + ' ' + key.replace(cachePrefix, '') + ' ' +
                            (translateUI.t('alert-update-available') || 'is ready to install. (Re-launch app to install.)');
                    });
                });
            }
        });
    }
}
if (updateAlert) {
    updateAlert.querySelector('button[data-hide]').addEventListener('click', function () {
        updateAlert.style.display = 'none';
    });
}

/**
 * Checks if a server is accessible by attempting to load a test image from the server
 * @param {String} imageSrc The full URI of the image
 * @param {any} onSuccess A function to call if the image can be loaded
 * @param {any} onError A function to call if the image cannot be loaded
 */
function checkServerIsAccessible (imageSrc, onSuccess, onError) {
    var image = new Image();
    image.onload = onSuccess;
    image.onerror = onError;
    image.src = imageSrc;
}

/**
 * Show or hide the spinner together with a message
 * @param {Boolean} show True to show the spinner, false to hide it
 * @param {String} message A message to display, or hide the message if null
 */
function spinnerDisplay (show, message) {
    var searchingArticles = document.getElementById('searchingArticles');
    var spinnerMessage = document.getElementById('cachingAssets');
    if (show) searchingArticles.style.display = 'block';
    else searchingArticles.style.display = 'none';
    if (message) {
        spinnerMessage.textContent = message;
        spinnerMessage.style.display = 'block';
    } else {
        spinnerMessage.textContent = translateUI.t('spinner-caching-assets') || 'Caching assets...';
        spinnerMessage.style.display = 'none';
    }
}

/**
 * Checks whether an element is partially or fully inside the current viewport
 *
 * @param {Element} el The DOM element for which to check visibility
 * @param {Boolean} fully If true, checks that the entire element is inside the viewport;
 *          if false, checks whether any part of the element is inside the viewport
 * @returns {Boolean} True if the element is fully or partially (depending on the value of <fully>)
 *          inside the current viewport
 */
function isElementInView (el, fully) {
    var rect = el.getBoundingClientRect();
    if (fully) {
        return rect.top > 0 && rect.bottom < window.innerHeight && rect.left > 0 && rect.right < window.innerWidth;
    } else {
        return rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0;
    }
}

/**
 * Show elements in bulk (using display: '')
 *
 * @param {Array<HTMLElement>} elements It takes the name of the section to which the animation is to be added
 * @example showElements(element1, element2, element3)
 * @returns {void}
*/
function showElements (...elements) {
    for (const element of elements) {
        if (element) element.style.display = '';
    }
}

/**
 * Hide elements in bulk (using display: none)
 *
 * @param {Array<HTMLElement>} elements Any element that you want to be hidden
 * @example hideElements(element1, element2, element3)
 * @returns {void}
*/
function hideElements (...elements) {
    for (const element of elements) {
        if (element) element.style.display = 'none';
    }
}

/**
 * Removes the animation classes that are added by the slide animation in previous transition
 * @returns {void}
 */
function removeAnimationClasses () {
    const config = document.getElementById('configuration');
    const about = document.getElementById('about');
    const home = document.getElementById('articleContent');
    const library = document.getElementById('library');

    const tabs = [config, about, home, library]
    tabs.forEach(tab => {
        tab.classList.remove('slideIn_L');
        tab.classList.remove('slideIn_R');
        tab.classList.remove('slideOut_L');
        tab.classList.remove('slideOut_R');
    });
}

/**
 * Adds the slide animation between different sections
 *
 * @param {HTMLElement} sectionToShow Element which is gonna be slide in from left (show)
 * @param {HTMLElement} sectionToHide Element which is gonna be slide to the left (hide)
 * @returns {void}
 */
function slideToLeft (sectionToShow, sectionToHide) {
    sectionToShow.classList.add('slideIn_L');
    setTimeout(function () {
        sectionToShow.style.display = '';
        // sectionToShow.classList.remove('slideIn_L');
    }, 300);

    sectionToHide.classList.add('slideOut_L');
    setTimeout(function () {
        sectionToHide.style.display = 'none';
        // sectionToHide.classList.remove('slideOut_L');
    }, 300);
}

/**
 * Adds the slide animation between different sections
 *
 * @param {HTMLElement} sectionToShow Element which is gonna be slide in from right (show)
 * @param {HTMLElement} sectionToHide Element which is gonna be slide to the right (hide)
 * @returns {void}
 */
function slideToRight (sectionToShow, sectionToHide) {
    sectionToHide.classList.add('slideOut_R');
    setTimeout(function () {
        sectionToHide.style.display = 'none';
        // sectionToHide.classList.remove('slideOut_R');
    }, 300);

    sectionToShow.classList.add('slideIn_R');
    setTimeout(function () {
        sectionToShow.style.display = '';
        // sectionToShow.classList.remove('slideIn_R');
    }, 300);
}

/**
 * Returns the name of the section which is currently visible
 * @returns {String} The name of the section which is currently visible
 */
function fromSection () {
    const isConfigPageVisible = document.getElementById('configuration').style.display !== 'none';
    const isAboutPageVisible = document.getElementById('about').style.display !== 'none';
    const isArticlePageVisible = document.getElementById('articleContent').style.display !== 'none';
    const isLibraryPageVisible = document.getElementById('library').style.display !== 'none';
    if (isConfigPageVisible) return 'config';
    if (isLibraryPageVisible) return 'library';
    else if (isAboutPageVisible) return 'about';
    else if (isArticlePageVisible) return 'home';
}

/**
 * Adds the slide animation between different sections
 *
 * @param {String} toSection It takes the name of the section to which the animation is to be added
 * @param {Boolean} isAnimationRequired To enable or disable the animation
 * @returns {void}
 */
function tabTransitionToSection (toSection, isAnimationRequired = false) {
    // all the references of the sections/tabs
    const config = document.getElementById('configuration');
    const about = document.getElementById('about');
    const library = document.getElementById('library');
    const home = document.getElementById('articleContent');

    // references of extra elements that are in UI but not tabs
    // prefix with extra to avoid confusion and easy identification
    const extraNavBtns = document.getElementById('navigationButtons');
    const extraArticleSearch = document.getElementById('formArticleSearch');
    const extraWelcomeText = document.getElementById('welcomeText');
    const extraSearchingArticles = document.getElementById('searchingArticles');
    const extraKiwixAlert = document.getElementById('kiwix-alert');

    // removing any classes that have been added by previous transition
    removeAnimationClasses()
    const from = fromSection();

    if (isAnimationRequired) {
        if (toSection === 'home') {
            if (from === 'config') slideToRight(home, config);
            if (from === 'about') slideToRight(home, about);
            if (from === 'library') slideToRight(home, library);

            showElements(extraNavBtns, extraArticleSearch, extraWelcomeText, extraKiwixAlert);
        } else if (toSection === 'config') {
            if (from === 'about') slideToRight(config, about);
            if (from === 'library') slideToRight(config, library);
            if (from === 'home') slideToLeft(config, home);

            hideElements(extraNavBtns, extraArticleSearch, extraWelcomeText, extraSearchingArticles, extraKiwixAlert);
        } else if (toSection === 'about') {
            if (from === 'library') slideToRight(about, library);
            if (from === 'home') slideToLeft(about, home);
            if (from === 'config') slideToLeft(about, config);

            hideElements(extraNavBtns, extraArticleSearch, extraWelcomeText, extraSearchingArticles, extraKiwixAlert);
        } else if (toSection === 'library') {
            // it will be always coming from config page
            slideToLeft(library, config);
            hideElements(extraNavBtns, extraArticleSearch, extraWelcomeText, extraSearchingArticles, extraKiwixAlert);
        }
    } else {
        if (toSection === 'home') {
            hideElements(config, about, library);
            showElements(home, extraNavBtns, extraArticleSearch, extraWelcomeText);
        }
        if (toSection === 'config') {
            hideElements(about, home, library, extraNavBtns, extraArticleSearch, extraWelcomeText, extraSearchingArticles, extraKiwixAlert);
            showElements(config);
        }
        if (toSection === 'about') {
            hideElements(config, home, library);
            showElements(about);
        }
        if (toSection === 'library') {
            hideElements(config, about, home, extraNavBtns, extraArticleSearch, extraWelcomeText, extraSearchingArticles, extraKiwixAlert);
            showElements(library);
        }
    }
    // Remove any active content warning (as we will have slidden away, we don't need to use the fade out effect)
    activeContent.style.display = 'none';
}

/**
 * Parses and validates a theme string
 * @param {String} theme The theme to parse
 * @returns {Object} Object containing appTheme, contentTheme, and requestedContentTheme
 */
function parseTheme(theme) {
    if (!theme.match(/^(light|dark|auto)(_invert|_mwInvert|_wikimediaNative)?$/)) {
        console.error('Invalid theme format:', theme);
        theme = 'light';
    }

    const appTheme = isDarkTheme(theme) ? 'dark' : 'light';
    const contentTheme = theme.replace(/^[^_]*/, '');

    return { appTheme: appTheme, contentTheme: contentTheme, requestedContentTheme: contentTheme };
}

/**
 * Gets the article document, handling replay_iframe if present
 * @returns {Document} The article document or null
 */
function getArticleDocument() {
    // Always get a fresh reference to articleContent to avoid issues with mutable articleContainer
    var container = document.getElementById('articleContent');
    var doc = container ? container.contentDocument : null;
    // Get the correct article container to operate on
    if (doc && doc.getElementById('replay_iframe')) {
        doc = doc.getElementById('replay_iframe').contentDocument;
    }
    return doc;
}

/**
 * Cleans up previously applied theme classes and stylesheets
 * @param {String} oldContentTheme The previous content theme
 * @param {Document} doc The article document
 * @param {HTMLElement} articleContent The articleContent iframe element
 */
function cleanupOldContentTheme(oldContentTheme, doc, articleContent) {
    const library = document.getElementById('libraryContent');

    if (oldContentTheme) {
        // Clean up stylesheet from current document
        if (doc) {
            const kiwixJSSheet = doc.getElementById('kiwixJSTheme');
            if (kiwixJSSheet) {
                kiwixJSSheet.disabled = true;
                kiwixJSSheet.parentNode.removeChild(kiwixJSSheet);
            }

            // Clean up native Wikimedia theme classes if we're switching away from _wikimediaNative
            if (oldContentTheme === '_wikimediaNative' && doc.documentElement) {
                // Remove classes one at a time for IE11 compatibility
                doc.documentElement.classList.remove('skin-theme-clientpref-night');
                doc.documentElement.classList.remove('skin-theme-clientpref-os');
                doc.documentElement.classList.remove('skin-theme-clientpref-day');
            }
        }

        // Also check and clean up from outer articleContent iframe (in case we switched from regular to replay ZIM)
        if (articleContent && articleContent.contentDocument) {
            var outerDoc = articleContent.contentDocument;
            // Only clean if this is a different document than the one we already processed
            if (outerDoc !== doc) {
                var outerSheet = outerDoc.getElementById('kiwixJSTheme');
                if (outerSheet) {
                    outerSheet.disabled = true;
                    outerSheet.parentNode.removeChild(outerSheet);
                }
                if (oldContentTheme === '_wikimediaNative' && outerDoc.documentElement) {
                    // Remove classes one at a time for IE11 compatibility
                    outerDoc.documentElement.classList.remove('skin-theme-clientpref-night');
                    outerDoc.documentElement.classList.remove('skin-theme-clientpref-os');
                    outerDoc.documentElement.classList.remove('skin-theme-clientpref-day');
                }
            }
        }

        // Clean up classes from articleContent iframe and library
        if (articleContent) {
            articleContent.classList.remove(oldContentTheme);
        }
        library.classList.remove(oldContentTheme);
    }
}

/**
 * Resolves the content theme, handling fallbacks for _wikimediaNative
 * @param {String} contentTheme The requested content theme
 * @param {String} appTheme The app theme (light or dark)
 * @param {Document} doc The article document
 * @returns {String|null} The resolved content theme or null
 */
function resolveContentTheme(contentTheme, appTheme, doc) {
    // Handle _wikimediaNative fallback
    if (contentTheme === '_wikimediaNative') {
        if (!params.isWikimediaZim) {
            return '_invert';
        }

        if (doc && doc.documentElement) {
            const hasNativeTheme = detectNativeZIMThemeSupport(doc);
            if (hasNativeTheme) {
                return '_wikimediaNative';
            }
            return appTheme === 'dark' ? '_mwInvert' : null;
        }

        console.warn('[resolveContentTheme] No document available! Falling back. appTheme:', appTheme);
        return appTheme === 'dark' ? '_mwInvert' : null;
    }

    return contentTheme;
}

/**
 * Updates help text and description visibility based on the theme
 * @param {String} theme The full theme string
 * @param {String} requestedContentTheme The requested content theme
 * @param {String} oldContentTheme The previous content theme
 */
function updateThemeUI(theme, requestedContentTheme, oldContentTheme) {
    // Update help text only if we have valid theme values
    if (oldContentTheme) {
        const safeOldContentTheme = oldContentTheme.replace(/[^a-zA-Z0-9-]/g, '');
        const oldHelp = document.getElementById(safeOldContentTheme + '-help');
        if (oldHelp) oldHelp.style.display = 'none';
    }

    if (requestedContentTheme) {
        const safeContentTheme = requestedContentTheme.replace(/[^a-zA-Z0-9-]/g, '');
        const help = document.getElementById(safeContentTheme + '-help');
        if (help) help.style.display = 'block';
    }

    // Update description
    const oldDescription = document.getElementById('kiwix-auto-description');
    if (oldDescription) oldDescription.style.display = 'none';

    const safeThemeBase = theme.replace(/_.*$/, '').replace(/[^a-zA-Z0-9-]/g, '');
    const description = document.getElementById('kiwix-' + safeThemeBase + '-description');
    if (description) description.style.display = 'block';
}

/**
 * Injects a content theme stylesheet into the article document
 * @param {String} contentTheme The content theme to apply
 * @param {Document} doc The article document
 */
function injectContentThemeStylesheet(contentTheme, doc) {
    if (!doc || !doc.head) {
        console.warn('[injectContentThemeStylesheet] No doc available, cannot inject stylesheet for contentTheme:', contentTheme);
        return;
    }

    const prefix = (window.location.protocol + '//' + window.location.host + window.location.pathname)
        .replace(/\/[^/]*$/, '');

    const link = doc.createElement('link');
    link.setAttribute('id', 'kiwixJSTheme');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');

    const safeContentTheme = contentTheme.replace(/[^a-zA-Z0-9_-]/g, '');
    link.setAttribute('href', prefix + '/css/kiwixJS' + safeContentTheme + '.css');

    doc.head.appendChild(link);
}

/**
 * Applies an invert-style content theme (not _wikimediaNative)
 * @param {String} contentTheme The content theme to apply
 * @param {Document} doc The article document
 * @param {HTMLElement} articleContent The articleContent iframe element
 */
function applyInvertContentTheme(contentTheme, doc, articleContent) {
    const library = document.getElementById('libraryContent');
    const kiwixJSSheet = doc ? doc.getElementById('kiwixJSTheme') : null;

    // Check if we need to inject the stylesheet
    if (!kiwixJSSheet || !~kiwixJSSheet.href.search('kiwixJS' + contentTheme + '.css')) {
        // Remove native Wikimedia theme classes if present, to prevent conflicts with invert themes
        if (doc && doc.documentElement) {
            // Remove classes one at a time for IE11 compatibility
            doc.documentElement.classList.remove('skin-theme-clientpref-night');
            doc.documentElement.classList.remove('skin-theme-clientpref-os');
            doc.documentElement.classList.remove('skin-theme-clientpref-day');
        }
        if (articleContent) {
            articleContent.classList.add(contentTheme);
        }
        library.classList.add(contentTheme);
        injectContentThemeStylesheet(contentTheme, doc);
    }
}

/**
 * Updates the colour scheme button icon to reflect the current theme
 * @param {String} theme The full theme string (e.g., 'light', 'dark_wikimediaNative', 'auto_wikimediaNative')
 */
function updateColourSchemeButton(theme) {
    // Extract base theme (light, dark, or auto)
    var baseTheme = theme.replace(/_.*$/, '');
    var isCurrentlyDark = isDarkTheme(theme); // Check if currently resolving to dark (handles auto mode)
    console.debug('[updateColourSchemeButton] theme:', theme, '| baseTheme:', baseTheme, '| isCurrentlyDark:', isCurrentlyDark);

    // Note: Font Awesome converts <i> to <svg> and uses data-icon attribute
    // We check for SVG first (modern browsers + IE11), then fall back to <i> (if SVG conversion disabled)
    var btnIcon = document.querySelector('#btnColourScheme svg') || document.querySelector('#btnColourScheme i');
    if (btnIcon) {
        var icon;
        // Use cached darkPreference MediaQueryList (defined in app.js)
        var osPrefersDark = window.darkPreference.matches;
        // Show icon for the NEXT state (what clicking will do)
        // The adjust icon appears on the forced mode that matches OS preference
        // sun icon = "click to force light", moon icon = "click to force dark", adjust = "click for auto"
        if (baseTheme === 'light') {
            // Currently forced light
            if (osPrefersDark) {
                // OS prefers dark, so from light go to dark
                icon = 'moon';
            } else {
                // OS prefers light (matches current), so from light go to auto
                icon = 'adjust';
            }
        } else if (baseTheme === 'dark') {
            // Currently forced dark
            if (osPrefersDark) {
                // OS prefers dark (matches current), so from dark go to auto
                icon = 'adjust';
            } else {
                // OS prefers light, so from dark go to light
                icon = 'sun';
            }
        } else {
            // Currently auto - show icon for opposite of what auto is showing
            icon = isCurrentlyDark ? 'sun' : 'moon';
        }
        console.debug('[updateColourSchemeButton] Setting icon to:', icon, '| osPrefersDark:', osPrefersDark);

        if (btnIcon.tagName === 'svg' || btnIcon.tagName === 'SVG') {
            // SVG element: update data-icon attribute (works in all browsers including IE11)
            btnIcon.setAttribute('data-icon', icon);
        } else {
            // <i> element: update classes (only if Font Awesome SVG conversion is disabled)
            btnIcon.classList.remove('fa-moon', 'fa-sun', 'fa-adjust');
            btnIcon.classList.add('fa-' + icon);
        }
    }
}

/**
 * Shows the return link if we're in Config and a real document is loaded
 * @param {Document} doc The article document
 */
function showReturnLinkIfConfigActive(doc) {
    // If we are in Config and a real document has been loaded already, expose return link so user can see the result of the change
    // DEV: The Placeholder string below matches the dummy article.html that is loaded before any articles are loaded
    if (document.getElementById('liConfigureNav').classList.contains('active') && doc &&
        // Check if the document contains a meta element with name="description"
        !(doc.querySelector('meta[content="Placeholder for injecting an article into the iframe or window"]'))) {
        showReturnLink();
    }
}

/**
 * Calculates relative luminance of a colour using WCAG formula
 * @param {String} rgbString RGB or RGBA colour string from getComputedStyle() (e.g., "rgb(255, 255, 255)" or "rgba(0, 0, 0, 0.5)")
 *     Note: getComputedStyle() always returns colours in rgb/rgba format, regardless of how they were originally specified
 * @returns {Number|null} Luminance value between 0 and 1, or null if parsing fails or colour is transparent
 */
function getLuminance (rgbString) {
    var match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return null;

    // Check for transparent background (alpha = 0)
    var alpha = match[4] !== undefined ? parseFloat(match[4]) : 1;
    if (alpha === 0) return null; // Skip transparent backgrounds

    var r = parseInt(match[1]) / 255;
    var g = parseInt(match[2]) / 255;
    var b = parseInt(match[3]) / 255;

    // Apply sRGB gamma correction
    r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    // Calculate relative luminance using WCAG formula
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Detects whether the content in a document appears to be dark-themed by analyzing
 * the luminance of background and text colours of key content elements
 *
 * @param {Document} doc The document to analyze
 * @returns {Boolean} True if content appears dark-themed, false otherwise
 */
function detectDarkContent (doc) {
    if (!doc || !doc.body) return false;

    // Sample multiple key content elements to determine overall theme
    var elementsToCheck = [
        { el: doc.body, name: 'body' },
        { el: doc.querySelector('main'), name: 'main' },
        { el: doc.querySelector('article'), name: 'article' },
        { el: doc.querySelector('[role="main"]'), name: '[role="main"]' },
        { el: doc.querySelector('.content'), name: '.content' },
        { el: doc.querySelector('#content'), name: '#content' }
    ].filter(function (item) { return item.el !== null; });

    var darkCount = 0;
    var totalCount = 0;

    for (var i = 0; i < elementsToCheck.length; i++) {
        var element = elementsToCheck[i].el;
        var styles = doc.defaultView.getComputedStyle(element);
        var bgLuminance = getLuminance(styles.backgroundColor);
        var textLuminance = getLuminance(styles.color);

        if (bgLuminance !== null && textLuminance !== null) {
            totalCount++;
            var isDark = bgLuminance < 0.3 && textLuminance > bgLuminance;
            if (isDark) {
                darkCount++;
            }
        }
    }

    // Content is dark if majority of sampled elements have dark backgrounds
    return totalCount > 0 && (darkCount / totalCount) >= 0.5;
}

/**
 * Applies the requested app and content theme
 *
 * A <theme> string consists of two parts, the appTheme (theme to apply to the app shell only), and an optional
 * contentTheme beginning with an underscore: e.g. 'dark_invert' = 'dark' (appTheme) + '_invert' (contentTheme)
 * Current themes are: light, dark, dark_invert, dark_mwInvert, dark_wikimediaNative, but code below is written for extensibility
 * For each appTheme (except the default 'light'), a corresponding set of rules must be present in app.css
 * For each contentTheme (except _wikimediaNative), a stylesheet must be provided in www/css that is named 'kiwixJS' + contentTheme
 * The _wikimediaNative theme is an exception: it uses the ZIM's built-in theme system via native CSS classes
 * A rule may additionally be needed in app.css for full implementation of contentTheme
 *
 * @param {String} theme The theme to apply (light|dark|auto[_invert|_mwInvert|_wikimediaNative])
 * @returns {String} The actual theme applied (may differ from requested theme if fallback occurred)
 */
function applyAppTheme (theme) {
    // Parse and validate theme
    var parsed = parseTheme(theme);
    var appTheme = parsed.appTheme;
    var contentTheme = parsed.contentTheme;
    var requestedContentTheme = parsed.requestedContentTheme;

    // Get DOM elements
    var htmlEl = document.querySelector('html');
    var footer = document.querySelector('footer');
    var oldTheme = htmlEl.dataset.theme || '';
    const library = document.getElementById('libraryContent');
    // Get a fresh reference to articleContent to avoid issues with mutable articleContainer
    const articleContent = document.getElementById('articleContent');

    // Start with a clean slate
    // Remove classes one at a time for IE11 compatibility
    library.classList.remove('_wikimediaNative');
    library.classList.remove('_mwInvert');
    library.classList.remove('_invert');

    // Get article document
    var doc = getArticleDocument();

    // Process old theme
    var oldAppTheme = oldTheme ? isDarkTheme(oldTheme) ? 'dark' : 'light' : null;
    var oldContentTheme = oldTheme.replace(/^[^_]*/, '');

    // Remove old app theme
    if (oldAppTheme) {
        htmlEl.classList.remove(oldAppTheme);
    }
    footer.classList.remove(oldContentTheme || '_light');

    // Apply new app theme
    // Note: 'light' is the default state, so we only add a class for 'dark'
    if (appTheme === 'dark') {
        htmlEl.classList.add('dark');
    } else {
        htmlEl.classList.remove('dark');
    }

    // Add contentTheme to footer to avoid dark CSS rule being applied when content is not dark
    footer.classList.add(contentTheme || '_light');

    // Update help text and descriptions
    updateThemeUI(theme, requestedContentTheme, oldContentTheme);

    // Remove the contentTheme for auto themes whenever system is in light mode
    if (/^auto/.test(theme) && appTheme === 'light') contentTheme = null;

    // Clean up old content theme if switching themes
    if (oldContentTheme && oldContentTheme !== contentTheme) {
        cleanupOldContentTheme(oldContentTheme, doc, articleContent);
    }

    // Skip all content theme manipulation if disabled by user (purist mode)
    if (!params.enableContentTheme) {
        contentTheme = null;
        console.info('[Theme] Content theme manipulation disabled - displaying ZIM content as archived');
    } else {
        // Resolve content theme (handles _wikimediaNative fallbacks)
        contentTheme = resolveContentTheme(contentTheme, appTheme, doc);

        // Auto-detect dark content in Zimit archives to prevent UI/content theme clash
        // Skip only if user explicitly chose an invert-style theme (_invert or _mwInvert)
        // _wikimediaNative is the system default for Wikimedia ZIMs, so we still auto-detect for Zimit
        if (/zimit/.test(params.zimType) && !/_(?:mw)?[Ii]nvert/.test(requestedContentTheme) && doc) {
            // Force synchronous reflow by reading offsetHeight (prevents stale computed styles in subsequent detectDarkContent call)
            if (doc.body) {
                void doc.body.offsetHeight;
            }

            var contentAppearsDark = detectDarkContent(doc);

            if (contentAppearsDark && appTheme === 'light') {
                console.info('[Theme Auto-Detect] Zimit content appears dark-themed while app is light, applying _invert');
                contentTheme = '_invert';
            } else if (!contentAppearsDark && appTheme === 'dark') {
                console.info('[Theme Auto-Detect] Zimit content appears light-themed while app is dark, applying _invert');
                contentTheme = '_invert';
            } else if (contentAppearsDark && appTheme === 'dark') {
                // Both are dark - no inversion needed
                console.info('[Theme Auto-Detect] Zimit content appears dark-themed and app is dark, removing inversion');
                contentTheme = null;
            } else if (!contentAppearsDark && appTheme === 'light') {
                // Both are light - no inversion needed
                console.info('[Theme Auto-Detect] Zimit content appears light-themed and app is light, removing inversion');
                contentTheme = null;
            }
        }

        // Apply content theme based on type
        if (contentTheme === '_wikimediaNative' && doc && doc.documentElement) {
            // Apply native Wikimedia theme
            applyNativeWikimediaTheme(doc, appTheme);
        } else if (!contentTheme && params.isWikimediaZim && doc && doc.documentElement) {
            // Handle plain light/dark themes on Wikimedia ZIMs (no content theme suffix)
            // Apply native theme classes if ZIM supports it, to override OS preference
            var zimHasNativeTheme = detectNativeZIMThemeSupport(doc);
            if (zimHasNativeTheme) {
                applyNativeWikimediaTheme(doc, appTheme);
            }
        } else if (contentTheme && contentTheme !== '_wikimediaNative') {
            // Apply invert-style content theme
            applyInvertContentTheme(contentTheme, doc, articleContent);
        }
    }

    // Show return link if in Config
    showReturnLinkIfConfigActive(doc);

    // Update colour scheme button
    updateColourSchemeButton(theme);

    // Return the actual theme applied
    var actualTheme = appTheme + (contentTheme || '');
    htmlEl.dataset.theme = actualTheme;

    // Log theme application details for developers
    console.debug('[applyAppTheme] Requested:', theme, '| Applied:', actualTheme,
        '| App:', appTheme, '| Content:', contentTheme || 'none',
        '| Fallback:', requestedContentTheme !== (contentTheme || ''));

    return actualTheme;
}

// Helper function to apply native Wikimedia theme classes
function applyNativeWikimediaTheme(doc, appTheme) {
    if (appTheme === 'dark') {
        // Dark mode: force night theme
        if (!doc.documentElement.classList.contains('skin-theme-clientpref-night')) {
            doc.documentElement.classList.add('skin-theme-clientpref-night');
        }
        // Remove classes one at a time for IE11 compatibility
        doc.documentElement.classList.remove('skin-theme-clientpref-os');
        doc.documentElement.classList.remove('skin-theme-clientpref-day');
    } else {
        // Light mode: remove all classes then explicitly set day theme
        // Remove classes one at a time for IE11 compatibility
        doc.documentElement.classList.remove('skin-theme-clientpref-night');
        doc.documentElement.classList.remove('skin-theme-clientpref-os');
        doc.documentElement.classList.remove('skin-theme-clientpref-day');
        doc.documentElement.classList.add('skin-theme-clientpref-day');
    }
}

// Determines whether the user has requested a dark theme based on preference and browser settings
function isDarkTheme (theme) {
    return /^auto/.test(theme) ? !!window.matchMedia('(prefers-color-scheme:dark)').matches : theme.replace(/_.*$/, '') === 'dark';
}

// Displays the return link and handles click event. Called by applyAppTheme()
function showReturnLink () {
    var viewArticle = document.getElementById('viewArticle');
    viewArticle.style.display = 'block';
}

/**
 * Detects whether the currently loaded Wikimedia article uses Wikimedia's native automatic theme system
 * Each article is checked individually as support may vary between articles in the same ZIM
 * @param {Document} zimDocument The document of the currently loaded ZIM article
 * @returns {Boolean} True if the article has Wikimedia's native automatic theme system; false otherwise
 */
function detectNativeZIMThemeSupport (zimDocument) {
    var hasProvidedWikimediaTheme = false;
    if (params.isWikimediaZim) {
        var htmlElement = zimDocument ? zimDocument.documentElement : null;
        if (htmlElement) {
            // First check if we've already detected and marked this specific article
            if (htmlElement.hasAttribute('data-kiwix-has-skin-theme-clientpref')) {
                hasProvidedWikimediaTheme = htmlElement.getAttribute('data-kiwix-has-skin-theme-clientpref') === 'true';
            } else if (htmlElement.classList) {
                // Initial detection: check if the html element has one of the dark colour scheme preference classes
                hasProvidedWikimediaTheme = /skin-theme-clientpref-(os|night)/.test(htmlElement.classList);
                // Remember this detection for subsequent theme switches on the same article
                htmlElement.setAttribute('data-kiwix-has-skin-theme-clientpref', hasProvidedWikimediaTheme ? 'true' : 'false');
            }
        }
        return hasProvidedWikimediaTheme;
    }
    return false;
}

/**
 * Opens or closes the collapsible navbar, keeping the toggler's aria-expanded state in sync.
 * Bootstrap's collapse plugin used to maintain that attribute for us, but we no longer load it,
 * so every path that opens or closes the navbar must go through this function.
 * @param {Boolean} [show] True to open the navbar, false to close it; omit to toggle current state
 */
function toggleNavbar (show) {
    var navbarCollapse = document.querySelector('.navbar-collapse');
    var toggler = document.querySelector('.navbar-toggler');
    if (!navbarCollapse) return;
    // NB the second ('force') argument of classList.toggle is unsupported in IE11, so we branch manually
    var expanded = typeof show === 'undefined' ? !navbarCollapse.classList.contains('show') : !!show;
    if (expanded) navbarCollapse.classList.add('show');
    else navbarCollapse.classList.remove('show');
    if (toggler) toggler.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}

// Function to switch back to currently loaded page
function returnToCurrentPage () {
    document.getElementById('liConfigureNav').classList.remove('active');
    document.getElementById('liAboutNav').classList.remove('active');
    document.getElementById('liHomeNav').classList.add('active');
    document.getElementById('btnHome').focus();
    toggleNavbar(false);
    tabTransitionToSection('home', params.showUIAnimations);
    const welcomeText = document.getElementById('welcomeText');
    welcomeText.style.display = 'none';
    document.getElementById('viewArticle').style.display = 'none';
}

// Reports an error in loading one of the ASM or WASM machines to the UI API Status Panel
// This can't be done in app.js because the error occurs after the API panel is first displayed
function reportAssemblerErrorToAPIStatusPanel (decoderType, error, assemblerMachineType) {
    console.error('Could not instantiate any ' + decoderType + ' decoder!', error);
    params.decompressorAPI.assemblerMachineType = assemblerMachineType;
    params.decompressorAPI.errorStatus = (translateUI.t('api-decompressor-error-loading-part1') || 'Error loading') + ' ' + decoderType + ' ' +
        (translateUI.t('api-decompressor-error-loading-part2') || 'decompressor!');
    var decompAPI = document.getElementById('decompressorAPIStatus');
    decompAPI.textContent = (translateUI.t('api-decompressor-label') || 'Decompressor API:') + ' ' + params.decompressorAPI.errorStatus;
    decompAPI.className = 'apiBroken';
    document.getElementById('apiStatusDiv').className = 'card card-danger';
}

// Reports the search provider to the API Status Panel
function reportSearchProviderToAPIStatusPanel (provider) {
    var providerAPI = document.getElementById('searchProviderStatus');
    if (providerAPI) { // NB we need this so that tests don't fail
        providerAPI.textContent = (translateUI.t('api-searchprovider-label') || 'Search Provider:') + ' ' + (/^fulltext/.test(provider)
            ? (translateUI.t('api-searchprovider-title') || 'Title') + ' + Xapian [' + provider + ']'
            : /^title/.test(provider) ? (translateUI.t('api-searchprovider-titleonly') || 'Title only') + ' [' + provider + ']'
            : (translateUI.t('api-error-uninitialized_masculine') || 'Not initialized'));
        providerAPI.className = /^fulltext/.test(provider) ? 'apiAvailable' : !/ERROR/.test(provider) ? 'apiUnavailable' : 'apiBroken';
    }
}

/**
 * Warn the user that they clicked on an external link, and open it in a new tab
 *
 * @param {Event} event The click event to handle. If not provided, then clickedAnchor must be provided.
 * @param {Element} clickedAnchor The DOM anchor that has been clicked (optional, defaults to event.target)
 * @param {ZIMArchive} archive The archive object from which the link was scraped (optional)
 */
function warnAndOpenExternalLinkInNewTab (event, clickedAnchor, archive) {
    if (event) {
        // We have to prevent any blank target from firing on the original event
        event.target.removeAttribute('target');
        event.preventDefault();
        event.stopPropagation();
    }
    if (!clickedAnchor) clickedAnchor = event.target;
    // This is for Zimit-style relative links where the link isn't in the archive, so we have to reconstruct the original URL it was scraped from
    if (archive && articleContainer.contentWindow && clickedAnchor.origin === articleContainer.contentWindow.location.origin) {
        clickedAnchor.href = clickedAnchor.href.replace(clickedAnchor.origin, archive.source.replace(/\/$/, ''));
    }
    var target = clickedAnchor.target;
    if (!target) {
        target = '_blank';
    }
    let href = clickedAnchor.href;
    // @WORKAROUND: Note that for Zimit2 ZIMs (only), any querystring in an external link will be overencoded.
    // See https://github.com/kiwix/kiwix-js/issues/1258. DEV: Monitor this issue, and remove the workaround if it is fixed upstream.
    if (params.zimType === 'zimit2') {
        href = decodeURIComponent(href);
    }
    if (params.hideExternalLinkWarning) {
        window.open(href, target);
        return;
    }
    var message = translateUI.t('dialog-open-externalurl-message') || '<p>Do you want to open this external link?';
    if (target === '_blank') {
        message += ' ' + (translateUI.t('dialog-open-externalurl-newtab') || '(in a new tab)');
    }
    message += '</p><p style="word-break:break-all;">' + href + '</p>';
    systemAlert(message, translateUI.t('dialog-open-externalurl-title') || 'Opening external link', true, null, null, null, null, true).then(function (response) {
        if (response) {
            window.open(href, target);
        }
    });
}

/**
 * Finds the closest <a> or <area> enclosing tag of an element.
 * Returns undefined if there isn't any.
 *
 * @param {Element} element The element to test
 * @returns {Element} closest enclosing anchor tag (if any)
 */
function closestAnchorEnclosingElement (element) {
    if (Element.prototype.closest) {
        // Recent browsers support that natively. See https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
        return element.closest('a,area');
    } else {
        // For other browsers, notably IE, we do that by hand (we did not manage to make polyfills work on IE11)
        var currentElement = element;
        while (currentElement.tagName !== 'A' && currentElement.tagName !== 'AREA') {
            // If there is no parent Element, we did not find any enclosing A tag
            if (!currentElement.parentElement) {
                return;
            } else {
                // Else we try the next parent Element
                currentElement = currentElement.parentElement;
            }
        }
        // If we reach this line, it means the currentElement is the enclosing Anchor we're looking for
        return currentElement;
    }
}

/**
 * Get the base language code that has been set in the browser
 * If the browser language is unavailable, the default language is set to British English
 *
 * @returns {Object} A language object consisting of a base language code and a locale
 */

function getBrowserLanguage () {
    // This defines the default language to return if user hasn't selected one
    var language = {
        base: 'en',
        locale: 'GB'
    }
    var fullLanguage = navigator.language || navigator.userLanguage;
    if (fullLanguage) {
        language.base = fullLanguage.replace(/-.+$/, '').toLowerCase();
        language.locale = fullLanguage.replace(/^[^-]+-/, '').toUpperCase();
    }
    return language;
}

/**
 * Handles the click on the title of an article in search results
 * @param {Event} event The click event to handle
 * @param {Function} findDirEntryCallback Callback to find and launch article
 */
function handleTitleClick(event, findDirEntryCallback) {
    event.preventDefault();
    // User may have clicked on a child element of the list item if it contains HTML (for example, italics),
    // so we may need to find the closest list item
    let target = event.target;
    if (!/list-group-item/.test(target.className)) {
        console.warn('User clicked on child element of list item, looking for parent...');
        while (target && !/list-group-item/.test(target.className)) {
            target = target.parentNode;
        }
        if (!target) {
            // No list item found, so we can't do anything
            console.warn('No list item could be found for clicked event!');
            return;
        }
    }
    var dirEntryId = decodeURIComponent(target.getAttribute('dirEntryId'));
    findDirEntryCallback(dirEntryId);
}

/**
 * Creates and inserts snippet elements for search results
 * @param {Array} entriesArray Array of directory entries
 * @param {NodeList} links The article link elements  
 * @param {Number} length Number of items to process
 */
function createSnippetElements(entriesArray, links, length) {
    for (var i = 0; i < length; i++) {
        var dirEntry = entriesArray[i];
        
        // Add snippet if it exists
        if (dirEntry.snippet && links[i]) {
            var snippetId = 'snippet-' + i;
            
            // Create snippet container
            var snippetContainer = document.createElement('div');
            snippetContainer.className = 'snippet-container';
            
            // Create and populate snippet header
            var snippetHeader = document.createElement('div');
            snippetHeader.className = 'snippet-header';
            snippetHeader.tabIndex = 0;
            snippetHeader.setAttribute('data-target', snippetId);
            snippetHeader.setAttribute('aria-expanded', 'false');
            
            var indicator = document.createElement('span');
            indicator.className = 'snippet-indicator';
            indicator.textContent = '▶';
            
            var preview = document.createElement('span');
            preview.className = 'snippet-preview';
            preview.innerHTML = dirEntry.snippet.substring(0, 80) + '...';
            
            snippetHeader.appendChild(indicator);
            snippetHeader.appendChild(preview);
            
            // Create snippet content
            var content = document.createElement('div');
            content.id = snippetId;
            content.className = 'snippet-content collapsed';
            content.innerHTML = dirEntry.snippet;
            
            // Assemble and insert
            snippetContainer.appendChild(snippetHeader);
            snippetContainer.appendChild(content);
            
            // Insert after the article link
            links[i].parentNode.insertBefore(snippetContainer, links[i].nextSibling);
        }
    }
}

/**
 * Expands or collapses fulltext search snippet content when the header is selected
 * @param {Element} ele The container element that was selected 
 * @param {Event} ev The event to handle or null if called programmatically  
*/
function toggleSnippet (ele, ev) {
    if (ev) {
        ev.preventDefault();
        ev.stopPropagation(); // Prevent triggering the article link        
    }
    var header = ele.children[0]; // Snippet header
    var content = ele.children[1]; // Snippet content
    var isExpanded = header.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
        // Collapse
        content.classList.add('collapsed');
        header.setAttribute('aria-expanded', 'false');
    } else {
        // Expand
        content.classList.remove('collapsed');
        header.setAttribute('aria-expanded', 'true');
    }
}

/**
 * Attaches event listeners to article list and snippet container elements
 * @param {Function} findDirEntryCallback Function to find and launch article by dirEntryId
 * @param {Object} appstate App state object containing search status
 */
function attachArticleListEventListeners(findDirEntryCallback, appstate) {
    // We have to use mousedown below instead of click as otherwise the prefix blur event fires first
    // and prevents this event from firing; note that touch also triggers mousedown
    document.querySelectorAll('#articleList a, .snippet-container').forEach(function (element) {
        element.addEventListener('mousedown', function (e) {
            if (element.classList.contains('snippet-container')) {
                // Handle snippet toggle
                toggleSnippet(element, e);
            } else {
                // Handle article link
                appstate.search.status = 'cancelled';
                handleTitleClick(e, findDirEntryCallback);
            }
        });
        
        // Add hover functionality for snippet containers with delay
        if (element.classList.contains('snippet-container')) {
            var hoverTimeout;
            element.addEventListener('mouseenter', function () {
                // Clear any existing timeout
                if (hoverTimeout) {
                    clearTimeout(hoverTimeout);
                }
                // Set a delay before expanding (e.g., 300ms)
                hoverTimeout = setTimeout(function() {
                    // Safety check: ensure the element still has the expected children
                    if (element.children.length < 2) return;
                    
                    var header = element.children[0];
                    var content = element.children[1];
                    var isExpanded = header.getAttribute('aria-expanded') === 'true';
                    // Only expand if not already expanded
                    if (!isExpanded) {
                        content.classList.remove('collapsed');
                        header.setAttribute('aria-expanded', 'true');
                    }
                }, 400);
            });
            
            element.addEventListener('mouseleave', function () {
                // Clear the timeout if user leaves before delay completes
                if (hoverTimeout) {
                    clearTimeout(hoverTimeout);
                    hoverTimeout = null;
                }
                // Safety check: ensure the element still has the expected children
                if (element.children.length < 2) return;
                
                // Always collapse on mouse leave
                // var header = element.children[0];
                // var content = element.children[1];
                // content.classList.add('collapsed');
                // header.setAttribute('aria-expanded', 'false');
            });
        }
    });
}


/**
 * Functions and classes exposed by this module
 */
return {
    hideSlidingUIElements: hideSlidingUIElements,
    showSlidingUIElements: showSlidingUIElements,
    scroller: scroller,
    systemAlert: systemAlert,
    feedNodeWithDataURI: feedNodeWithDataURI,
    getDataUriFromUint8Array: getDataUriFromUint8Array,
    determineCanvasElementsWorkaround: determineCanvasElementsWorkaround,
    replaceCSSLinkWithInlineCSS: replaceCSSLinkWithInlineCSS,
    deriveZimUrlFromRelativeUrl: deriveZimUrlFromRelativeUrl,
    setUpTOC: setUpTOC,
    toggleNavbar: toggleNavbar,
    removeUrlParameters: removeUrlParameters,
    displayActiveContentWarning: displayActiveContentWarning,
    displayFileDownloadAlert: displayFileDownloadAlert,
    checkUpdateStatus: checkUpdateStatus,
    checkServerIsAccessible: checkServerIsAccessible,
    spinnerDisplay: spinnerDisplay,
    isElementInView: isElementInView,
    removeAnimationClasses: removeAnimationClasses,
    tabTransitionToSection: tabTransitionToSection,
    applyAppTheme: applyAppTheme,
    isDarkTheme: isDarkTheme,
    detectNativeZIMThemeSupport: detectNativeZIMThemeSupport,
    reportAssemblerErrorToAPIStatusPanel: reportAssemblerErrorToAPIStatusPanel,
    reportSearchProviderToAPIStatusPanel: reportSearchProviderToAPIStatusPanel,
    warnAndOpenExternalLinkInNewTab: warnAndOpenExternalLinkInNewTab,
    closestAnchorEnclosingElement: closestAnchorEnclosingElement,
    getBrowserLanguage: getBrowserLanguage,
    returnToCurrentPage: returnToCurrentPage,
    fromSection: fromSection,
    handleTitleClick: handleTitleClick,
    createSnippetElements: createSnippetElements,
    toggleSnippet: toggleSnippet,
    attachArticleListEventListeners: attachArticleListEventListeners
};
});
__def("zimDirEntry", [], function(){
/**
 * zimDirEntry.js: Container to hold data of a ZIM directory entry.
 *
 * Copyright 2015 Mossroy and contributors
 * Licence GPL v3:
 *
 * This file is part of Kiwix.
 *
 * Kiwix is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public Licence as published by
 * the Free Software Foundation, either version 3 of the Licence, or
 * (at your option) any later version.
 *
 * Kiwix is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public Licence for more details.
 *
 * You should have received a copy of the GNU General Public Licence
 * along with Kiwix (file LICENSE-GPLv3.txt).  If not, see <http://www.gnu.org/licenses/>
 */

'use strict';

function DirEntry (zimfile, dirEntryData) {
    this._zimfile = zimfile;
    this.redirect = dirEntryData.redirect;
    this.offset = dirEntryData.offset;
    this.mimetypeInteger = dirEntryData.mimetypeInteger;
    this.namespace = dirEntryData.namespace;
    this.redirectTarget = dirEntryData.redirectTarget;
    this.cluster = dirEntryData.cluster;
    this.blob = dirEntryData.blob;
    this.url = dirEntryData.url;
    this.title = dirEntryData.title;
}

/**
 * Serialize some attributes of a DirEntry, to be able to store them in a HTML tag attribute,
 * and retrieve them later.
 *
 * @returns {String}
 */
DirEntry.prototype.toStringId = function () {
    // @todo also store isRedirect and redirectTarget
    return this.offset + '|' + this.mimetypeInteger + '|' + this.namespace + '|' + this.cluster + '|' +
            this.blob + '|' + this.url + '|' + this.title + '|' + this.redirect + '|' + this.redirectTarget;
};

/**
 *
 * @returns {Boolean}
 */
DirEntry.prototype.isRedirect = function () {
    return this.redirect;
};

/**
 *
 * @returns {Promise}
 */
DirEntry.prototype.readData = function () {
    return this._zimfile.blob(this.cluster, this.blob);
};

/**
 *
 * @param {File} zimfile
 * @param {String} stringId
 * @returns {DirEntry}
 */
DirEntry.fromStringId = function (zimfile, stringId) {
    var data = {};
    var idParts = stringId.split('|');
    data.offset = parseInt(idParts[0], 10);
    data.mimetypeInteger = parseInt(idParts[1], 10);
    data.namespace = idParts[2];
    data.cluster = parseInt(idParts[3], 10);
    data.blob = parseInt(idParts[4], 10);
    data.url = idParts[5];
    data.title = idParts[6];
    data.redirect = (idParts[7] === 'true');
    data.redirectTarget = idParts[8];
    return new DirEntry(zimfile, data);
};

/**
 * Defines a function that returns the URL if the title is empty, as per the specification
 * See https://wiki.openzim.org/wiki/ZIM_file_format#Directory_Entries
 *
 * @returns {String} The dirEntry's title or, if empty, the dirEntry's (unescaped) URL
 */
DirEntry.prototype.getTitleOrUrl = function () {
    return this.title ? this.title : this.url;
};

/**
 * Looks up the dirEntry's mimetype number in the ZIM file's MIME type list, and returns the corresponding MIME type
 *
 * @return {String} The MIME type corresponding to mimetypeInteger in the ZIM file's MIME type list
 */
DirEntry.prototype.getMimetype = function () {
    return this._zimfile.mimeTypes.get(this.mimetypeInteger);
};

return {
    DirEntry: DirEntry
};
});
__def("filecache", [], function(){
﻿/**
 * filecache.js: Generic cache for small, frequently read file slices.
 * It discards cached blocks according to a least-recently-used algorithm.
 * It is used primarily for fast Directory Entry lookup, speeding up binary search.
 *
 * Copyright 2020 Mossroy, peter-x, jaifroid and contributors
 * Licence GPL v3:
 *
 * This file is part of Kiwix.
 *
 * Kiwix JS is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public Licence as published by
 * the Free Software Foundation, either version 3 of the Licence, or
 * (at your option) any later version.
 *
 * Kiwix JS is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public Licence for more details.
 *
 * You should have received a copy of the GNU General Public Licence
 * along with Kiwix JS (file LICENSE).  If not, see <http://www.gnu.org/licenses/>
 */

'use strict';

const MAX_CACHE_SIZE = 4000;

/**
 * The maximum blocksize to read or store via the block cache (bytes)
 * @constant
 * @type {Number}
 */
const BLOCK_SIZE = 4096;

/**
 * A Block Cache employing a Least Recently Used caching strategy
 * @typedef {Object} BlockCache
 * @property {Number} capacity The maximum number of entries in the cache
 * @property {Map} cache A map to store the cache keys and data
 */

/**
 * Creates a new cache with max size limit of MAX_CACHE_SIZE blocks
 * LRUCache implemnentation with Map adapted from https://markmurray.co/blog/lru-cache/
 */
function LRUCache () {
    /** CACHE TUNING **/
    // console.log('Creating cache of size ' + MAX_CACHE_SIZE + ' * ' + BLOCK_SIZE + ' bytes');
    // Initialize persistent Cache properties
    this.capacity = MAX_CACHE_SIZE;
    this.cache = new Map();
}

/**
 * Tries to retrieve an element by its id. If it is not present in the cache, returns undefined; if it is present,
 * then the value is returned and the entry is moved to the bottom of the cache
 * @param {String} key The block cache entry key (file.id + ':' + byte offset)
 * @returns {Uint8Array | undefined} The requested cache data or undefined
 */
LRUCache.prototype.get = function (key) {
    var entry = this.cache.get(key);
    // If the key does not exist, return
    if (!entry) return entry;
    // Remove the key and re-insert it (this moves the key to the bottom of the Map: bottom = most recent)
    this.cache.delete(key);
    this.cache.set(key, entry);
    // Return the cached data
    return entry;
};

/**
 * Stores a value in the cache by id and prunes the least recently used entry if the cache is larger than MAX_CACHE_SIZE
 * @param {String} key The key under which to store the value (file.id + ':' + byte offset from start of ZIM archive)
 * @param {Uint8Array} value The value to store in the cache
 */
LRUCache.prototype.store = function (key, value) {
    // We get the existing entry's object for memory-management purposes; if it exists, it will contain identical data
    // to <value>, but <entry> is strongly referenced by the Map. (It should be rare that two async Promises attempt to
    // store the same data in the Cache, once the Cache is sufficiently populated.)
    var entry = this.cache.get(key);
    // If the key already exists, delete it and re-insert it, so that it will be added
    // to the bottom of the Map (bottom = most recent)
    if (entry) this.cache.delete(key);
    else entry = value;
    this.cache.set(key, entry);
    // If we've exceeded the cache capacity, then delete the least recently accessed value,
    // which will be the item at the top of the Map, i.e the first position
    if (this.cache.size > this.capacity) {
        if (this.cache.keys) {
            var firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        } else {
            // IE11 doesn't support the keys iterator, so we have to do a forEach loop through all 4000 entries
            // to get the oldest values. To prevent excessive iterations, we delete 25% at a time.
            var q = Math.floor(0.25 * this.capacity);
            var c = 0;
            // console.log('Deleteing ' + q + ' cache entries');
            this.cache.forEach(function (v, k, map) {
                if (c > q) return;
                map.delete(k);
                c++;
            });
        }
    }
};

/**
 * A new Block Cache
 * @type {BlockCache}
 */
var cache = new LRUCache();

/** CACHE TUNING **/
// DEV: Uncomment this block and blocks below marked 'CACHE TUNING' to measure Cache hit and miss rates for different Cache sizes
// var hits = 0;
// var misses = 0;

/**
 * Read a certain byte range in the given file, breaking the range into chunks that go through the cache
 * If a read of more than BLOCK_SIZE * 2 (bytes) is requested, do not use the cache
 * @param {Object} file The requested ZIM archive to read from
 * @param {Number} begin The byte from which to start reading
 * @param {Number} end The byte at which to stop reading (end will not be read)
 * @return {Promise<Uint8Array>} A Promise that resolves to the correctly concatenated data from the cache
 *     or from the ZIM archive
 */
var read = function (file, begin, end) {
    // Read large chunks bypassing the block cache because we would have to
    // stitch together too many blocks and would clog the cache
    if (end - begin > BLOCK_SIZE * 2) return file._readSplitSlice(begin, end);
    var readRequests = [];
    var blocks = {};
    // Look for the requested data in the blocks: we may need to stitch together data from two or more blocks
    for (var id = Math.floor(begin / BLOCK_SIZE) * BLOCK_SIZE; id < end; id += BLOCK_SIZE) {
        var block = cache.get(file.id + ':' + id);
        if (block === undefined) {
            // Data not in cache, so read from archive
            /** CACHE TUNING **/
            // misses++;
            // DEV: This is a self-calling function, i.e. the function is called with an argument of <id> which then
            // becomes the <offset> parameter
            readRequests.push(function (offset) {
                return file._readSplitSlice(offset, offset + BLOCK_SIZE).then(function (result) {
                    cache.store(file.id + ':' + offset, result);
                    blocks[offset] = result;
                });
            }(id));
        } else {
            /** CACHE TUNING **/
            // hits++;
            blocks[id] = block;
        }
    }
    /** CACHE TUNING **/
    // if (misses + hits > 2000) {
    //     console.log('** Block cache hit rate: ' + Math.round(hits / (hits + misses) * 1000) / 10 + '% [ hits:' + hits +
    //         ' / misses:' + misses + ' ] Size: ' + cache.cache.size);
    //     hits = 0;
    //     misses = 0;
    // }
    // Wait for all the blocks to be read either from the cache or from the archive
    return Promise.all(readRequests).then(function () {
        var result = new Uint8Array(end - begin);
        var pos = 0;
        // Stitch together the data parts in the right order
        for (var i = Math.floor(begin / BLOCK_SIZE) * BLOCK_SIZE; i < end; i += BLOCK_SIZE) {
            var b = Math.max(i, begin) - i;
            var e = Math.min(end, i + BLOCK_SIZE) - i;
            if (blocks[i].subarray) result.set(blocks[i].subarray(b, e), pos);
            pos += e - b;
        }
        return result;
    });
};

return {
    read: read
};
});
__def("xzdec-asm", [], function(){

var XZ = (function() {
  var _scriptDir = __LIB_URL;
  
  return (
function(XZ) {
  XZ = XZ || {};


var a;a||(a=typeof XZ !== 'undefined' ? XZ : {});
var Promise=function(){function b(){}function e(c,f){return function(){c.apply(f,arguments)}}function d(c){if(!(this instanceof d))throw new TypeError("Promises must be constructed via new");if("function"!==typeof c)throw new TypeError("not a function");this.s=0;this.B=!1;this.u=void 0;this.v=[];P(c,this)}function m(c,f){for(;3===c.s;)c=c.u;0===c.s?c.v.push(f):(c.B=!0,d.C(function(){var g=1===c.s?f.F:f.G;if(null===g)(1===c.s?h:k)(f.promise,c.u);else{try{var l=g(c.u)}catch(p){k(f.promise,p);return}h(f.promise,
l)}}))}function h(c,f){try{if(f===c)throw new TypeError("A promise cannot be resolved with itself.");if(f&&("object"===typeof f||"function"===typeof f)){var g=f.then;if(f instanceof d){c.s=3;c.u=f;v(c);return}if("function"===typeof g){P(e(g,f),c);return}}c.s=1;c.u=f;v(c)}catch(l){k(c,l)}}function k(c,f){c.s=2;c.u=f;v(c)}function v(c){2===c.s&&0===c.v.length&&d.C(function(){c.B||d.D(c.u)});for(var f=0,g=c.v.length;f<g;f++)m(c,c.v[f]);c.v=null}function I(c,f,g){this.F="function"===typeof c?c:null;this.G=
"function"===typeof f?f:null;this.promise=g}function P(c,f){var g=!1;try{c(function(l){g||(g=!0,h(f,l))},function(l){g||(g=!0,k(f,l))})}catch(l){g||(g=!0,k(f,l))}}d.prototype["catch"]=function(c){return this.then(null,c)};d.prototype.then=function(c,f){var g=new this.constructor(b);m(this,new I(c,f,g));return g};d.all=function(c){return new d(function(f,g){function l(Q,w){try{if(w&&("object"===typeof w||"function"===typeof w)){var R=w.then;if("function"===typeof R){R.call(w,function(J){l(Q,J)},g);
return}}p[Q]=w;0===--ea&&f(p)}catch(J){g(J)}}if(!Array.isArray(c))return g(new TypeError("Promise.all accepts an array"));var p=Array.prototype.slice.call(c);if(0===p.length)return f([]);for(var ea=p.length,C=0;C<p.length;C++)l(C,p[C])})};d.resolve=function(c){return c&&"object"===typeof c&&c.constructor===d?c:new d(function(f){f(c)})};d.reject=function(c){return new d(function(f,g){g(c)})};d.race=function(c){return new d(function(f,g){if(!Array.isArray(c))return g(new TypeError("Promise.race accepts an array"));
for(var l=0,p=c.length;l<p;l++)d.resolve(c[l]).then(f,g)})};d.C="function"===typeof setImmediate&&function(c){setImmediate(c)}||function(c){setTimeout(c,0)};d.D=function(c){"undefined"!==typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",c)};return d}(),n,q;a.ready=new Promise(function(b,e){n=b;q=e});var r={},t;for(t in a)a.hasOwnProperty(t)&&(r[t]=a[t]);var u="";"undefined"!==typeof document&&document.currentScript&&(u=document.currentScript.src);_scriptDir&&(u=_scriptDir);
0!==u.indexOf("blob:")?u=u.substr(0,u.replace(/[?#].*/,"").lastIndexOf("/")+1):u="";var x=a.printErr||console.warn.bind(console);for(t in r)r.hasOwnProperty(t)&&(a[t]=r[t]);r=null;var y;a.wasmBinary&&(y=a.wasmBinary);var noExitRuntime=a.noExitRuntime||!0;function aa(){this.buffer=new ArrayBuffer(z/65536*65536)}function ba(){this.exports=(
// EMSCRIPTEN_START_ASM
function instantiate(V){function c(d){d.set=function(a,b){this[a]=b};d.get=function(a){return this[a]};return d}var e;var f=new Uint8Array(123);for(var a=25;a>=0;--a){f[48+a]=52+a;f[65+a]=a;f[97+a]=26+a}f[43]=62;f[47]=63;function l(m,n,o){var g,h,a=0,i=n,j=o.length,k=n+(j*3>>2)-(o[j-2]=="=")-(o[j-1]=="=");for(;a<j;a+=4){g=f[o.charCodeAt(a+1)];h=f[o.charCodeAt(a+2)];m[i++]=f[o.charCodeAt(a)]<<2|g>>4;if(i<k)m[i++]=g<<4|h>>2;if(i<k)m[i++]=h<<6|f[o.charCodeAt(a+3)]}}function p(q){l(e,1024,"/Td6WFo=");l(e,1032,"QBRQ")}function T(U){var r=U.a;var s=r.buffer;var t=new Int8Array(s);var u=new Int16Array(s);var v=new Int32Array(s);var w=new Uint8Array(s);var x=new Uint16Array(s);var y=new Uint32Array(s);var z=new Float32Array(s);var A=new Float64Array(s);var B=Math.imul;var C=Math.fround;var D=Math.abs;var E=Math.clz32;var F=Math.min;var G=Math.max;var H=Math.floor;var I=Math.ceil;var J=Math.trunc;var K=Math.sqrt;var L=U.abort;var M=NaN;var N=Infinity;var O=U.b;var P=U.c;var Q=0;
// EMSCRIPTEN_START_FUNCS
function pa(a){a=a|0;var b=0,c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,x=0,z=0;d=v[a>>2];a:{if(v[d+36>>2]){h=v[d>>2];break a}t[d+40|0]=0;v[d>>2]=0;v[d+4>>2]=0;v[d+24>>2]=0;v[d+28>>2]=0;_(d+72|0,100);v[d+172>>2]=12;h=0}z=v[a+20>>2];s=v[a+8>>2];v[d+16>>2]=s;x=d+96|0;p=d+176|0;n=d+168|0;while(1){b:{c:{d:{e:{f:{g:{h:{i:{j:{k:{l:{m:{switch(h|0){case 2:b=v[a+8>>2];e=v[a+4>>2];h=v[d+172>>2];c=v[a+12>>2];g=v[d+168>>2];break l;case 0:h=v[a+8>>2];e=v[a+12>>2]-h|0;c=v[d+168>>2];b=v[d+172>>2]-c|0;b=b>>>0>e>>>0?e:b;W((c+n|0)+8|0,h+v[a+4>>2]|0,b);v[a+8>>2]=b+v[a+8>>2];c=0;e=b+v[d+168>>2]|0;b=v[d+172>>2];v[d+168>>2]=(b|0)==(e|0)?0:e;if((b|0)!=(e|0)){break b}v[d>>2]=1;if(fa(p,1024,6)){c=5;break b}c=6;if(w[d+182|0]){break b}b=w[d+183|0];v[d+32>>2]=b;if(!(1<<b&19)|b>>>0>4){break b}break;case 9:break h;case 8:break i;case 7:break j;case 6:break k;case 1:break m;case 5:break c;case 4:break d;case 3:break e;default:continue}}b=v[a+8>>2];c=v[a+12>>2];if((b|0)==(c|0)){c=0;break b}e=v[a+4>>2];h=w[e+b|0];if(!h){v[a+8>>2]=b+1;v[d+16>>2]=b;h=6;v[d>>2]=6;continue}v[d+168>>2]=0;v[d>>2]=2;h=(h<<2)+4|0;v[d+172>>2]=h;v[d+64>>2]=h;g=0}e=b+e|0;c=c-b|0;b=h-g|0;b=b>>>0>c>>>0?c:b;W((g+n|0)+8|0,e,b);v[a+8>>2]=b+v[a+8>>2];c=0;e=b+v[d+168>>2]|0;b=v[d+172>>2];v[d+168>>2]=(b|0)==(e|0)?0:e;if((b|0)!=(e|0)){break b}b=e-4|0;v[d+172>>2]=b;c=Y(p,b,0);q=v[d+172>>2];b=q+d|0;if((c|0)!=(w[b+176|0]|w[b+177|0]<<8|(w[b+178|0]<<16|w[b+179|0]<<24))){c=7;break b}v[d+168>>2]=2;m=t[d+177|0];if(m&63){c=6;break b}b=2;o=-1;l=-1;g=-1;f=-1;if(!(m&64)){break f}h=v[d+4>>2];if(!h){v[d+8>>2]=0;v[d+12>>2]=0}j=q>>>0>2?q:2;while(1){if((b|0)==(j|0)){c=7;break b}r=w[(b+n|0)+8|0];b=b+1|0;v[d+168>>2]=b;e=d;k=v[d+12>>2];g=r&127;c=h;i=c&31;if((c&63)>>>0>=32){f=g<<i;c=0}else{f=(1<<i)-1&g>>>32-i;c=g<<i}g=c|v[d+8>>2];c=f|k;f=c;v[e+8>>2]=g;v[e+12>>2]=c;if(!(r&128)){if(!(!h|r)){c=7;break b}v[d+4>>2]=0;break f}c=7;h=h+7|0;v[d+4>>2]=h;if((h|0)!=63){continue}break}break b}n=d+144|0;n:{while(1){c=v[a+12>>2];l=v[a+4>>2];h=v[d+4>>2];if(!h){v[d+8>>2]=0;v[d+12>>2]=0}b=v[a+8>>2];j=b>>>0>c>>>0?b:c;o:{while(1){p:{if((b|0)==(j|0)){c=0;b=j;break p}m=w[b+l|0];b=b+1|0;v[a+8>>2]=b;k=d;f=v[d+12>>2];g=m&127;c=h;p=c&31;if((c&63)>>>0>=32){e=g<<p;c=0}else{e=(1<<p)-1&g>>>32-p;c=g<<p}g=c|v[d+8>>2];c=e|f;f=c;v[k+8>>2]=g;v[k+12>>2]=c;if(!(m&128)){if(!h|m){break o}c=7;break p}c=7;h=h+7|0;v[d+4>>2]=h;if((h|0)!=63){continue}}break}e=v[d+132>>2];g=v[d+16>>2];f=b-g|0;b=f;k=b+v[d+128>>2]|0;v[d+128>>2]=k;v[d+132>>2]=b>>>0>k>>>0?e+1|0:e;v[d+24>>2]=Y(g+l|0,b,v[d+24>>2]);v[d+28>>2]=0;break n}v[d+4>>2]=0;q:{r:{switch(v[d+120>>2]){case 0:v[d+136>>2]=g;v[d+140>>2]=f;c=7;if((g|0)!=v[d+88>>2]|(f|0)!=v[d+92>>2]){break n}v[d+120>>2]=1;break q;case 2:f=f+v[d+156>>2]|0;c=g+v[d+152>>2]|0;f=c>>>0<g>>>0?f+1|0:f;b=d;v[b+152>>2]=c;v[b+156>>2]=f;v[b+160>>2]=Y(n,24,v[b+160>>2]);v[b+120>>2]=1;b=v[b+136>>2];f=v[d+140>>2]-!b|0;g=b-1|0;v[d+136>>2]=g;v[d+140>>2]=f;break q;case 1:v[d+120>>2]=2;f=f+v[d+148>>2]|0;c=g+v[d+144>>2]|0;f=c>>>0<g>>>0?f+1|0:f;b=d;v[b+144>>2]=c;v[b+148>>2]=f;break;default:break r}}g=v[d+136>>2];f=v[d+140>>2]}if(g|f){continue}break}c=1}if((c|0)!=1){break b}v[d>>2]=7}n=v[d+128>>2];b=v[a+8>>2];j=v[d+16>>2];c=b-j|0;e=n+c|0;s:{if(!(e&3)){break s}i=v[a+4>>2];if(v[a+12>>2]==(b|0)){e=b;break g}e=b+1|0;v[a+8>>2]=e;c=7;if(w[b+i|0]){break b}g=e-j|0;k=g+n|0;t:{if(!(k&3)){break t}i=v[a+4>>2];if(v[a+12>>2]==(e|0)){break g}f=b+2|0;v[a+8>>2]=f;if(w[e+i|0]){break b}g=f-j|0;k=g+n|0;if(!(k&3)){b=f;break s}i=v[a+4>>2];if((f|0)==v[a+12>>2]){e=f;break g}e=b+3|0;v[a+8>>2]=e;if(w[f+i|0]){break b}g=e-j|0;k=g+n|0;if(!(k&3)){break t}if(v[a+12>>2]==(e|0)){i=v[a+4>>2];break g}v[a+8>>2]=b+4;break b}b=e}ba(d,v[a+4>>2],b);c=7;if(fa(x,d+144|0,24)){break b}v[d>>2]=8}b=v[a+8>>2];k=v[a+12>>2];u:{while(1){f=0;if((b|0)==(k|0)){break u}g=v[d+24>>2];e=v[d+28>>2];h=v[d+4>>2];c=b+1|0;v[a+8>>2]=c;l=w[v[a+4>>2]+b|0];b=h;j=b&31;f=7;if((l|0)!=(((b&63)>>>0>=32?e>>>j|0:((1<<j)-1&e)<<32-j|g>>>j)&255)){break u}e=h+8|0;v[d+4>>2]=e;b=c;if(e>>>0<32){continue}break}v[d+4>>2]=0;v[d+24>>2]=0;v[d+28>>2]=0;f=1}c=f;if((c|0)!=1){break b}v[d>>2]=9;v[d+172>>2]=12}c=0;f=v[a+8>>2];h=v[a+12>>2]-f|0;e=v[d+168>>2];b=v[d+172>>2]-e|0;b=b>>>0>h>>>0?h:b;W((d+e|0)+176|0,f+v[a+4>>2]|0,b);v[a+8>>2]=b+v[a+8>>2];b=b+v[d+168>>2]|0;e=(b|0)==v[d+172>>2];v[d+168>>2]=e?0:b;if(!e){break b}b=7;v:{if((w[d+186|0]|w[d+187|0]<<8)!=23129){break v}if((Y(d+180|0,6,0)|0)!=(w[d+176|0]|w[d+177|0]<<8|(w[d+178|0]<<16|w[d+179|0]<<24))){break v}e=v[d+132>>2];f=e>>>2|0;if(w[d+184|0]|((w[d+180|0]|w[d+181|0]<<8|(w[d+182|0]<<16|w[d+183|0]<<24))!=((e&3)<<30|v[d+128>>2]>>>2)|f)){break v}b=v[d+32>>2]==w[d+185|0]?1:7}c=b;break b}ba(d,i,e);c=0;break b}v[d+48>>2]=g;v[d+52>>2]=f;if((m|0)<0){h=v[d+4>>2];if(!h){v[d+8>>2]=0;v[d+12>>2]=0}k=b>>>0>q>>>0?b:q;while(1){if((b|0)==(k|0)){c=7;break b}m=w[(b+n|0)+8|0];b=b+1|0;v[d+168>>2]=b;f=d;g=v[d+12>>2];j=m&127;c=h;l=c&31;if((c&63)>>>0>=32){e=j<<l;c=0}else{e=(1<<l)-1&j>>>32-l;c=j<<l}o=c|v[d+8>>2];c=e|g;l=c;v[f+8>>2]=o;v[f+12>>2]=c;w:{if(!(m&128)){if(!h|m){break w}c=7;break b}c=7;h=h+7|0;v[d+4>>2]=h;if((h|0)!=63){continue}break b}break}v[d+4>>2]=0}v[d+56>>2]=o;v[d+60>>2]=l;if(q-b>>>0<2){c=7;break b}c=b+1|0;v[d+168>>2]=c;if(w[(b+n|0)+8|0]!=33){c=6;break b}h=b+2|0;v[d+168>>2]=h;if(w[(c+n|0)+8|0]!=1){c=6;break b}c=7;if((h|0)==(q|0)){break b}v[d+168>>2]=b+3;f=v[d+1200>>2];e=6;b=w[(h+n|0)+8|0];x:{if(b>>>0>39){break x}h=(b&1|2)<<(b>>>1|0)+11;v[f+48>>2]=h;y:{z:{b=v[f+60>>2];if(!b){break z}e=4;if(h>>>0>y[f+52>>2]){break x}v[f+44>>2]=h;if((b|0)!=2){break z}c=f+56|0;if(h>>>0<=y[c>>2]){break z}X(v[f+24>>2]);b=Z(v[f+48>>2]);v[f+24>>2]=b;if(b){break z}e=3;break y}v[f+64>>2]=0;t[f+80|0]=1;v[f+104>>2]=0;c=f+28388|0;e=0}v[c>>2]=0}c=e;if(c){break b}b=v[d+168>>2];c=v[d+172>>2];h=b>>>0>c>>>0?b:c;A:{while(1){if((b|0)==(h|0)){break A}c=b+1|0;v[d+168>>2]=c;e=b+n|0;b=c;if(!w[e+8|0]){continue}break}c=6;break b}v[d+168>>2]=0;v[d+80>>2]=0;v[d+84>>2]=0;v[d+72>>2]=0;v[d+76>>2]=0;v[d>>2]=3}v[d+16>>2]=v[a+8>>2];v[d+20>>2]=v[a+20>>2];c=v[d+1200>>2];h=c+28392|0;o=c+120|0;r=c+28388|0;B:{while(1){f=v[c+64>>2];C:{D:{E:{F:{G:{H:{I:{J:{K:{L:{M:{N:{O:{P:{Q:{b=v[a+8>>2];e=v[a+12>>2];if(b>>>0>=e>>>0){if((f|0)==7){break Q}f=0;break B}switch(f|0){case 8:break H;case 6:break J;case 5:break K;case 4:break L;case 3:break M;case 2:break N;case 1:break O;case 0:break P;case 7:break Q;default:continue}}i=v[c+76>>2];break I}f=1;v[a+8>>2]=b+1;g=w[v[a+4>>2]+b|0];if(!g){break G}if(!((g|0)!=1&g>>>0<=223)){u[c+80>>1]=256;if(!v[c+60>>2]){b=v[a+20>>2];v[c+24>>2]=b+v[a+16>>2];v[c+44>>2]=v[a+24>>2]-b}v[c+28>>2]=0;v[c+32>>2]=0;v[c+36>>2]=0;v[c+40>>2]=0;break E}if(!w[c+80|0]){break E}f=7;break B}v[a+8>>2]=b+1;b=w[v[a+4>>2]+b|0];v[c+64>>2]=2;v[c+72>>2]=v[c+72>>2]+(b<<8);continue}v[a+8>>2]=b+1;b=w[v[a+4>>2]+b|0];v[c+64>>2]=3;v[c+72>>2]=(b+v[c+72>>2]|0)+1;continue}v[a+8>>2]=b+1;b=w[v[a+4>>2]+b|0];v[c+64>>2]=4;v[c+76>>2]=b<<8;continue}v[a+8>>2]=b+1;b=w[v[a+4>>2]+b|0];v[c+64>>2]=v[c+68>>2];v[c+76>>2]=(b+v[c+76>>2]|0)+1;continue}v[a+8>>2]=b+1;f=7;b=w[v[a+4>>2]+b|0];if(b>>>0>224){break G}i=0;e=c;if(b>>>0<45){j=0}else{b=b-45|0;g=((b&255)>>>0)/45|0;b=b-B(g,45)|0;j=g+1|0}v[e+116>>2]=-1<<j^-1;if((b&255)>>>0>=9){b=b-9|0;e=((b&255)>>>0)/9|0;i=e+1|0;b=b-B(e,9)|0}v[c+112>>2]=i;b=b&255;v[c+108>>2]=b;if(b+i>>>0>4){break G}v[c+112>>2]=-1<<i^-1;b=0;v[c+100>>2]=0;v[c+92>>2]=0;v[c+96>>2]=0;v[c+84>>2]=0;v[c+88>>2]=0;while(1){e=b<<1;u[e+o>>1]=1024;u[(e|2)+o>>1]=1024;b=b+2|0;if((b|0)!=14134){continue}break}v[c+64>>2]=6;v[c+8>>2]=5;v[c>>2]=-1;v[c+4>>2]=0}k=v[c+76>>2];f=7;if(k>>>0<5){break B}i=v[c+8>>2];if(i){b=v[a+8>>2];g=v[a+12>>2];while(1){f=0;if((b|0)==(g|0)){break B}f=v[c+4>>2];e=b+1|0;v[a+8>>2]=e;b=w[v[a+4>>2]+b|0];i=i-1|0;v[c+8>>2]=i;v[c+4>>2]=b|f<<8;b=e;if(i){continue}break}}v[c+64>>2]=7;i=k-5|0;v[c+76>>2]=i}f=v[c+32>>2];e=v[a+24>>2]-v[a+20>>2]|0;b=v[c+72>>2];e=b>>>0>e>>>0?e:b;b=v[c+44>>2];v[c+40>>2]=e>>>0<b-f>>>0?f+e|0:b;f=v[a+12>>2];e=v[a+8>>2];b=f-e|0;g=v[c+28388>>2];R:{S:{if(!g){if(i){break S}i=0}j=(g+r|0)+4|0;k=v[a+4>>2]+e|0;f=i-g|0;e=42-g|0;e=e>>>0>f>>>0?f:e;g=b>>>0<e>>>0?b:e;W(j,k,g);b=v[c+28388>>2];e=b+g|0;T:{if((e|0)==v[c+76>>2]){_((g+(b+r|0)|0)+4|0,63-e|0);b=g+v[c+28388>>2]|0;break T}if(e>>>0<=20){v[c+28388>>2]=e;v[a+8>>2]=g+v[a+8>>2];break R}b=e-21|0}v[c+16>>2]=0;v[c+12>>2]=h;v[c+20>>2]=b;f=7;if(!da(c)){break G}b=v[c+28388>>2];e=b+g|0;g=v[c+16>>2];if(e>>>0<g>>>0){break G}i=v[c+76>>2]-g|0;v[c+76>>2]=i;if(b>>>0>g>>>0){b=b-g|0;v[c+28388>>2]=b;e=h;i=(g+r|0)+4|0;U:{if((e|0)==(i|0)){break U}f=b+e|0;if(i-f>>>0<=0-(b<<1)>>>0){W(e,i,b);break U}g=(e^i)&3;V:{W:{if(e>>>0<i>>>0){if(g){break V}if(!(e&3)){break W}while(1){if(!b){break U}t[e|0]=w[i|0];i=i+1|0;b=b-1|0;e=e+1|0;if(e&3){continue}break}break W}X:{if(g){break X}if(f&3){while(1){if(!b){break U}b=b-1|0;f=e+b|0;t[f|0]=w[b+i|0];if(f&3){continue}break}}if(b>>>0<=3){break X}while(1){b=b-4|0;v[e+b>>2]=v[b+i>>2];if(b>>>0>3){continue}break}}if(!b){break U}while(1){b=b-1|0;t[e+b|0]=w[b+i|0];if(b){continue}break}break U}if(b>>>0<=3){break V}while(1){v[e>>2]=v[i>>2];i=i+4|0;e=e+4|0;b=b-4|0;if(b>>>0>3){continue}break}}if(!b){break U}while(1){t[e|0]=w[i|0];e=e+1|0;i=i+1|0;b=b-1|0;if(b){continue}break}}break R}e=v[a+8>>2]+(g-b|0)|0;v[a+8>>2]=e;v[c+28388>>2]=0;f=v[a+12>>2];b=f-e|0}if(b>>>0>=21){g=v[a+4>>2];v[c+16>>2]=e;v[c+12>>2]=g;v[c+20>>2]=i+21>>>0>b>>>0?f-21|0:e+i|0;f=7;if(!da(c)){break G}g=v[c+76>>2];e=v[c+16>>2];b=e-v[a+8>>2]|0;if(g>>>0<b>>>0){break G}i=g-b|0;v[c+76>>2]=i;v[a+8>>2]=e;b=v[a+12>>2]-e|0;if(b>>>0>20){break R}}b=b>>>0>i>>>0?i:b;W(h,v[a+4>>2]+e|0,b);v[c+28388>>2]=b;v[a+8>>2]=b+v[a+8>>2]}e=v[c+32>>2];f=v[c+28>>2];g=e-f|0;b=c;if(v[b+60>>2]){if((e|0)==v[c+44>>2]){v[c+32>>2]=0}W(v[a+16>>2]+v[a+20>>2]|0,f+v[c+24>>2]|0,g);e=v[c+32>>2]}v[b+28>>2]=e;e=g+v[a+20>>2]|0;v[a+20>>2]=e;b=v[c+72>>2]-g|0;v[c+72>>2]=b;if(!b){f=7;if(v[c+4>>2]|(v[c+76>>2]|v[c+104>>2])){break G}v[c+64>>2]=0;break D}f=0;if((e|0)==v[a+24>>2]){break G}if(v[a+8>>2]!=v[a+12>>2]|y[c+28388>>2]>=y[c+76>>2]){continue}break G}i=v[c+76>>2];if(!i){break F}f=0;if(b>>>0>=e>>>0){break G}while(1){m=v[a+24>>2];l=v[a+20>>2];if(m>>>0<=l>>>0){break G}j=v[c+32>>2];k=v[c+44>>2]-j|0;g=e-b|0;e=m-l|0;e=e>>>0>g>>>0?g:e;e=e>>>0>k>>>0?k:e;g=e>>>0>i>>>0?i:e;v[c+76>>2]=i-g;W(v[c+24>>2]+j|0,v[a+4>>2]+b|0,g);e=g+v[c+32>>2]|0;v[c+32>>2]=e;if(e>>>0>y[c+36>>2]){v[c+36>>2]=e}b=c;if(v[b+60>>2]){if((e|0)==v[c+44>>2]){v[c+32>>2]=0}W(v[a+16>>2]+v[a+20>>2]|0,v[a+4>>2]+v[a+8>>2]|0,g);e=v[c+32>>2]}v[b+28>>2]=e;v[a+20>>2]=g+v[a+20>>2];b=g+v[a+8>>2]|0;v[a+8>>2]=b;i=v[c+76>>2];if(!i){break F}e=v[a+12>>2];if(e>>>0>b>>>0){continue}break}}break B}v[c+64>>2]=0;continue}if(g<<24>>24>=0){break C}v[c+64>>2]=1;v[c+72>>2]=g<<16&2031616;if(g>>>0>=192){v[c+68>>2]=5;t[c+81|0]=0;continue}f=7;if(w[c+81|0]){break B}v[c+68>>2]=6;if(g>>>0<160){continue}v[c+84>>2]=0;v[c+88>>2]=0;b=0;v[c+100>>2]=0;v[c+92>>2]=0;v[c+96>>2]=0;while(1){e=b<<1;u[e+o>>1]=1024;u[(e|2)+o>>1]=1024;b=b+2|0;if((b|0)!=14134){continue}break}}v[c+8>>2]=5;v[c>>2]=-1;v[c+4>>2]=0;continue}if(g>>>0<=2){v[c+64>>2]=3;v[c+68>>2]=8;continue}break}f=7}c=f;b=d;e=v[b+76>>2];h=v[a+8>>2]-v[b+16>>2]|0;f=h+v[b+72>>2]|0;k=f;e=f>>>0<h>>>0?e+1|0:e;h=e;v[b+72>>2]=f;v[b+76>>2]=e;l=v[b+20>>2];j=v[a+20>>2]-l|0;b=j;g=b+v[d+80>>2]|0;f=v[d+84>>2];f=b>>>0>g>>>0?f+1|0:f;v[d+80>>2]=g;b=f;v[d+84>>2]=b;e=v[d+52>>2];if((h|0)==(e|0)&k>>>0>y[d+48>>2]|e>>>0<h>>>0){c=7;break b}e=v[d+60>>2];if((b|0)==(e|0)&g>>>0>y[d+56>>2]|b>>>0>e>>>0){c=7;break b}k=d;Y:{Z:{_:{switch(v[d+32>>2]-1|0){case 0:e=Y(l+v[a+16>>2]|0,j,v[d+24>>2]);b=0;break Z;case 3:break _;default:break Y}}h=l+v[a+16>>2]|0;g=v[d+24>>2]^-1;f=v[d+28>>2]^-1;$:{if(!j){break $}if(j&1){e=((w[h|0]^g&255)<<3)+2064|0;b=v[e>>2];l=v[e+4>>2];e=b;b=f;f=b>>>8|0;g=e^((b&255)<<24|g>>>8);f=f^l;h=h+1|0;e=j-1|0}else{e=j}if((j|0)==1){break $}while(1){j=((w[h|0]^g&255)<<3)+2064|0;b=v[j>>2];m=v[j+4>>2];j=b;b=f;f=b>>>8|0;l=j^((b&255)<<24|g>>>8);g=((w[h+1|0]^l&255)<<3)+2064|0;b=v[g>>2];j=v[g+4>>2];g=f^m;f=g>>>8|0;g=((g&255)<<24|l>>>8)^b;f=f^j;h=h+2|0;e=e-2|0;if(e){continue}break}}e=g^-1;b=f^-1}v[k+24>>2]=e;v[k+28>>2]=b}if((c|0)!=1){break b}e=v[d+52>>2];c=e;b=v[d+48>>2];if(!((b|0)==-1&(c|0)==-1|v[d+72>>2]==(b|0)&v[d+76>>2]==(c|0))){c=7;break b}c=v[d+60>>2];e=c;b=v[d+56>>2];if((b|0)!=-1|(c|0)!=-1){c=7;if(v[d+80>>2]!=(b|0)|v[d+84>>2]!=(e|0)){break b}}c=v[d+100>>2];b=v[d+64>>2];e=b+v[d+72>>2]|0;f=v[d+76>>2];f=b>>>0>e>>>0?f+1|0:f;b=e;g=b+v[d+96>>2]|0;e=c+f|0;c=g;e=b>>>0>c>>>0?e+1|0:e;b=e;v[d+96>>2]=c;v[d+100>>2]=b;g=4;aa:{switch(v[d+32>>2]-1|0){case 3:g=8;case 0:h=c+g|0;f=h>>>0<c>>>0?b+1|0:b;e=x;v[e>>2]=h;v[e+4>>2]=f;break;default:break aa}}e=v[d+108>>2]+v[d+84>>2]|0;c=v[d+80>>2];h=c+v[d+104>>2]|0;v[d+104>>2]=h;v[d+108>>2]=c>>>0>h>>>0?e+1|0:e;v[d+112>>2]=Y(x,24,v[d+112>>2]);v[d>>2]=4;f=v[d+92>>2];c=v[d+88>>2]+1|0;f=c?f:f+1|0;b=d;v[b+88>>2]=c;v[b+92>>2]=f}b=v[d+76>>2];l=v[d+72>>2];ba:{if(!(l&3)){break ba}c=0;m=v[a+8>>2];j=v[a+12>>2];if((m|0)==(j|0)){break b}g=m+1|0;v[a+8>>2]=g;if(w[m+v[a+4>>2]|0]){c=7;break b}h=l+1|0;f=h?b:b+1|0;v[d+72>>2]=h;v[d+76>>2]=f;if(!(h&3)){break ba}if((g|0)==(j|0)){break b}k=m+2|0;v[a+8>>2]=k;if(w[g+v[a+4>>2]|0]){c=7;break b}f=l+2|0;e=f>>>0<2?b+1|0:b;h=d;v[d+72>>2]=f;v[d+76>>2]=e;if(!(f&3)){break ba}if((j|0)==(k|0)){break b}g=m+3|0;v[a+8>>2]=g;if(w[k+v[a+4>>2]|0]){c=7;break b}f=l+3|0;e=f>>>0<3?b+1|0:b;v[d+72>>2]=f;v[h+76>>2]=e;if(!(f&3)){break ba}if((g|0)==(j|0)){break b}v[a+8>>2]=m+4;c=7;if(w[g+v[a+4>>2]|0]){break b}f=b;b=l+4|0;f=b>>>0<4?f+1|0:f;v[d+72>>2]=b;v[d+76>>2]=f}v[d>>2]=5}h=1;ca:{da:{ea:{switch(v[d+32>>2]-1|0){case 0:b=v[a+8>>2];k=v[a+12>>2];while(1){if((b|0)==(k|0)){c=0;break b}g=v[d+24>>2];e=v[d+28>>2];f=v[d+4>>2];c=b+1|0;v[a+8>>2]=c;l=w[v[a+4>>2]+b|0];b=f;j=b&31;if((l|0)!=(((b&63)>>>0>=32?e>>>j|0:((1<<j)-1&e)<<32-j|g>>>j)&255)){c=7;break b}e=f+8|0;v[d+4>>2]=e;b=c;if(e>>>0<32){continue}break};break da;case 3:break ea;default:break ca}}b=v[a+8>>2];k=v[a+12>>2];while(1){if((b|0)==(k|0)){c=0;break b}g=v[d+24>>2];e=v[d+28>>2];f=v[d+4>>2];c=b+1|0;v[a+8>>2]=c;l=w[v[a+4>>2]+b|0];b=f;j=b&31;if((l|0)!=(((b&63)>>>0>=32?e>>>j|0:((1<<j)-1&e)<<32-j|g>>>j)&255)){c=7;break b}e=f+8|0;v[d+4>>2]=e;b=c;if(e>>>0<64){continue}break}}v[d+4>>2]=0;v[d+24>>2]=0;v[d+28>>2]=0}v[d>>2]=1;continue}break}fa:{if(!v[d+36>>2]){ga:{switch(c|0){case 0:c=v[a+8>>2]==v[a+12>>2]?7:8;break;case 1:break fa;default:break ga}}v[a+20>>2]=z;v[a+8>>2]=s;break fa}if(!(v[a+8>>2]!=(s|0)|c|v[a+20>>2]!=(z|0))){a=w[d+40|0];t[d+40|0]=1;c=a<<3;break fa}t[d+40|0]=0}return c|0}function da(a){var b=0,c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=v[a+32>>2];b=v[a+40>>2];a:{if(j>>>0>=b>>>0){break a}c=v[a+104>>2];if(!c){break a}d=v[a+84>>2];if(d>>>0>=y[a+36>>2]|d>>>0>=y[a+48>>2]){break a}b=b-j|0;g=b>>>0<c>>>0?b:c;v[a+104>>2]=c-g;e=(d^-1)+j|0;e=d>>>0>=j>>>0?v[a+44>>2]+e|0:e;d=v[a+24>>2];b=w[e+d|0];v[a+32>>2]=j+1;t[d+j|0]=b;h=g-1|0;b:{if(!h){break b}if(h&1){b=e+1|0;e=(b|0)==v[a+44>>2]?0:b;c=v[a+24>>2];d=w[e+c|0];b=v[a+32>>2];v[a+32>>2]=b+1;t[b+c|0]=d;h=g-2|0}if((g|0)==2){break b}while(1){g=v[a+24>>2];b=e+1|0;c=(b|0)==v[a+44>>2]?0:b;d=w[g+c|0];b=v[a+32>>2];v[a+32>>2]=b+1;t[b+g|0]=d;b=c+1|0;e=(b|0)==v[a+44>>2]?0:b;c=v[a+24>>2];d=w[e+c|0];b=v[a+32>>2];v[a+32>>2]=b+1;t[b+c|0]=d;h=h-2|0;if(h){continue}break}}j=v[a+32>>2];if(j>>>0<=y[a+36>>2]){break a}v[a+36>>2]=j}c:{d:{if(y[a+40>>2]<=j>>>0){break d}n=a+1756|0;o=a+2784|0;p=a+84|0;while(1){d=v[a+16>>2];if(d>>>0>y[a+20>>2]){break d}m=v[a+100>>2];i=v[a+116>>2]&j;k=((m<<5)+a|0)+(i<<1)|0;g=k;f=v[a>>2];e:{if(f>>>0>=16777216){e=v[a+4>>2];break e}f=f<<8;v[a>>2]=f;b=d+1|0;v[a+16>>2]=b;e=w[v[a+12>>2]+d|0]|v[a+4>>2]<<8;v[a+4>>2]=e;d=b}b=x[g+120>>1];c=B(b,f>>>11|0);f:{if(e>>>0<c>>>0){v[a>>2]=c;u[g+120>>1]=b+(2048-b>>>5|0);f=j-1|0;f=j?f:v[a+44>>2]+f|0;i=v[a+108>>2];g=v[a+36>>2];l=((v[a+112>>2]&j)<<i)+((g?w[v[a+24>>2]+f|0]:0)>>>8-i|0)|0;f=1;g:{if(m>>>0<=6){while(1){f=f<<1;g=(f+(B(l,1536)+a|0)|0)+3812|0;h:{if(c>>>0>16777215){b=c;break h}b=c<<8;v[a>>2]=b;c=d+1|0;v[a+16>>2]=c;e=w[v[a+12>>2]+d|0]|e<<8;v[a+4>>2]=e;d=c}i=x[g>>1];c=B(i,b>>>11|0);i:{if(e>>>0>=c>>>0){e=e-c|0;v[a+4>>2]=e;c=b-c|0;v[a>>2]=c;u[g>>1]=i-(i>>>5|0);f=f|1;break i}v[a>>2]=c;u[g>>1]=i+(2048-i>>>5|0)}if(f>>>0<256){continue}break g}}b=v[a+84>>2];f=(b^-1)+j|0;f=b>>>0>=j>>>0?v[a+44>>2]+f|0:f;g=g?w[v[a+24>>2]+f|0]:0;f=1;h=256;while(1){g=g<<1;m=h&g;i=((B(l,1536)+a|0)+((m+h|0)+f<<1)|0)+3812|0;j:{if(c>>>0>16777215){k=c;break j}k=c<<8;v[a>>2]=k;b=d+1|0;v[a+16>>2]=b;e=w[v[a+12>>2]+d|0]|e<<8;v[a+4>>2]=e;d=b}b=i;q=b;b=x[b>>1];c=B(b,k>>>11|0);i=e>>>0>=c>>>0;k:{if(!i){v[a>>2]=c;b=b+(2048-b>>>5|0)|0;break k}e=e-c|0;v[a+4>>2]=e;c=k-c|0;v[a>>2]=c;h=0;b=b-(b>>>5|0)|0}u[q>>1]=b;h=h^m;f=i|f<<1;if(f>>>0<256){continue}break}}v[a+32>>2]=j+1;t[v[a+24>>2]+j|0]=f;j=v[a+32>>2];if(j>>>0>y[a+36>>2]){v[a+36>>2]=j}b=a;d=v[a+100>>2];if(d>>>0>=4){if(d>>>0<=9){v[a+100>>2]=d-3;break f}c=d-6|0}else{c=0}v[b+100>>2]=c;break f}e=e-c|0;v[a+4>>2]=e;c=f-c|0;v[a>>2]=c;u[g+120>>1]=b-(b>>>5|0);l=(m<<1)+a|0;g=l;l:{if(c>>>0>16777215){b=d;break l}c=c<<8;v[a>>2]=c;b=d+1|0;v[a+16>>2]=b;e=w[v[a+12>>2]+d|0]|e<<8;v[a+4>>2]=e}m=x[g+504>>1];d=B(m,c>>>11|0);m:{if(d>>>0<=e>>>0){e=e-d|0;v[a+4>>2]=e;c=c-d|0;v[a>>2]=c;u[g+504>>1]=m-(m>>>5|0);n:{if(c>>>0>16777215){g=b;break n}c=c<<8;v[a>>2]=c;g=b+1|0;v[a+16>>2]=g;e=w[v[a+12>>2]+b|0]|e<<8;v[a+4>>2]=e}b=x[l+528>>1];f=B(b,c>>>11|0);o:{if(f>>>0>e>>>0){u[l+528>>1]=b+(2048-b>>>5|0);if(f>>>0<=16777215){f=f<<8;v[a>>2]=f;v[a+16>>2]=g+1;e=w[v[a+12>>2]+g|0]|e<<8;v[a+4>>2]=e}d=x[k+600>>1];b=B(d,f>>>11|0);if(b>>>0<=e>>>0){v[a+4>>2]=e-b;v[a>>2]=f-b;u[k+600>>1]=d-(d>>>5|0);break o}v[a>>2]=b;u[k+600>>1]=d+(2048-d>>>5|0);v[a+104>>2]=1;v[a+100>>2]=y[a+100>>2]<7?9:11;break m}e=e-f|0;v[a+4>>2]=e;u[l+528>>1]=b-(b>>>5|0);c=c-f|0;p:{if(c>>>0>16777215){b=g;break p}c=c<<8;v[a>>2]=c;b=g+1|0;v[a+16>>2]=b;e=w[v[a+12>>2]+g|0]|e<<8;v[a+4>>2]=e}g=x[l+552>>1];d=B(g,c>>>11|0);q:{if(d>>>0>e>>>0){v[a>>2]=d;u[l+552>>1]=g+(2048-g>>>5|0);c=v[a+88>>2];break q}e=e-d|0;v[a+4>>2]=e;u[l+552>>1]=g-(g>>>5|0);c=c-d|0;if(c>>>0<=16777215){c=c<<8;v[a>>2]=c;v[a+16>>2]=b+1;e=w[v[a+12>>2]+b|0]|e<<8;v[a+4>>2]=e}d=x[l+576>>1];b=B(d,c>>>11|0);r:{if(b>>>0>e>>>0){v[a>>2]=b;u[l+576>>1]=d+(2048-d>>>5|0);c=v[a+92>>2];break r}v[a+4>>2]=e-b;v[a>>2]=c-b;u[l+576>>1]=d-(d>>>5|0);c=v[a+96>>2];v[a+96>>2]=v[a+92>>2]}v[a+92>>2]=v[a+88>>2]}v[a+88>>2]=v[a+84>>2];v[a+84>>2]=c}v[a+100>>2]=y[a+100>>2]<7?8:11;ca(a,o,i);break m}v[a>>2]=d;u[g+504>>1]=m+(2048-m>>>5|0);v[a+96>>2]=v[a+92>>2];b=v[a+88>>2];v[a+88>>2]=v[a+84>>2];v[a+92>>2]=b;v[a+100>>2]=y[a+100>>2]<7?7:10;ca(a,n,i);b=v[a+104>>2];d=b>>>0<6?b-2|0:3;c=v[a>>2];e=1;while(1){e=e<<1;g=e+((d<<7)+a|0)|0;s:{if(c>>>0>=16777216){f=v[a+4>>2];break s}c=c<<8;v[a>>2]=c;b=v[a+16>>2];v[a+16>>2]=b+1;f=w[b+v[a+12>>2]|0]|v[a+4>>2]<<8;v[a+4>>2]=f}i=x[g+984>>1];b=B(i,c>>>11|0);t:{if(b>>>0<=f>>>0){f=f-b|0;v[a+4>>2]=f;c=c-b|0;v[a>>2]=c;u[g+984>>1]=i-(i>>>5|0);e=e|1;break t}v[a>>2]=b;u[g+984>>1]=i+(2048-i>>>5|0);c=b}if(e>>>0<64){continue}break}d=e+-64|0;if(d>>>0<=3){v[a+84>>2]=d;break m}h=e&1|2;v[a+84>>2]=h;b=d>>>1|0;if(d>>>0<=13){i=b-1|0;k=h<<i;v[a+84>>2]=k;h=1;g=(((k<<1)+p|0)+(0-e<<1)|0)+1538|0;l=0;while(1){h=h<<1;m=g+h|0;u:{if(c>>>0>16777215){b=c;break u}b=c<<8;v[a>>2]=b;d=v[a+16>>2];v[a+16>>2]=d+1;f=w[d+v[a+12>>2]|0]|f<<8;v[a+4>>2]=f}d=x[m>>1];c=B(d,b>>>11|0);v:{if(f>>>0>=c>>>0){f=f-c|0;v[a+4>>2]=f;c=b-c|0;v[a>>2]=c;u[m>>1]=d-(d>>>5|0);k=(1<<l)+k|0;v[a+84>>2]=k;h=h|1;break v}v[a>>2]=c;u[m>>1]=d+(2048-d>>>5|0)}l=l+1|0;if((i|0)!=(l|0)){continue}break}break m}e=b-5|0;while(1){w:{if(c>>>0>16777215){d=c;break w}d=c<<8;v[a>>2]=d;b=v[a+16>>2];v[a+16>>2]=b+1;f=w[b+v[a+12>>2]|0]|f<<8}c=d>>>1|0;v[a>>2]=c;g=f-c|0;b=g>>31;h=(b+(h<<1)|0)+1|0;v[a+84>>2]=h;f=g+(b&c)|0;v[a+4>>2]=f;e=e-1|0;if(e){continue}break}h=h<<4;v[a+84>>2]=h;if(d>>>0<=33554431){c=c<<8;v[a>>2]=c;b=v[a+16>>2];v[a+16>>2]=b+1;f=w[b+v[a+12>>2]|0]|f<<8;v[a+4>>2]=f}b=a;d=x[a+1726>>1];e=B(d,c>>>11|0);x:{if(f>>>0>=e>>>0){f=f-e|0;v[a+4>>2]=f;h=h|1;v[a+84>>2]=h;u[a+1726>>1]=d-(d>>>5|0);e=c-e|0;c=3;break x}u[a+1726>>1]=d+(2048-d>>>5|0);c=2}d=c<<1;g=(b+d|0)+1724|0;if(e>>>0<=16777215){e=e<<8;v[a>>2]=e;b=v[a+16>>2];v[a+16>>2]=b+1;f=w[b+v[a+12>>2]|0]|f<<8;v[a+4>>2]=f}b=x[g>>1];c=B(b,e>>>11|0);y:{if(f>>>0>=c>>>0){f=f-c|0;v[a+4>>2]=f;u[g>>1]=b-(b>>>5|0);h=h+2|0;v[a+84>>2]=h;c=e-c|0;d=d|1;break y}u[g>>1]=b+(2048-b>>>5|0)}d=d<<1;g=(d+a|0)+1724|0;if(c>>>0<=16777215){c=c<<8;v[a>>2]=c;b=v[a+16>>2];v[a+16>>2]=b+1;f=w[b+v[a+12>>2]|0]|f<<8;v[a+4>>2]=f}b=x[g>>1];e=B(b,c>>>11|0);z:{if(f>>>0>=e>>>0){f=f-e|0;v[a+4>>2]=f;u[g>>1]=b-(b>>>5|0);h=h+4|0;v[a+84>>2]=h;e=c-e|0;d=d|1;break z}u[g>>1]=b+(2048-b>>>5|0)}if(e>>>0<=16777215){e=e<<8;v[a>>2]=e;b=v[a+16>>2];v[a+16>>2]=b+1;f=w[b+v[a+12>>2]|0]|f<<8;v[a+4>>2]=f}b=((d<<1)+a|0)+1724|0;c=x[b>>1];d=B(c,e>>>11|0);if(d>>>0<=f>>>0){v[a+4>>2]=f-d;v[a>>2]=e-d;u[b>>1]=c-(c>>>5|0);v[a+84>>2]=h+8;break m}v[a>>2]=d;u[b>>1]=c+(2048-c>>>5|0)}c=0;g=v[a+84>>2];if(g>>>0>=y[a+36>>2]|g>>>0>=y[a+48>>2]){break c}k=v[a+32>>2];b=v[a+40>>2]-k|0;d=v[a+104>>2];i=b>>>0<d>>>0?b:d;v[a+104>>2]=d-i;c=k+(g^-1)|0;c=g>>>0>=k>>>0?v[a+44>>2]+c|0:c;d=v[a+24>>2];b=w[c+d|0];v[a+32>>2]=k+1;t[d+k|0]=b;f=i-1|0;A:{if(!f){break A}if(f&1){b=c+1|0;c=(b|0)==v[a+44>>2]?0:b;g=v[a+24>>2];d=w[c+g|0];b=v[a+32>>2];v[a+32>>2]=b+1;t[b+g|0]=d;f=i-2|0}if((i|0)==2){break A}while(1){g=v[a+24>>2];b=c+1|0;c=(b|0)==v[a+44>>2]?0:b;d=w[g+c|0];b=v[a+32>>2];v[a+32>>2]=b+1;t[b+g|0]=d;b=c+1|0;c=(b|0)==v[a+44>>2]?0:b;g=v[a+24>>2];d=w[c+g|0];b=v[a+32>>2];v[a+32>>2]=b+1;t[b+g|0]=d;f=f-2|0;if(f){continue}break}}j=v[a+32>>2];if(j>>>0<=y[a+36>>2]){break f}v[a+36>>2]=j}if(y[a+40>>2]>j>>>0){continue}break}}c=1;b=v[a>>2];if(b>>>0>16777215){break c}v[a>>2]=b<<8;b=v[a+16>>2];v[a+16>>2]=b+1;v[a+4>>2]=w[b+v[a+12>>2]|0]|v[a+4>>2]<<8}return c}function Z(a){var b=0,c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;i=8;a:{b:{if(a>>>0>4294967239){break b}while(1){i=i>>>0>8?i:8;b=v[1291];f=b;e=v[1290];h=e;a=a>>>0>8?a+3&-4:8;c:{if(a>>>0<=127){g=(a>>>3|0)-1|0;break c}d=E(a);g=((a>>>29-d^4)-(d<<2)|0)+110|0;if(a>>>0<=4095){break c}d=((a>>>30-d^2)-(d<<1)|0)+71|0;g=d>>>0<63?d:63}c=g;d=c&31;if((c&63)>>>0>=32){c=0;b=b>>>d|0}else{c=b>>>d|0;b=((1<<d)-1&b)<<32-d|h>>>d}d=c;if(b|c){while(1){f=b;c=d;d:{if(c|b){e=c-1|0;h=e+1|0;j=e;e=b-1|0;h=(e|0)!=-1?h:j;e=E(b^e)+32|0;b=E(c^h);b=(b|0)==32?e:b;c=63-b|0;Q=0-(b>>>0>63)|0;break d}Q=0;c=64}e=c;c=e;b=c&31;if((c&63)>>>0>=32){c=0;h=d>>>b|0}else{c=d>>>b|0;h=((1<<b)-1&d)<<32-b|f>>>b}d=c;g=e+g|0;f=g<<4;c=v[f+4136>>2];e=f+4128|0;e:{if((c|0)!=(e|0)){b=$(c,i,a);if(b){break b}b=v[c+4>>2];v[b+8>>2]=v[c+8>>2];v[v[c+8>>2]+4>>2]=b;v[c+8>>2]=e;b=f+4132|0;v[c+4>>2]=v[b>>2];v[b>>2]=c;v[v[c+4>>2]+8>>2]=c;g=g+1|0;b=(d&1)<<31|h>>>1;d=d>>>1|0;break e}k=v[1291];c=g;j=c&63;b=j;f=b&31;if(b>>>0>=32){b=0;e=-1>>>f|0}else{e=-1>>>f|0;b=e;e=b|(1<<f)-1<<32-f}e=e&-2;f=j&31;if(j>>>0>=32){b=e<<f;j=0}else{b=(1<<f)-1&e>>>32-f|b<<f;j=e<<f}f=b;e=0-c&63;c=e;b=c&31;if(c>>>0>=32){b=-1<<b;c=0}else{c=-1<<b;b=c|(1<<b)-1&-1>>>32-b}l=c&-2;c=e&31;if(e>>>0>=32){e=0;c=b>>>c|0}else{e=b>>>c|0;c=((1<<c)-1&b)<<32-c|l>>>c}b=c|j;Q=e|f;v[1290]=v[1290]&b;v[1291]=Q&k;b=h^1}if(b|d){continue}break}e=v[1290];f=v[1291]}f:{if(e|f){d=E(f);h=63-((d|0)==32?E(e)+32|0:d)|0;b=h<<4;d=v[b+4136>>2];g:{if(!f&e>>>0<1073741824){break g}g=99;c=b+4128|0;if((c|0)==(d|0)){break g}while(1){if(!g){break g}b=$(d,i,a);if(b){break b}g=g-1|0;d=v[d+8>>2];if((c|0)!=(d|0)){continue}break}d=c}if(aa(a+48|0)){break f}if(!d){break a}c=(h<<4)+4128|0;if((c|0)==(d|0)){break a}while(1){b=$(d,i,a);if(b){break b}d=v[d+8>>2];if((c|0)!=(d|0)){continue}break}break a}if(!aa(a+48|0)){break a}}b=0;if(i-1&i){break b}if(a>>>0<=4294967239){continue}break}}return b}return 0}function W(a,b,c){var d=0,e=0;if(c>>>0>=512){O(a|0,b|0,c|0)|0;return}d=a+c|0;a:{if(!((a^b)&3)){b:{if(!(a&3)){c=a;break b}if(!c){c=a;break b}c=a;while(1){t[c|0]=w[b|0];b=b+1|0;c=c+1|0;if(!(c&3)){break b}if(c>>>0<d>>>0){continue}break}}a=d&-4;c:{if(a>>>0<64){break c}e=a+-64|0;if(e>>>0<c>>>0){break c}while(1){v[c>>2]=v[b>>2];v[c+4>>2]=v[b+4>>2];v[c+8>>2]=v[b+8>>2];v[c+12>>2]=v[b+12>>2];v[c+16>>2]=v[b+16>>2];v[c+20>>2]=v[b+20>>2];v[c+24>>2]=v[b+24>>2];v[c+28>>2]=v[b+28>>2];v[c+32>>2]=v[b+32>>2];v[c+36>>2]=v[b+36>>2];v[c+40>>2]=v[b+40>>2];v[c+44>>2]=v[b+44>>2];v[c+48>>2]=v[b+48>>2];v[c+52>>2]=v[b+52>>2];v[c+56>>2]=v[b+56>>2];v[c+60>>2]=v[b+60>>2];b=b- -64|0;c=c- -64|0;if(e>>>0>=c>>>0){continue}break}}if(a>>>0<=c>>>0){break a}while(1){v[c>>2]=v[b>>2];b=b+4|0;c=c+4|0;if(a>>>0>c>>>0){continue}break}break a}if(d>>>0<4){c=a;break a}e=d-4|0;if(e>>>0<a>>>0){c=a;break a}c=a;while(1){t[c|0]=w[b|0];t[c+1|0]=w[b+1|0];t[c+2|0]=w[b+2|0];t[c+3|0]=w[b+3|0];b=b+4|0;c=c+4|0;if(e>>>0>=c>>>0){continue}break}}if(c>>>0<d>>>0){while(1){t[c|0]=w[b|0];b=b+1|0;c=c+1|0;if((d|0)!=(c|0)){continue}break}}}function ca(a,b,c){var d=0,e=0,f=0,g=0,h=0,i=0,j=0;g=v[a>>2];a:{if(g>>>0>=16777216){f=v[a+4>>2];break a}g=g<<8;v[a>>2]=g;d=v[a+16>>2];v[a+16>>2]=d+1;f=w[d+v[a+12>>2]|0]|v[a+4>>2]<<8;v[a+4>>2]=f}d=x[b>>1];e=B(d,g>>>11|0);b:{if(f>>>0<e>>>0){u[b>>1]=d+(2048-d>>>5|0);j=((c<<4)+b|0)+4|0;i=2;d=8;break b}f=f-e|0;v[a+4>>2]=f;u[b>>1]=d-(d>>>5|0);g=g-e|0;if(g>>>0<=16777215){g=g<<8;v[a>>2]=g;d=v[a+16>>2];v[a+16>>2]=d+1;f=w[d+v[a+12>>2]|0]|f<<8;v[a+4>>2]=f}d=x[b+2>>1];e=B(d,g>>>11|0);if(f>>>0<e>>>0){u[b+2>>1]=d+(2048-d>>>5|0);j=((c<<4)+b|0)+260|0;i=10;d=8;break b}f=f-e|0;v[a+4>>2]=f;u[b+2>>1]=d-(d>>>5|0);j=b+516|0;e=g-e|0;i=18;d=256}v[a+104>>2]=i;b=1;while(1){b=b<<1;g=j+b|0;c:{if(e>>>0>16777215){c=e;break c}c=e<<8;v[a>>2]=c;e=v[a+16>>2];v[a+16>>2]=e+1;f=w[e+v[a+12>>2]|0]|f<<8;v[a+4>>2]=f}h=x[g>>1];e=B(h,c>>>11|0);d:{if(f>>>0>=e>>>0){f=f-e|0;v[a+4>>2]=f;e=c-e|0;v[a>>2]=e;u[g>>1]=h-(h>>>5|0);b=b|1;break d}v[a>>2]=e;u[g>>1]=(2048-h>>>5|0)+h}if(b>>>0<d>>>0){continue}break}v[a+104>>2]=(b-d|0)+i}function aa(a){var b=0,c=0,d=0,e=0,f=0,g=0;e=v[258];c=a+3&-4;b=e+c|0;a:{b:{if(b>>>0<=e>>>0?c:0){break b}if(b>>>0>S()<<16>>>0){if(!(P(b|0)|0)){break b}}v[258]=b;break a}v[1292]=48;e=-1}if((e|0)!=-1){c=a+e|0;b=c-16|0;v[b+12>>2]=16;v[b>>2]=16;a=v[1288];if(a){d=v[a+8>>2]}else{d=0}c:{d:{if((d|0)==(e|0)){d=e-(v[e-4>>2]&-2)|0;f=v[d-4>>2];v[a+8>>2]=c;a=d-(f&-2)|0;c=-16;if(!(t[(a+v[a>>2]|0)-4|0]&1)){break d}c=v[a+4>>2];v[c+8>>2]=v[a+8>>2];v[v[a+8>>2]+4>>2]=c;b=b-a|0;v[a>>2]=b;break c}v[e+12>>2]=16;v[e>>2]=16;v[e+8>>2]=c;v[e+4>>2]=a;v[1288]=e;c=16}a=e+c|0;b=b-a|0;v[a>>2]=b}v[((b&-4)+a|0)-4>>2]=b|1;g=a;d=v[a>>2]-8|0;e:{if(d>>>0<=127){b=(d>>>3|0)-1|0;break e}f=E(d);b=((d>>>29-f^4)-(f<<2)|0)+110|0;if(d>>>0<=4095){break e}b=((d>>>30-f^2)-(f<<1)|0)+71|0;b=b>>>0<63?b:63}c=b<<4;v[g+4>>2]=c+4128;c=c+4136|0;v[a+8>>2]=v[c>>2];v[c>>2]=a;v[v[a+8>>2]+4>>2]=a;c=v[1291];a=b&31;if((b&63)>>>0>=32){b=1<<a;d=0}else{d=1<<a;b=d-1&1>>>32-a}v[1290]=d|v[1290];v[1291]=b|c}return(e|0)!=-1}function ea(){var a=0,b=0,c=0,d=0,e=0,f=0,g=0,h=0;while(1){b=f;c=b>>>1|0;b=(b&1)<<31|g>>>1;a=b&1;d=0-a&-679014590;h=0-((a|0)!=0)&-915646571;a=g&1;e=0-a&-679014590;a=c^0-((a|0)!=0)&-915646571;c=b^e;b=a>>>1|0;a=(a&1)<<31|c>>>1;c=a^d;b=b^h;d=b>>>1|0;b=(b&1)<<31|c>>>1;c=b&1;a=a&1;e=0-a&-679014590;a=d^0-((a|0)!=0)&-915646571;d=b^e;b=a>>>1|0;a=(a&1)<<31|d>>>1;d=0-c&-679014590^a;c=b^0-((c|0)!=0)&-915646571;b=c>>>1|0;c=(c&1)<<31|d>>>1;d=c&1;h=0-d&-679014590;a=a&1;e=0-a&-679014590;b=b^0-((a|0)!=0)&-915646571;a=c^e;a=(b&1)<<31|a>>>1;c=0-((d|0)!=0)&-915646571^b>>>1;d=a^h;b=c>>>1|0;e=(g<<3)+2064|0;c=(c&1)<<31|d>>>1;d=c&1;a=a&1;h=0-a&-679014590;b=b^0-((a|0)!=0)&-915646571;a=c^h;v[e>>2]=0-d&-679014590^((b&1)<<31|a>>>1);v[e+4>>2]=0-((d|0)!=0)&-915646571^b>>>1;b=f;f=g+1|0;b=f?b:b+1|0;g=f;f=b;if((g|0)!=256|b){continue}break}}function $(a,b,c){var d=0,e=0,f=0,g=0;d=a+4|0;e=(d+b|0)-1&0-b;b=v[a>>2];if(e+c>>>0<=(b+a|0)-4>>>0){f=v[a+4>>2];v[f+8>>2]=v[a+8>>2];v[v[a+8>>2]+4>>2]=f;if((d|0)!=(e|0)){e=e-d|0;f=a-(v[a-4>>2]&-2)|0;d=e+v[f>>2]|0;v[f>>2]=d;v[(f+(d&-4)|0)-4>>2]=d;a=a+e|0;b=b-e|0;v[a>>2]=b}a:{if(c+24>>>0<=b>>>0){d=(a+c|0)+8|0;b=(b-c|0)-8|0;v[d>>2]=b;v[(d+(b&-4)|0)-4>>2]=b|1;g=d;f=v[d>>2]-8|0;b:{if(f>>>0<=127){e=(f>>>3|0)-1|0;break b}b=E(f);e=((f>>>29-b^4)-(b<<2)|0)+110|0;if(f>>>0<=4095){break b}b=((f>>>30-b^2)-(b<<1)|0)+71|0;e=b>>>0<63?b:63}b=e;e=b<<4;v[g+4>>2]=e+4128;e=e+4136|0;v[d+8>>2]=v[e>>2];v[e>>2]=d;v[v[d+8>>2]+4>>2]=d;e=v[1291];d=b&31;if((b&63)>>>0>=32){b=1<<d;f=0}else{f=1<<d;b=f-1&1>>>32-d}v[1290]=f|v[1290];v[1291]=b|e;b=c+8|0;v[a>>2]=b;v[((b&-4)+a|0)-4>>2]=b;break a}v[(a+b|0)-4>>2]=b}a=a+4|0}else{a=0}return a}function X(a){var b=0,c=0,d=0,e=0,f=0;if(a){c=a-4|0;e=v[c>>2];b=e;d=c;f=v[a-8>>2];a=f&-2;if((a|0)!=(f|0)){d=c-a|0;b=v[d+4>>2];v[b+8>>2]=v[d+8>>2];v[v[d+8>>2]+4>>2]=b;b=a+e|0}a=c+e|0;c=v[a>>2];if((c|0)!=v[(a+c|0)-4>>2]){e=v[a+4>>2];v[e+8>>2]=v[a+8>>2];v[v[a+8>>2]+4>>2]=e;b=b+c|0}v[d>>2]=b;v[((b&-4)+d|0)-4>>2]=b|1;f=d;b=v[d>>2]-8|0;a:{if(b>>>0<=127){a=(b>>>3|0)-1|0;break a}e=E(b);a=((b>>>29-e^4)-(e<<2)|0)+110|0;if(b>>>0<=4095){break a}a=((b>>>30-e^2)-(e<<1)|0)+71|0;a=a>>>0<63?a:63}c=a<<4;v[f+4>>2]=c+4128;c=c+4136|0;v[d+8>>2]=v[c>>2];v[c>>2]=d;v[v[d+8>>2]+4>>2]=d;c=v[1291];d=a&31;if((a&63)>>>0>=32){a=1<<d;b=0}else{b=1<<d;a=b-1&1>>>32-d}v[1290]=b|v[1290];v[1291]=a|c}}function _(a,b){var c=0;a:{if(!b){break a}c=a+b|0;t[c-1|0]=0;t[a|0]=0;if(b>>>0<3){break a}t[c-2|0]=0;t[a+1|0]=0;t[c-3|0]=0;t[a+2|0]=0;if(b>>>0<7){break a}t[c-4|0]=0;t[a+3|0]=0;if(b>>>0<9){break a}c=0-a&3;a=c+a|0;v[a>>2]=0;c=b-c&-4;b=c+a|0;v[b-4>>2]=0;if(c>>>0<9){break a}v[a+8>>2]=0;v[a+4>>2]=0;v[b-8>>2]=0;v[b-12>>2]=0;if(c>>>0<25){break a}v[a+24>>2]=0;v[a+20>>2]=0;v[a+16>>2]=0;v[a+12>>2]=0;v[b-16>>2]=0;v[b-20>>2]=0;v[b-24>>2]=0;v[b-28>>2]=0;b=c;c=a&4|24;b=b-c|0;if(b>>>0<32){break a}a=a+c|0;while(1){v[a+24>>2]=0;v[a+28>>2]=0;v[a+16>>2]=0;v[a+20>>2]=0;v[a+8>>2]=0;v[a+12>>2]=0;v[a>>2]=0;v[a+4>>2]=0;a=a+32|0;b=b-32|0;if(b>>>0>31){continue}break}}}function ja(a){a=a|0;var b=0,c=0,d=0,e=0,f=0;if(!w[4112]){ga();ea();t[4112]=1}c=Z(28);e=c;b=Z(1208);a:{if(b){v[b+36>>2]=2;f=b;d=Z(28456);if(d){v[d+52>>2]=104857600;v[d+60>>2]=2;v[d+24>>2]=0;v[d+56>>2]=0}else{d=0}v[f+1200>>2]=d;if(d){t[b+40|0]=0;v[b>>2]=0;v[b+4>>2]=0;v[b+24>>2]=0;v[b+28>>2]=0;_(b+72|0,100);v[b+172>>2]=12;break a}X(b)}b=0}v[e>>2]=b;b=Z(a);v[c+8>>2]=0;v[c+12>>2]=0;v[c+4>>2]=b;b=Z(a);v[c+24>>2]=a;v[c+20>>2]=0;v[c+16>>2]=b;return c|0}function ga(){var a=0,b=0,c=0,d=0;while(1){b=c>>>1|0;a=(b^0-(c&1)&-306674912)>>>1|0;b=(a^0-(b&1)&-306674912)>>>1|0;a=(0-(a&1)&-306674912^b)>>>1|0;d=0-(a&1)&-306674912;a=(a^0-(b&1)&-306674912)>>>1|0;b=(d^a)>>>1|0;a=(b^0-(a&1)&-306674912)>>>1|0;v[(c<<2)+1040>>2]=0-(a&1)&-306674912^(a^0-(b&1)&-306674912)>>>1;c=c+1|0;if((c|0)!=256){continue}break}}function fa(a,b,c){var d=0,e=0;a:{b:{if(c>>>0>=4){if((a|b)&3){break b}while(1){if(v[a>>2]!=v[b>>2]){break b}b=b+4|0;a=a+4|0;c=c-4|0;if(c>>>0>3){continue}break}}if(!c){break a}}while(1){d=w[a|0];e=w[b|0];if((d|0)==(e|0)){b=b+1|0;a=a+1|0;c=c-1|0;if(c){continue}break a}break}return d-e|0}return 0}function Y(a,b,c){var d=0;c=c^-1;a:{if(!b){break a}if(b&1){c=v[((w[a|0]^c&255)<<2)+1040>>2]^c>>>8;a=a+1|0;d=b-1|0}else{d=b}if((b|0)==1){break a}while(1){b=v[((w[a|0]^c&255)<<2)+1040>>2]^c>>>8;c=v[((w[a+1|0]^b&255)<<2)+1040>>2]^b>>>8;a=a+2|0;d=d-2|0;if(d){continue}break}}return c^-1}function ba(a,b,c){var d=0,e=0,f=0;e=v[a+16>>2];d=c-e|0;f=d+v[a+128>>2]|0;c=v[a+132>>2];v[a+128>>2]=f;v[a+132>>2]=f>>>0<d>>>0?c+1|0:c;v[a+24>>2]=Y(b+e|0,d,v[a+24>>2]);v[a+28>>2]=0}function la(a){a=a|0;var b=0,c=0;b=v[a>>2];if(b){c=v[b+1200>>2];if(v[c+60>>2]){X(v[c+24>>2])}X(c);X(b)}X(v[a+4>>2]);X(v[a+16>>2]);X(a)}function ha(){var a=0,b=0,c=0;while(1){b=a<<4;c=b+4128|0;v[b+4132>>2]=c;v[b+4136>>2]=c;a=a+1|0;if((a|0)!=64){continue}break}aa(48)}function qa(a,b){a=a|0;b=b|0;v[a+12>>2]=b;v[a+8>>2]=0}function ia(a){a=a|0;return y[a+8>>2]>=y[a+12>>2]|0}function ka(){if(!w[4112]){ga();ea();t[4112]=1}}function ra(a){a=a|0;return v[a+4>>2]}
function oa(a){a=a|0;return v[a+20>>2]}function na(a){a=a|0;return v[a+16>>2]}function ma(a){a=a|0;v[a+20>>2]=0}
// EMSCRIPTEN_END_FUNCS
e=w;p(U);var R=c([]);function S(){return s.byteLength/65536|0}return{"d":ha,"e":ka,"f":ja,"g":ia,"h":ra,"i":qa,"j":pa,"k":oa,"l":na,"m":ma,"n":la,"o":R}}return T(V)}
// EMSCRIPTEN_END_ASM




)(A)}function ca(){return{then:function(b){b({instance:new ba})}}}var da=Error,WebAssembly={};y=[];"object"!==typeof WebAssembly&&B("no native wasm support detected");
var D,E=!1,F,G,z=a.INITIAL_MEMORY||83886080;a.wasmMemory?D=a.wasmMemory:D=new aa;D&&(F=D.buffer);z=F.byteLength;var H=F;F=H;a.HEAP8=new Int8Array(H);a.HEAP16=new Int16Array(H);a.HEAP32=new Int32Array(H);a.HEAPU8=G=new Uint8Array(H);a.HEAPU16=new Uint16Array(H);a.HEAPU32=new Uint32Array(H);a.HEAPF32=new Float32Array(H);a.HEAPF64=new Float64Array(H);var K,L=[],M=[],N=[];function fa(){var b=a.preRun.shift();L.unshift(b)}
Math.imul||(Math.imul=function(b,e){var d=b&65535,m=e&65535;return d*m+((b>>>16)*m+d*(e>>>16)<<16)|0});if(!Math.fround){var ha=new Float32Array(1);Math.fround=function(b){ha[0]=b;return ha[0]}}Math.clz32||(Math.clz32=function(b){var e=32,d=b>>16;d&&(e-=16,b=d);if(d=b>>8)e-=8,b=d;if(d=b>>4)e-=4,b=d;if(d=b>>2)e-=2,b=d;return b>>1?e-2:e-b});Math.trunc||(Math.trunc=function(b){return 0>b?Math.ceil(b):Math.floor(b)});var O=0,S=null,T=null;a.preloadedImages={};a.preloadedAudios={};
function B(b){if(a.onAbort)a.onAbort(b);b="Aborted("+b+")";x(b);E=!0;b=new da(b+". Build with -s ASSERTIONS=1 for more info.");q(b);throw b;}function U(b){return b.startsWith("data:application/octet-stream;base64,")}var V;if(a.locateFile){if(V="xzdec-asm.wasm",!U(V)){var ia=V;V=a.locateFile?a.locateFile(ia,u):u+ia}}else V=(new URL("xzdec-asm.wasm",__LIB_URL)).toString();
function ja(){var b=V;try{if(b==V&&y)return new Uint8Array(y);if(U(b))try{var e=ka(b.slice(37)),d=new Uint8Array(e.length);for(b=0;b<e.length;++b)d[b]=e.charCodeAt(b);var m=d}catch(k){throw Error("Converting base64 string to bytes failed.");}else m=void 0;var h=m;if(h)return h;throw"both async and sync fetching of the wasm failed";}catch(k){B(k)}}
function la(){return y||"function"!==typeof fetch?Promise.resolve().then(function(){return ja()}):fetch(V,{credentials:"same-origin"}).then(function(b){if(!b.ok)throw"failed to load wasm binary file at '"+V+"'";return b.arrayBuffer()}).catch(function(){return ja()})}function W(b){for(;0<b.length;){var e=b.shift();if("function"==typeof e)e(a);else{var d=e.H;"number"===typeof d?void 0===e.A?ma(d)():ma(d)(e.A):d(void 0===e.A?null:e.A)}}}var X=[];
function ma(b){var e=X[b];e||(b>=X.length&&(X.length=b+1),X[b]=e=K.get(b));return e}
var ka="function"===typeof atob?atob:function(b){var e="",d=0;b=b.replace(/[^A-Za-z0-9\+\/=]/g,"");do{var m="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(b.charAt(d++));var h="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(b.charAt(d++));var k="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(b.charAt(d++));var v="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(b.charAt(d++));m=m<<2|h>>4;
h=(h&15)<<4|k>>2;var I=(k&3)<<6|v;e+=String.fromCharCode(m);64!==k&&(e+=String.fromCharCode(h));64!==v&&(e+=String.fromCharCode(I))}while(d<b.length);return e},A={b:Uint8Array.prototype.copyWithin?function(b,e,d){G.copyWithin(b,e,e+d)}:function(b,e,d){G.set(G.subarray(e,e+d),b)},c:function(){B("OOM")},a:D};
(function(){function b(h){a.asm=h.exports;K=a.asm.o;M.unshift(a.asm.d);O--;a.monitorRunDependencies&&a.monitorRunDependencies(O);0==O&&(null!==S&&(clearInterval(S),S=null),T&&(h=T,T=null,h()))}function e(h){b(h.instance)}function d(h){return la().then(function(){return ca()}).then(function(k){return k}).then(h,function(k){x("failed to asynchronously prepare wasm: "+k);B(k)})}var m={a:A};O++;a.monitorRunDependencies&&a.monitorRunDependencies(O);if(a.instantiateWasm)try{return a.instantiateWasm(m,b)}catch(h){return x("Module.instantiateWasm callback failed with error: "+
h),!1}(function(){return y||"function"!==typeof WebAssembly.instantiateStreaming||U(V)||"function"!==typeof fetch?d(e):fetch(V,{credentials:"same-origin"}).then(function(h){return WebAssembly.instantiateStreaming(h,m).then(e,function(k){x("wasm streaming compile failed: "+k);x("falling back to ArrayBuffer instantiation");return d(e)})})})().catch(q);return{}})();a.___wasm_call_ctors=function(){return(a.___wasm_call_ctors=a.asm.d).apply(null,arguments)};
a._init=function(){return(a._init=a.asm.e).apply(null,arguments)};a._init_decompression=function(){return(a._init_decompression=a.asm.f).apply(null,arguments)};a._input_empty=function(){return(a._input_empty=a.asm.g).apply(null,arguments)};a._get_in_buffer=function(){return(a._get_in_buffer=a.asm.h).apply(null,arguments)};a._set_new_input=function(){return(a._set_new_input=a.asm.i).apply(null,arguments)};a._decompress=function(){return(a._decompress=a.asm.j).apply(null,arguments)};
a._get_out_pos=function(){return(a._get_out_pos=a.asm.k).apply(null,arguments)};a._get_out_buffer=function(){return(a._get_out_buffer=a.asm.l).apply(null,arguments)};a._out_buffer_cleared=function(){return(a._out_buffer_cleared=a.asm.m).apply(null,arguments)};a._release=function(){return(a._release=a.asm.n).apply(null,arguments)};var Y;T=function na(){Y||Z();Y||(T=na)};
function Z(){function b(){if(!Y&&(Y=!0,a.calledRun=!0,!E)){W(M);n(a);if(a.onRuntimeInitialized)a.onRuntimeInitialized();if(a.postRun)for("function"==typeof a.postRun&&(a.postRun=[a.postRun]);a.postRun.length;){var e=a.postRun.shift();N.unshift(e)}W(N)}}if(!(0<O)){if(a.preRun)for("function"==typeof a.preRun&&(a.preRun=[a.preRun]);a.preRun.length;)fa();W(L);0<O||(a.setStatus?(a.setStatus("Running..."),setTimeout(function(){setTimeout(function(){a.setStatus("")},1);b()},1)):b())}}a.run=Z;
if(a.preInit)for("function"==typeof a.preInit&&(a.preInit=[a.preInit]);0<a.preInit.length;)a.preInit.pop()();Z();


  return XZ.ready
}
);
})();
return XZ;
});
__def("xzdec-wasm", [], function(){

var XZ = (function() {
  var _scriptDir = __LIB_URL;
  
  return (
function(XZ) {
  XZ = XZ || {};


var a;a||(a=typeof XZ !== 'undefined' ? XZ : {});var e,f;a.ready=new Promise(function(b,c){e=b;f=c});var h={},l;for(l in a)a.hasOwnProperty(l)&&(h[l]=a[l]);var m="";"undefined"!==typeof document&&document.currentScript&&(m=document.currentScript.src);_scriptDir&&(m=_scriptDir);0!==m.indexOf("blob:")?m=m.substr(0,m.replace(/[?#].*/,"").lastIndexOf("/")+1):m="";var n=a.printErr||console.warn.bind(console);for(l in h)h.hasOwnProperty(l)&&(a[l]=h[l]);h=null;var p;
a.wasmBinary&&(p=a.wasmBinary);var noExitRuntime=a.noExitRuntime||!0;"object"!==typeof WebAssembly&&q("no native wasm support detected");var r,t=!1,u,v,w=[],x=[],z=[];function A(){var b=a.preRun.shift();w.unshift(b)}var B=0,C=null,D=null;a.preloadedImages={};a.preloadedAudios={};function q(b){if(a.onAbort)a.onAbort(b);b="Aborted("+b+")";n(b);t=!0;b=new WebAssembly.RuntimeError(b+". Build with -s ASSERTIONS=1 for more info.");f(b);throw b;}
function E(){return F.startsWith("data:application/octet-stream;base64,")}var F;if(a.locateFile){if(F="xzdec-wasm.wasm",!E()){var G=F;F=a.locateFile?a.locateFile(G,m):m+G}}else F=(new URL("xzdec-wasm.wasm",__LIB_URL)).toString();function H(){var b=F;try{if(b==F&&p)return new Uint8Array(p);throw"both async and sync fetching of the wasm failed";}catch(c){q(c)}}
function I(){return p||"function"!==typeof fetch?Promise.resolve().then(function(){return H()}):fetch(F,{credentials:"same-origin"}).then(function(b){if(!b.ok)throw"failed to load wasm binary file at '"+F+"'";return b.arrayBuffer()}).catch(function(){return H()})}function J(b){for(;0<b.length;){var c=b.shift();if("function"==typeof c)c(a);else{var g=c.u;"number"===typeof g?void 0===c.s?K(g)():K(g)(c.s):g(void 0===c.s?null:c.s)}}}var L=[];
function K(b){var c=L[b];c||(b>=L.length&&(L.length=b+1),L[b]=c=v.get(b));return c}var M={a:function(b,c,g){u.copyWithin(b,c,c+g)},b:function(){q("OOM")}};
(function(){function b(d){a.asm=d.exports;r=a.asm.c;d=r.buffer;a.HEAP8=new Int8Array(d);a.HEAP16=new Int16Array(d);a.HEAP32=new Int32Array(d);a.HEAPU8=u=new Uint8Array(d);a.HEAPU16=new Uint16Array(d);a.HEAPU32=new Uint32Array(d);a.HEAPF32=new Float32Array(d);a.HEAPF64=new Float64Array(d);v=a.asm.o;x.unshift(a.asm.d);B--;a.monitorRunDependencies&&a.monitorRunDependencies(B);0==B&&(null!==C&&(clearInterval(C),C=null),D&&(d=D,D=null,d()))}function c(d){b(d.instance)}function g(d){return I().then(function(k){return WebAssembly.instantiate(k,
y)}).then(function(k){return k}).then(d,function(k){n("failed to asynchronously prepare wasm: "+k);q(k)})}var y={a:M};B++;a.monitorRunDependencies&&a.monitorRunDependencies(B);if(a.instantiateWasm)try{return a.instantiateWasm(y,b)}catch(d){return n("Module.instantiateWasm callback failed with error: "+d),!1}(function(){return p||"function"!==typeof WebAssembly.instantiateStreaming||E()||"function"!==typeof fetch?g(c):fetch(F,{credentials:"same-origin"}).then(function(d){return WebAssembly.instantiateStreaming(d,
y).then(c,function(k){n("wasm streaming compile failed: "+k);n("falling back to ArrayBuffer instantiation");return g(c)})})})().catch(f);return{}})();a.___wasm_call_ctors=function(){return(a.___wasm_call_ctors=a.asm.d).apply(null,arguments)};a._init=function(){return(a._init=a.asm.e).apply(null,arguments)};a._init_decompression=function(){return(a._init_decompression=a.asm.f).apply(null,arguments)};a._input_empty=function(){return(a._input_empty=a.asm.g).apply(null,arguments)};
a._get_in_buffer=function(){return(a._get_in_buffer=a.asm.h).apply(null,arguments)};a._set_new_input=function(){return(a._set_new_input=a.asm.i).apply(null,arguments)};a._decompress=function(){return(a._decompress=a.asm.j).apply(null,arguments)};a._get_out_pos=function(){return(a._get_out_pos=a.asm.k).apply(null,arguments)};a._get_out_buffer=function(){return(a._get_out_buffer=a.asm.l).apply(null,arguments)};a._out_buffer_cleared=function(){return(a._out_buffer_cleared=a.asm.m).apply(null,arguments)};
a._release=function(){return(a._release=a.asm.n).apply(null,arguments)};var N;D=function O(){N||P();N||(D=O)};
function P(){function b(){if(!N&&(N=!0,a.calledRun=!0,!t)){J(x);e(a);if(a.onRuntimeInitialized)a.onRuntimeInitialized();if(a.postRun)for("function"==typeof a.postRun&&(a.postRun=[a.postRun]);a.postRun.length;){var c=a.postRun.shift();z.unshift(c)}J(z)}}if(!(0<B)){if(a.preRun)for("function"==typeof a.preRun&&(a.preRun=[a.preRun]);a.preRun.length;)A();J(w);0<B||(a.setStatus?(a.setStatus("Running..."),setTimeout(function(){setTimeout(function(){a.setStatus("")},1);b()},1)):b())}}a.run=P;
if(a.preInit)for("function"==typeof a.preInit&&(a.preInit=[a.preInit]);0<a.preInit.length;)a.preInit.pop()();P();


  return XZ.ready
}
);
})();
return XZ;
});
__def("xzdec_wrapper", ['uiUtil', 'xzdec-asm', 'xzdec-wasm'], function(uiUtil, XZASM, XZWASM){
﻿/**
 * xzdec_wrapper.js: Javascript wrapper around compiled xz decompressor.
 *
 * Copyright 2021 Mossroy and contributors
 * Licence GPL v3:
 *
 * This file is part of Kiwix.
 *
 * Kiwix is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public Licence as published by
 * the Free Software Foundation, either version 3 of the Licence, or
 * (at your option) any later version.
 *
 * Kiwix is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public Licence for more details.
 *
 * You should have received a copy of the GNU General Public Licence
 * along with Kiwix (file LICENSE-GPLv3.txt).  If not, see <http://www.gnu.org/licenses/>
 */
'use strict';

/* global self, params */




// Variable specific to this decompressor (will be used to populate global variable)
var XZMachineType = null;

// Select asm or wasm conditionally
if ('WebAssembly' in self && 'fetch' in self) {
    console.debug('Instantiating WASM xz decoder');
    XZMachineType = 'WASM';
} else {
    console.debug('Instantiating ASM xz decoder');
    XZMachineType = 'ASM';
}

// DEV: xzdec.js has been compiled with `-s EXPORT_NAME="XZ" -s MODULARIZE=1` to avoid a clash with zstddec.js
// For explanation of loading method below to avoid conflicts, see https://github.com/emscripten-core/emscripten/blob/master/src/settings.js

/**
 * @typedef EMSInstance An object type representing an Emscripten instance
 */

/**
 * The XZ Decoder instance
 * @type EMSInstance
 */
var xzdec;

var loadASM = function () {
    XZASM().then(function (instance) {
        params.decompressorAPI.assemblerMachineType = XZMachineType;
        xzdec = instance;
    }).catch(function (err) {
        uiUtil.reportAssemblerErrorToAPIStatusPanel('XZ', err, XZMachineType);
    });
};

if (XZMachineType === 'WASM') {
    XZWASM().then(function (instance) {
        params.decompressorAPI.assemblerMachineType = XZMachineType;
        xzdec = instance;
    }).catch(function (err) {
        console.warn('WASM xz decoder failed to load, falling back to ASM because:', err.message || err);
        XZMachineType = 'ASM';
        loadASM();
    });
} else {
    loadASM();
};

/**
 * Number of milliseconds to wait for the decompressor to be available for another chunk
 * @type Integer
 */
var DELAY_WAITING_IDLE_DECOMPRESSOR = 50;

/**
 * Is the decompressor already working?
 * @type Boolean
 */
var busy = false;

/**
 * @typedef Decompressor
 * @property {Integer} _chunkSize
 * @property {FileReader} _reader
 * @property {unresolved} _decHandle
 * @property {Integer} _inStreamPos
 * @property {Integer} _outStreamPos
 * @property {Array} _outBuffer
 */

/**
 * @constructor
 * @param {FileReader} reader
 * @param {Integer} chunkSize
 * @returns {Decompressor}
 */
function Decompressor (reader, chunkSize) {
    params.decompressorAPI.decompressorLastUsed = 'XZ';
    this._chunkSize = chunkSize || 1024 * 5;
    this._reader = reader;
};

/**
 * Read length bytes, offset into the decompressed stream. Consecutive calls may only
 * advance in the stream and may not overlap.
 * @param {Integer} offset
 * @param {Integer} length
 */
Decompressor.prototype.readSlice = function (offset, length) {
    busy = true;
    var that = this;
    this._inStreamPos = 0;
    this._outStreamPos = 0;
    this._decHandle = xzdec._init_decompression(this._chunkSize);
    this._outBuffer = new Int8Array(new ArrayBuffer(length));
    this._outBufferPos = 0;
    return this._readLoop(offset, length).then(function (data) {
        xzdec._release(that._decHandle);
        busy = false;
        return data;
    });
};

/**
 * Reads stream of data from file offset for length of bytes to send to the decompresor
 * This function ensures that only one decompression runs at a time
 * @param {Integer} offset The file offset at which to begin reading compressed data
 * @param {Integer} length The amount of data to read
 * @returns {Promise} A Promise for the read data
 */
Decompressor.prototype.readSliceSingleThread = function (offset, length) {
    // Tests whether the decompressor is ready (initiated) and not busy
    if (xzdec && !busy) {
        return this.readSlice(offset, length);
    } else {
        // The decompressor is already in progress.
        // To avoid using too much memory, we wait until it has finished
        // before using it for another decompression
        var that = this;
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                that.readSliceSingleThread(offset, length).then(resolve, reject);
            }, DELAY_WAITING_IDLE_DECOMPRESSOR);
        });
    }
};

/**
 *
 * @param {Integer} offset
 * @param {Integer} length
 * @returns {Array}
 */
Decompressor.prototype._readLoop = function (offset, length) {
    var that = this;
    return this._fillInBufferIfNeeded().then(function () {
        var ret = xzdec._decompress(that._decHandle);
        var finished = false;
        if (ret === 0) {
            // supply more data or free output buffer
        } else if (ret === 1) {
            // stream ended
            finished = true;
        } else {
            // error @todo handle
            finished = true;
        }

        var outPos = xzdec._get_out_pos(that._decHandle);
        if (outPos > 0 && that._outStreamPos + outPos >= offset) {
            var outBuffer = xzdec._get_out_buffer(that._decHandle);
            var copyStart = offset - that._outStreamPos;
            if (copyStart < 0) {
                copyStart = 0;
            }
            for (var i = copyStart; i < outPos && that._outBufferPos < that._outBuffer.length; i++) {
                that._outBuffer[that._outBufferPos++] = xzdec.HEAP8[outBuffer + i];
            }
        }
        that._outStreamPos += outPos;
        if (outPos > 0) { xzdec._out_buffer_cleared(that._decHandle); }
        if (finished || that._outStreamPos >= offset + length) {
            return that._outBuffer;
        } else {
            return that._readLoop(offset, length);
        }
    });
};

/**
 *
 * @returns {Promise}
 */
Decompressor.prototype._fillInBufferIfNeeded = function () {
    if (!xzdec._input_empty(this._decHandle)) {
        return Promise.resolve(0);
    }
    var that = this;
    return this._reader(this._inStreamPos, this._chunkSize).then(function (data) {
        if (data.length > that._chunkSize) { data = data.slice(0, that._chunkSize); }
        // For some reason, xzdec.writeArrayToMemory does not seem to be available, and is equivalent to xzdec.HEAP8.set
        xzdec.HEAP8.set(data, xzdec._get_in_buffer(that._decHandle));
        that._inStreamPos += data.length;
        xzdec._set_new_input(that._decHandle, data.length);
        return 0;
    });
};

return {
    Decompressor: Decompressor
}
});
__def("zstddec-asm", [], function(){

var ZD = (function() {
  var _scriptDir = __LIB_URL;
  
  return (
function(ZD) {
  ZD = ZD || {};


var a;a||(a=typeof ZD !== 'undefined' ? ZD : {});
var Promise=function(){function c(){}function f(b,e){return function(){b.apply(e,arguments)}}function d(b){if(!(this instanceof d))throw new TypeError("Promises must be constructed via new");if("function"!==typeof b)throw new TypeError("not a function");this.s=0;this.B=!1;this.u=void 0;this.v=[];C(b,this)}function n(b,e){for(;3===b.s;)b=b.u;0===b.s?b.v.push(e):(b.B=!0,d.C(function(){var g=1===b.s?e.F:e.G;if(null===g)(1===b.s?l:m)(e.promise,b.u);else{try{var h=g(b.u)}catch(k){m(e.promise,k);return}l(e.promise,
h)}}))}function l(b,e){try{if(e===b)throw new TypeError("A promise cannot be resolved with itself.");if(e&&("object"===typeof e||"function"===typeof e)){var g=e.then;if(e instanceof d){b.s=3;b.u=e;q(b);return}if("function"===typeof g){C(f(g,e),b);return}}b.s=1;b.u=e;q(b)}catch(h){m(b,h)}}function m(b,e){b.s=2;b.u=e;q(b)}function q(b){2===b.s&&0===b.v.length&&d.C(function(){b.B||d.D(b.u)});for(var e=0,g=b.v.length;e<g;e++)n(b,b.v[e]);b.v=null}function r(b,e,g){this.F="function"===typeof b?b:null;this.G=
"function"===typeof e?e:null;this.promise=g}function C(b,e){var g=!1;try{b(function(h){g||(g=!0,l(e,h))},function(h){g||(g=!0,m(e,h))})}catch(h){g||(g=!0,m(e,h))}}d.prototype["catch"]=function(b){return this.then(null,b)};d.prototype.then=function(b,e){var g=new this.constructor(c);n(this,new r(b,e,g));return g};d.all=function(b){return new d(function(e,g){function h(I,z){try{if(z&&("object"===typeof z||"function"===typeof z)){var T=z.then;if("function"===typeof T){T.call(z,function(M){h(I,M)},g);
return}}k[I]=z;0===--u&&e(k)}catch(M){g(M)}}if(!Array.isArray(b))return g(new TypeError("Promise.all accepts an array"));var k=Array.prototype.slice.call(b);if(0===k.length)return e([]);for(var u=k.length,p=0;p<k.length;p++)h(p,k[p])})};d.resolve=function(b){return b&&"object"===typeof b&&b.constructor===d?b:new d(function(e){e(b)})};d.reject=function(b){return new d(function(e,g){g(b)})};d.race=function(b){return new d(function(e,g){if(!Array.isArray(b))return g(new TypeError("Promise.race accepts an array"));
for(var h=0,k=b.length;h<k;h++)d.resolve(b[h]).then(e,g)})};d.C="function"===typeof setImmediate&&function(b){setImmediate(b)}||function(b){setTimeout(b,0)};d.D=function(b){"undefined"!==typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",b)};return d}(),t,v;a.ready=new Promise(function(c,f){t=c;v=f});var w={},x;for(x in a)a.hasOwnProperty(x)&&(w[x]=a[x]);var y="";"undefined"!==typeof document&&document.currentScript&&(y=document.currentScript.src);_scriptDir&&(y=_scriptDir);
0!==y.indexOf("blob:")?y=y.substr(0,y.replace(/[?#].*/,"").lastIndexOf("/")+1):y="";var A=a.printErr||console.warn.bind(console);for(x in w)w.hasOwnProperty(x)&&(a[x]=w[x]);w=null;var B;a.wasmBinary&&(B=a.wasmBinary);var noExitRuntime=a.noExitRuntime||!0;function aa(){this.buffer=new ArrayBuffer(D/65536*65536)}function ba(){this.exports=(
// EMSCRIPTEN_START_ASM
function instantiate(W){function c(d){d.set=function(a,b){this[a]=b};d.get=function(a){return this[a]};return d}var e;var f=new Uint8Array(123);for(var a=25;a>=0;--a){f[48+a]=52+a;f[65+a]=a;f[97+a]=26+a}f[43]=62;f[47]=63;function l(m,n,o){var g,h,a=0,i=n,j=o.length,k=n+(j*3>>2)-(o[j-2]=="=")-(o[j-1]=="=");for(;a<j;a+=4){g=f[o.charCodeAt(a+1)];h=f[o.charCodeAt(a+2)];m[i++]=f[o.charCodeAt(a)]<<2|g>>4;if(i<k)m[i++]=g<<4|h>>2;if(i<k)m[i++]=h<<6|f[o.charCodeAt(a+3)]}}function p(q){l(e,1024,"QWxsb2NhdGlvbiBlcnJvciA6IG5vdCBlbm91Z2ggbWVtb3J5AENvbnRleHQgc2hvdWxkIGJlIGluaXQgZmlyc3QAU3JjIHNpemUgaXMgaW5jb3JyZWN0AENhbm5vdCBjcmVhdGUgRGljdGlvbmFyeSBmcm9tIHByb3ZpZGVkIHNhbXBsZXMAVW5rbm93biBmcmFtZSBkZXNjcmlwdG9yAFVuc3VwcG9ydGVkIGZyYW1lIHBhcmFtZXRlcgBVbnN1cHBvcnRlZCBwYXJhbWV0ZXIAT3BlcmF0aW9uIG9uIE5VTEwgZGVzdGluYXRpb24gYnVmZmVyAFJlc3RvcmVkIGRhdGEgZG9lc24ndCBtYXRjaCBjaGVja3N1bQBEZXN0aW5hdGlvbiBidWZmZXIgaXMgdG9vIHNtYWxsAFNwZWNpZmllZCBtYXhTeW1ib2xWYWx1ZSBpcyB0b28gc21hbGwAd29ya1NwYWNlIGJ1ZmZlciBpcyBub3QgbGFyZ2UgZW5vdWdoAERpY3Rpb25hcnkgbWlzbWF0Y2gARGVzdGluYXRpb24gYnVmZmVyIGlzIHdyb25nAEFuIEkvTyBlcnJvciBvY2N1cnJlZCB3aGVuIHJlYWRpbmcvc2Vla2luZwBGcmFtZSByZXF1aXJlcyB0b28gbXVjaCBtZW1vcnkgZm9yIGRlY29kaW5nAEZyYW1lIGluZGV4IGlzIHRvbyBsYXJnZQBVbnN1cHBvcnRlZCBtYXggU3ltYm9sIFZhbHVlIDogdG9vIGxhcmdlAE9wZXJhdGlvbiBub3QgYXV0aG9yaXplZCBhdCBjdXJyZW50IHByb2Nlc3Npbmcgc3RhZ2UAVW5zcGVjaWZpZWQgZXJyb3IgY29kZQBQYXJhbWV0ZXIgaXMgb3V0IG9mIGJvdW5kAHRhYmxlTG9nIHJlcXVpcmVzIHRvbyBtdWNoIG1lbW9yeSA6IHVuc3VwcG9ydGVkAFZlcnNpb24gbm90IHN1cHBvcnRlZABEaWN0aW9uYXJ5IGlzIGNvcnJ1cHRlZABObyBlcnJvciBkZXRlY3RlZABDb3JydXB0ZWQgYmxvY2sgZGV0ZWN0ZWQARXJyb3IgKGdlbmVyaWMp");l(e,1880,"AQAAAAEAAAACAAAAAg==");l(e,1904,"AQAAAAEAAAACAAAAAgAAACYAAACCAAAAIQUAAEoAAABnCAAAJgAAAMABAACAAAAASQUAAEoAAAC+CAAAKQAAACwCAACAAAAASQUAAEoAAAC+CAAALwAAAMoCAACAAAAAigUAAEoAAACECQAANQAAAHMDAACAAAAAnQUAAEoAAACgCQAAPQAAAIEDAACAAAAA6wUAAEsAAAA+CgAARAAAAJ4DAACAAAAATQYAAEsAAACqCgAASwAAALMDAACAAAAAwQYAAE0AAAAfDQAATQAAAFMEAACAAAAAIwgAAFEAAACmDwAAVAAAAJkEAACAAAAASwkAAFcAAACxEgAAWAAAANoEAACAAAAAbwkAAF0AAAAjFAAAVAAAAEUFAACAAAAAVAoAAGoAAACMFAAAagAAAK8FAACAAAAAdgkAAHwAAABOEAAAfAAAANICAACAAAAAYwcAAJEAAACQBwAAkgAAAAAAAAABAAAAAQAAAAUAAAANAAAAHQAAAD0AAAB9AAAA/QAAAP0BAAD9AwAA/QcAAP0PAAD9HwAA/T8AAP1/AAD9/wAA/f8BAP3/AwD9/wcA/f8PAP3/HwD9/z8A/f9/AP3//wD9//8B/f//A/3//wf9//8P/f//H/3//z/9//9/AAAAAAEAAAACAAAAAwAAAAQAAAAFAAAABgAAAAcAAAAIAAAACQAAAAoAAAALAAAADAAAAA0AAAAOAAAADwAAABAAAAARAAAAEgAAABMAAAAUAAAAFQAAABYAAAAXAAAAGAAAABkAAAAaAAAAGwAAABwAAAAdAAAAHgAAAB8AAAADAAAABAAAAAUAAAAGAAAABwAAAAgAAAAJAAAACgAAAAsAAAAMAAAADQAAAA4AAAAPAAAAEAAAABEAAAASAAAAEwAAABQAAAAVAAAAFgAAABcAAAAYAAAAGQAAABoAAAAbAAAAHAAAAB0AAAAeAAAAHwAAACAAAAAhAAAAIgAAACMAAAAlAAAAJwAAACkAAAArAAAALwAAADMAAAA7AAAAQwAAAFMAAABjAAAAgwAAAAMBAAADAgAAAwQAAAMIAAADEAAAAyAAAANAAAADgAAAAwAB");l(e,2864,"AQAAAAEAAAABAAAAAQAAAAIAAAACAAAAAwAAAAMAAAAEAAAABAAAAAUAAAAHAAAACAAAAAkAAAAKAAAACwAAAAwAAAANAAAADgAAAA8AAAAQ");l(e,2964,"AQAAAAIAAAADAAAABAAAAAUAAAAGAAAABwAAAAgAAAAJAAAACgAAAAsAAAAMAAAADQAAAA4AAAAPAAAAEAAAABIAAAAUAAAAFgAAABgAAAAcAAAAIAAAACgAAAAwAAAAQAAAAIAAAAAAAQAAAAIAAAAEAAAACAAAABAAAAAgAAAAQAAAAIAAAAAAAQ==");l(e,3168,"AQAAAAEAAAABAAAAAQAAAAIAAAACAAAAAwAAAAMAAAAEAAAABgAAAAcAAAAIAAAACQAAAAoAAAALAAAADAAAAA0AAAAOAAAADwAAABAAAAABAAAABAAAAAgAAAAAAAAAAQABAQYAAAAAAAAEAAAAABAAAAQAAAAAIAAABQEAAAAAAAAFAwAAAAAAAAUEAAAAAAAABQYAAAAAAAAFBwAAAAAAAAUJAAAAAAAABQoAAAAAAAAFDAAAAAAAAAYOAAAAAAABBRAAAAAAAAEFFAAAAAAAAQUWAAAAAAACBRwAAAAAAAMFIAAAAAAABAUwAAAAIAAGBUAAAAAAAAcFgAAAAAAACAYAAQAAAAAKBgAEAAAAAAwGABAAACAAAAQAAAAAAAAABAEAAAAAAAAFAgAAACAAAAUEAAAAAAAABQUAAAAgAAAFBwAAAAAAAAUIAAAAIAAABQoAAAAAAAAFCwAAAAAAAAYNAAAAIAABBRAAAAAAAAEFEgAAACAAAQUWAAAAAAACBRgAAAAgAAMFIAAAAAAAAwUoAAAAAAAGBEAAAAAQAAYEQAAAACAABwWAAAAAAAAJBgACAAAAAAsGAAgAADAAAAQAAAAAEAAABAEAAAAgAAAFAgAAACAAAAUDAAAAIAAABQUAAAAgAAAFBgAAACAAAAUIAAAAIAAABQkAAAAgAAAFCwAAACAAAAUMAAAAAAAABg8AAAAgAAEFEgAAACAAAQUUAAAAIAACBRgAAAAgAAIFHAAAACAAAwUoAAAAIAAEBTAAAAAAABAGAAABAAAADwYAgAAAAAAOBgBAAAAAAA0GACA=");l(e,3792,"AQABAQUAAAAAAAAFAAAAAAAABgQ9AAAAAAAJBf0BAAAAAA8F/X8AAAAAFQX9/x8AAAADBQUAAAAAAAcEfQAAAAAADAX9DwAAAAASBf3/AwAAABcF/f9/AAAABQUdAAAAAAAIBP0AAAAAAA4F/T8AAAAAFAX9/w8AAAACBQEAAAAQAAcEfQAAAAAACwX9BwAAAAARBf3/AQAAABYF/f8/AAAABAUNAAAAEAAIBP0AAAAAAA0F/R8AAAAAEwX9/wcAAAABBQEAAAAQAAYEPQAAAAAACgX9AwAAAAAQBf3/AAAAABwF/f//DwAAGwX9//8HAAAaBf3//wMAABkF/f//AQAAGAX9//8=");l(e,4064,"AQABAQYAAAAAAAAGAwAAAAAAAAQEAAAAIAAABQUAAAAAAAAFBgAAAAAAAAUIAAAAAAAABQkAAAAAAAAFCwAAAAAAAAYNAAAAAAAABhAAAAAAAAAGEwAAAAAAAAYWAAAAAAAABhkAAAAAAAAGHAAAAAAAAAYfAAAAAAAABiIAAAAAAAEGJQAAAAAAAQYpAAAAAAACBi8AAAAAAAMGOwAAAAAABAZTAAAAAAAHBoMAAAAAAAkGAwIAABAAAAQEAAAAAAAABAUAAAAgAAAFBgAAAAAAAAUHAAAAIAAABQkAAAAAAAAFCgAAAAAAAAYMAAAAAAAABg8AAAAAAAAGEgAAAAAAAAYVAAAAAAAABhgAAAAAAAAGGwAAAAAAAAYeAAAAAAAABiEAAAAAAAEGIwAAAAAAAQYnAAAAAAACBisAAAAAAAMGMwAAAAAABAZDAAAAAAAFBmMAAAAAAAgGAwEAACAAAAQEAAAAMAAABAQAAAAQAAAEBQAAACAAAAUHAAAAIAAABQgAAAAgAAAFCgAAACAAAAULAAAAAAAABg4AAAAAAAAGEQAAAAAAAAYUAAAAAAAABhcAAAAAAAAGGgAAAAAAAAYdAAAAAAAABiAAAAAAABAGAwABAAAADwYDgAAAAAAOBgNAAAAAAA0GAyAAAAAADAYDEAAAAAALBgMIAAAAAAoGAwQ=");l(e,4596,"AQAAAAMAAAAHAAAADwAAAB8AAAA/AAAAfwAAAP8AAAD/AQAA/wMAAP8HAAD/DwAA/x8AAP8/AAD/fwAA//8AAP//AQD//wMA//8HAP//DwD//x8A//8/AP//fwD///8A////Af///wP///8H////D////x////8/////fwAAAAABAAAAAgAAAAQAAAAAAAAAAgAAAAQAAAAIAAAAAAAAAAEAAAACAAAAAQAAAAQAAAAEAAAABAAAAAQAAAAIAAAACAAAAAgAAAAHAAAACAAAAAkAAAAKAAAACw==");l(e,4817,"F1A=")}function U(V){var r=V.a;var s=r.buffer;var t=new Int8Array(s);var u=new Int16Array(s);var v=new Int32Array(s);var w=new Uint8Array(s);var x=new Uint16Array(s);var y=new Uint32Array(s);var z=new Float32Array(s);var A=new Float64Array(s);var B=Math.imul;var C=Math.fround;var D=Math.abs;var E=Math.clz32;var F=Math.min;var G=Math.max;var H=Math.floor;var I=Math.ceil;var J=Math.trunc;var K=Math.sqrt;var L=V.abort;var M=NaN;var N=Infinity;var O=V.b;var P=V.c;var Q=5248768;var R=0;
// EMSCRIPTEN_START_FUNCS
function qa(a,b,c,d,e){var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,z=0,A=0,C=0,D=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,R=0,S=0,T=0,U=0,V=0;k=Q-192|0;Q=k;g=a+28760|0;f=v[g+4>>2];g=v[g>>2];h=!f&g>>>0>33554432|(f|0)!=0;p=-72;a:{if(e>>>0>131071){break a}F=-20;b:{c:{if(e>>>0<3){break c}d:{e:{f:{g:{h:{p=w[d|0];A=p&3;switch(A-1|0){case 0:break f;case 1:break g;case 2:break h;default:break e}}if(v[a+28808>>2]){break g}p=-30;break b}if(e>>>0<5){break c}o=3;f=w[d|0]|w[d+1|0]<<8|(w[d+2|0]<<16|w[d+3|0]<<24);i:{j:{k:{l:{j=p>>>2&3;switch(j-2|0){case 1:break j;case 0:break k;default:break l}}g=f>>>14&1023;p=f>>>4&1023;f=!j;break i}g=f>>>18|0;o=4;p=f>>>4&16383;f=0;break i}p=f>>>4&262143;if(p>>>0>131072){break c}g=w[d+4|0]<<10|f>>>22;o=5;f=0}C=g+o|0;if(C>>>0>e>>>0){break c}if(!v[a+28956>>2]|p>>>0<769){break d}while(1){if(n>>>0>=16324){break d}n=n+512|0;continue}}g=2;m:{n:{switch((p>>>2&3)-1|0){default:g=1;f=p>>>3|0;break m;case 0:f=(w[d|0]|w[d+1|0]<<8)>>>4|0;break m;case 2:break n}}if(e>>>0<4){break c}f=w[d|0]|w[d+1|0]<<8|w[d+2|0]<<16;if(f>>>0>2097167){break c}g=3;f=f>>>4|0}j=_(a+29040|0,w[d+g|0],f+32|0);v[a+28928>>2]=f;v[a+28912>>2]=j;F=g+1|0;break c}g=2;j=e;o:{p:{switch((p>>>2&3)-1|0){default:g=1;f=p>>>3|0;break o;case 0:f=(w[d|0]|w[d+1|0]<<8)>>>4|0;break o;case 2:break p}}g=3;f=(w[d|0]|w[d+1|0]<<8|w[d+2|0]<<16)>>>4|0}p=f+g|0;if(p+32>>>0>j>>>0){if(e>>>0<p>>>0){break c}g=X(a+29040|0,d+g|0,f);v[a+28928>>2]=f;v[a+28912>>2]=g;f=f+g|0;t[f+24|0]=0;t[f+25|0]=0;t[f+26|0]=0;t[f+27|0]=0;t[f+28|0]=0;t[f+29|0]=0;t[f+30|0]=0;t[f+31|0]=0;t[f+16|0]=0;t[f+17|0]=0;t[f+18|0]=0;t[f+19|0]=0;t[f+20|0]=0;t[f+21|0]=0;t[f+22|0]=0;t[f+23|0]=0;t[f+8|0]=0;t[f+9|0]=0;t[f+10|0]=0;t[f+11|0]=0;t[f+12|0]=0;t[f+13|0]=0;t[f+14|0]=0;t[f+15|0]=0;t[f|0]=0;t[f+1|0]=0;t[f+2|0]=0;t[f+3|0]=0;t[f+4|0]=0;t[f+5|0]=0;t[f+6|0]=0;t[f+7|0]=0;break b}v[a+28928>>2]=f;v[a+28912>>2]=d+g;break b}q:{if((A|0)==3){l=d+o|0;o=a+29040|0;j=v[a+12>>2];if(f){r:{if(w[j+1|0]){f=-72;s:{if(!g){break s}t:{u:{v:{if(g>>>0>=4){n=w[(g+l|0)-1|0];f=-1;if(!n){break t}if(g>>>0<=4294967176){break v}f=g;break s}r=w[l|0];w:{switch(g-2|0){case 1:r=w[l+2|0]<<16|r;case 0:r=(w[l+1|0]<<8)+r|0;break;default:break w}}n=w[(g+l|0)-1|0];f=-20;if(!n){break s}g=(E(n)-(g<<3)|0)+9|0;break u}i=g-4|0;f=l+i|0;r=w[f|0]|w[f+1|0]<<8|(w[f+2|0]<<16|w[f+3|0]<<24);g=E(n)-23|0}s=j+4|0;u=p+o|0;D=0-x[j+2>>1]&31;x:{y:{if(g>>>0<=32){m=u-3|0;z:{while(1){A:{if((i|0)>=4){r=g>>>3|0;j=0;g=g&7;break A}if(!i){m=u-2|0;i=0;n=l;break y}f=g>>>3|0;j=l>>>0>(i+l|0)-f>>>0;r=j?i:f;g=g-(r<<3)|0}i=i-r|0;n=l+i|0;r=w[n|0]|w[n+1|0]<<8|(w[n+2|0]<<16|w[n+3|0]<<24);if(j|m>>>0<=o>>>0){break z}f=s+(r<<g>>>D<<2)|0;j=x[f>>1];t[o|0]=j;t[o+1|0]=j>>>8;j=w[f+3|0]+o|0;g=w[f+2|0]+g|0;f=s+(r<<g>>>D<<2)|0;o=x[f>>1];t[j|0]=o;t[j+1|0]=o>>>8;o=j+w[f+3|0]|0;g=g+w[f+2|0]|0;if(g>>>0<33){continue}break}m=u-2|0;break x}}n=i+l|0;m=u-2|0;if(g>>>0>32){break x}}while(1){B:{if((i|0)>=4){j=g&7;r=g>>>3|0;g=0;break B}if(!i){break x}f=g;j=f>>>3|0;g=l>>>0>n-j>>>0;r=g?i:j;j=f-(r<<3)|0}i=i-r|0;n=l+i|0;r=w[n|0]|w[n+1|0]<<8|(w[n+2|0]<<16|w[n+3|0]<<24);if(!(g?0:m>>>0>=o>>>0)){g=j;break x}f=s+(r<<j>>>D<<2)|0;g=x[f>>1];t[o|0]=g;t[o+1|0]=g>>>8;o=w[f+3|0]+o|0;g=w[f+2|0]+j|0;if(g>>>0<=32){continue}break}}if(m>>>0>=o>>>0){while(1){f=s+(r<<g>>>D<<2)|0;j=x[f>>1];t[o|0]=j;t[o+1|0]=j>>>8;g=w[f+2|0]+g|0;o=w[f+3|0]+o|0;if(m>>>0>=o>>>0){continue}break}}C:{if(o>>>0>=u>>>0){break C}j=r<<g>>>D|0;f=s+(j<<2)|0;t[o|0]=w[f|0];if(w[f+3|0]==1){g=w[f+2|0]+g|0;break C}if(g>>>0>31){break C}f=w[(s+(j<<2)|0)+2|0]+g|0;g=f>>>0<32?f:32}f=(l|0)!=(n|0)?-20:(g|0)!=32?-20:p}}break r}f=la(o,p,l,g,j)}break q}D:{if(w[j+1|0]){f=ra(o,p,l,g,j);break D}f=ka(o,p,l,g,j)}break q}j=a+26680|0;i=d+o|0;l=a+29040|0;n=a+10280|0;if(f){f=ma(n,i,g,j);if(f>>>0>4294967176){break q}if(f>>>0<g>>>0){f=la(l,p,f+i|0,g-f|0,n)}else{f=-72}break q}f=-70;E:{if(!p){break E}f=-20;if(!g){break E}m=p>>>8|0;f=B(g>>>0<p>>>0?(g<<4>>>0)/(p>>>0)|0:15,24);o=B(m,v[f+1884>>2])+v[f+1880>>2]|0;F:{if((o>>>3|0)+o>>>0<v[f+1872>>2]+B(m,v[f+1876>>2])>>>0){f=ia(n,i,g,j,2048);if(f>>>0>4294967176){break E}j=-72;if(f>>>0>=g>>>0){break F}f=ra(l,p,f+i|0,g-f|0,n);break E}f=ma(n,i,g,j);if(f>>>0>4294967176){break E}j=-72;if(f>>>0>=g>>>0){break F}j=ka(l,p,f+i|0,g-f|0,n)}f=j}}if(f>>>0>4294967176){break c}v[a+28928>>2]=p;v[a+28808>>2]=1;v[a+28912>>2]=a+29040;if((A|0)==2){v[a+12>>2]=a+10280}g=a+p|0;f=g+29064|0;t[f|0]=0;t[f+1|0]=0;t[f+2|0]=0;t[f+3|0]=0;t[f+4|0]=0;t[f+5|0]=0;t[f+6|0]=0;t[f+7|0]=0;f=g+29056|0;t[f|0]=0;t[f+1|0]=0;t[f+2|0]=0;t[f+3|0]=0;t[f+4|0]=0;t[f+5|0]=0;t[f+6|0]=0;t[f+7|0]=0;f=g+29048|0;t[f|0]=0;t[f+1|0]=0;t[f+2|0]=0;t[f+3|0]=0;t[f+4|0]=0;t[f+5|0]=0;t[f+6|0]=0;t[f+7|0]=0;f=g+29040|0;t[f|0]=0;t[f+1|0]=0;t[f+2|0]=0;t[f+3|0]=0;t[f+4|0]=0;t[f+5|0]=0;t[f+6|0]=0;t[f+7|0]=0;p=C;break b}p=F}if(p>>>0>4294967176){break a}n=v[a+28956>>2];f=d;d=p>>>0<4294967177?p:0;l=f+d|0;f=l;p=-72;m=e-d|0;g=m;G:{H:{if(!g){break H}e=w[f|0];if(!e){v[k+36>>2]=0;d=(g|0)==1?1:-72;break G}j=e<<24>>24;d=f+1|0;I:{if((j|0)>=0){break I}if((j|0)==-1){if((g|0)<3){break H}e=(w[f+1|0]|w[f+2|0]<<8)+32512|0;d=f+3|0;break I}if((g|0)<2){break H}e=(w[f+1|0]|e<<8)-32768|0;d=f+2|0}v[k+36>>2]=e;j=d+1|0;g=f+g|0;if(j>>>0>g>>>0){break H}p=-20;d=w[d|0];i=ga(a+16|0,a,d>>>6|0,35,9,j,g-j|0,2960,3104,3264,v[a+28812>>2],v[a+28956>>2],e);if(i>>>0>4294967176){break H}j=j+(i>>>0<4294967177?i:0)|0;i=ga(a+4120|0,a+8|0,d>>>4&3,31,8,j,g-j|0,2256,2384,3792,v[a+28812>>2],v[a+28956>>2],e);if(i>>>0>4294967176){break H}C=d>>>2&3;d=j+(i>>>0<4294967177?i:0)|0;e=ga(a+6176|0,a+4|0,C,52,9,d,g-d|0,2512,2736,4064,v[a+28812>>2],v[a+28956>>2],e);if(e>>>0>4294967176){break H}p=(d+e|0)-f|0}d=p}if(d>>>0>4294967176){p=d;break a}F=v[k+36>>2];if(!b){p=-70;if((F|0)>0){break a}}g=m-d|0;q=d+l|0;J:{K:{L:{if(n){v[a+28956>>2]=0;break L}d=a+28760|0;e=v[d>>2];if(!v[d+4>>2]&e>>>0<16777217|(F|0)<=4){break K}d=v[a+8>>2];f=d+8|0;d=v[d+4>>2];p=0;e=0;while(1){p=(w[(f+(e<<3)|0)+2|0]>22)+p|0;e=e+1|0;if(!(e>>>d|0)){continue}break}v[a+28956>>2]=0;if(p<<8-d>>>0<20){break J}}e=v[a+28912>>2];v[k+188>>2]=e;H=b+c|0;K=v[a+28928>>2]+e|0;M:{if(!F){d=b;break M}I=v[a+28740>>2];L=v[a+28736>>2];C=v[a+28732>>2];v[a+28812>>2]=1;v[k+92>>2]=v[a+26676>>2];G=a+26668|0;c=G;d=v[c+4>>2];v[k+84>>2]=v[c>>2];v[k+88>>2]=d;v[k+100>>2]=I;v[k+96>>2]=C;N=b-C|0;v[k+104>>2]=N;p=-20;if(!g){break a}v[k+52>>2]=q;v[k+56>>2]=q+4;N:{if(g>>>0>=4){d=g-4|0;c=q+d|0;v[k+48>>2]=c;l=w[c|0]|w[c+1|0]<<8|(w[c+2|0]<<16|w[c+3|0]<<24);v[k+40>>2]=l;if(l>>>0<16777216|g>>>0>4294967176){break a}e=E(l>>>24|0)-23|0;break N}v[k+48>>2]=q;l=w[q|0];v[k+40>>2]=l;O:{switch(g-2|0){case 1:l=w[q+2|0]<<16|l;case 0:l=(w[q+1|0]<<8)+l|0;v[k+40>>2]=l;break;default:break O}}c=w[(g+q|0)-1|0];if(!c){break a}e=(E(c)-(g<<3)|0)+9|0;v[k+44>>2]=e;d=0}f=v[a>>2];c=v[f+4>>2];e=c+e|0;o=l>>>0-e&v[(c<<2)+4592>>2];v[k+60>>2]=o;P:{if(e>>>0>32){break P}Q:{if((d|0)>=4){d=d-(e>>>3|0)|0;v[k+48>>2]=q+d;e=e&7;break Q}if(!d){d=0;break P}c=e>>>3|0;c=q>>>0>(d+q|0)-c>>>0?d:c;d=d-c|0;v[k+48>>2]=q+d;e=e-(c<<3)|0}c=d+q|0;l=w[c|0]|w[c+1|0]<<8|(w[c+2|0]<<16|w[c+3|0]<<24);v[k+40>>2]=l}g=(F|0)<4;R=f+8|0;v[k- -64>>2]=R;f=v[a+8>>2];c=v[f+4>>2];e=c+e|0;z=l>>>0-e&v[(c<<2)+4592>>2];v[k+68>>2]=z;R:{if(e>>>0>32){break R}S:{if((d|0)>=4){d=d-(e>>>3|0)|0;v[k+48>>2]=q+d;e=e&7;break S}if(!d){d=0;break R}c=e>>>3|0;c=q>>>0>(d+q|0)-c>>>0?d:c;d=d-c|0;v[k+48>>2]=q+d;e=e-(c<<3)|0}c=d+q|0;l=w[c|0]|w[c+1|0]<<8|(w[c+2|0]<<16|w[c+3|0]<<24);v[k+40>>2]=l}O=g?F:4;S=f+8|0;v[k+72>>2]=S;g=v[a+4>>2];a=v[g+4>>2];e=a+e|0;v[k+44>>2]=e;c=0;u=v[(a<<2)+4592>>2]&l>>>0-e;v[k+76>>2]=u;T:{U:{if(e>>>0>=33){v[k+80>>2]=g+8;n=h;break U}f=k;V:{W:{if((d|0)>=4){a=d-(e>>>3|0)|0;v[k+48>>2]=q+a;e=e&7;break W}if(!d){v[k+80>>2]=g+8;a=0;n=h;break V}a=e>>>3|0;c=q>>>0>(d+q|0)-a>>>0?d:a;a=d-c|0;v[k+48>>2]=q+a;e=e-(c<<3)|0}v[f+44>>2]=e;c=a+q|0;l=w[c|0]|w[c+1|0]<<8|(w[c+2|0]<<16|w[c+3|0]<<24);v[k+80>>2]=g+8;v[k+40>>2]=l;c=0;n=h;if(e>>>0>32){break U}}D=(O|0)>0?O:0;V=g+8|0;g=a;j=a;h=a;i=a;d=a;while(1){m=k;X:{Y:{if((d|0)>=4){f=e&7;v[k+44>>2]=f;a=d-(e>>>3|0)|0;d=q+a|0;v[k+48>>2]=d;l=w[d|0]|w[d+1|0]<<8|(w[d+2|0]<<16|w[d+3|0]<<24);break Y}if(!d){f=e;d=0;break X}a=e>>>3|0;a=q>>>0>(d+q|0)-a>>>0?d:a;f=e-(a<<3)|0;v[k+44>>2]=f;a=d-a|0;d=q+a|0;v[k+48>>2]=d;l=w[d|0]|w[d+1|0]<<8|(w[d+2|0]<<16|w[d+3|0]<<24)}v[m+40>>2]=l;g=a;j=a;h=a;i=a;d=a}if((c|0)==(D|0)){e=f;c=D;break T}e=(o<<3)+R|0;m=v[e+4>>2];o=v[e>>2];e=m;T=(e&65535)<<16|o>>>16;J=T&255;m=(u<<3)+V|0;s=v[m+4>>2];r=v[m>>2];m=s;U=(m&65535)<<16|r>>>16;P=U&255;s=(z<<3)+S|0;A=v[s+4>>2];s=v[s>>2];u=A;M=u;A=m;z=e;m=(u&65535)<<16|s>>>16;e=m&255;Z:{if(e>>>0>=2){_:{if(e>>>0>24&n){u=e;m=32-f|0;e=e>>>0<m>>>0?e:m;u=u-e|0;m=l<<f>>>0-e<<u;f=e+f|0;$:{if(f>>>0>32){break $}aa:{if((h|0)>=4){a=h-(f>>>3|0)|0;v[k+48>>2]=q+a;f=f&7;break aa}if(!h){h=0;i=0;d=0;break $}a=f>>>3|0;d=q>>>0>(h+q|0)-a>>>0?h:a;a=h-d|0;v[k+48>>2]=q+a;f=f-(d<<3)|0}d=a+q|0;l=w[d|0]|w[d+1|0]<<8|(w[d+2|0]<<16|w[d+3|0]<<24);v[k+40>>2]=l;g=a;j=a;h=a;i=a;d=a}m=m+M|0;if(!u){e=f;break _}e=f+u|0;v[k+44>>2]=e;m=(l<<f>>>0-u|0)+m|0;break _}m=M+(l<<f>>>0-m|0)|0;f=e+f|0;if(f>>>0>32){e=f;break _}d=k;ba:{if((i|0)>=4){e=f&7;v[k+44>>2]=e;a=i-(f>>>3|0)|0;f=q+a|0;v[k+48>>2]=f;l=w[f|0]|w[f+1|0]<<8|(w[f+2|0]<<16|w[f+3|0]<<24);break ba}if(!i){i=0;e=f;d=0;break _}a=f>>>3|0;a=q>>>0>(i+q|0)-a>>>0?i:a;e=f-(a<<3)|0;v[k+44>>2]=e;a=i-a|0;f=q+a|0;v[k+48>>2]=f;l=w[f|0]|w[f+1|0]<<8|(w[f+2|0]<<16|w[f+3|0]<<24)}v[d+40>>2]=l;g=a;j=a;h=a;i=a;d=a}f=v[k+88>>2];u=v[k+84>>2];v[k+84>>2]=m;v[k+88>>2]=u;v[k+92>>2]=f;break Z}if(!e){if(z){m=v[k+84>>2];e=f;break Z}m=v[k+88>>2];v[k+88>>2]=v[k+84>>2];v[k+84>>2]=m;e=f;break Z}e=f+1|0;v[k+44>>2]=e;f=M+(!z+(l<<f>>>31|0)|0)|0;ca:{da:{if((f|0)==3){f=v[k+84>>2]-1|0;m=!f+f|0;break da}m=v[((f<<2)+k|0)+84>>2];m=!m+m|0;if((f|0)==1){break ca}}v[k+92>>2]=v[k+88>>2]}v[k+88>>2]=v[k+84>>2];v[k+84>>2]=m}f=A;if(P){f=(l<<e>>>0-U|0)+f|0;e=e+P|0}ea:{if(J+P>>>0<20|e>>>0>32){break ea}d=k;fa:{if((j|0)>=4){a=j-(e>>>3|0)|0;v[k+48>>2]=q+a;e=e&7;break fa}if(!j){j=0;h=0;i=0;d=0;break ea}a=e>>>3|0;g=q>>>0>(j+q|0)-a>>>0?j:a;a=j-g|0;v[k+48>>2]=q+a;e=e-(g<<3)|0}v[d+44>>2]=e;d=a+q|0;l=w[d|0]|w[d+1|0]<<8|(w[d+2|0]<<16|w[d+3|0]<<24);v[k+40>>2]=l;g=a;j=a;h=a;i=a;d=a}u=r>>>24|0;A=o>>>24|0;if(J){z=(l<<e>>>0-T|0)+z|0;e=e+J|0}ga:{if(e>>>0>32){break ga}ha:{if((g|0)>=4){a=g-(e>>>3|0)|0;v[k+48>>2]=q+a;e=e&7;break ha}if(!g){g=0;j=0;h=0;i=0;d=0;break ga}a=e>>>3|0;d=q>>>0>(g+q|0)-a>>>0?g:a;a=g-d|0;v[k+48>>2]=q+a;e=e-(d<<3)|0}d=a+q|0;l=w[d|0]|w[d+1|0]<<8|(w[d+2|0]<<16|w[d+3|0]<<24);v[k+40>>2]=l;g=a;j=a;h=a;i=a;d=a}J=z+N|0;N=J+f|0;v[k+104>>2]=N;e=e+A|0;o=(v[(A<<2)+4592>>2]&l>>>0-e)+(o&65535)|0;v[k+60>>2]=o;e=e+u|0;u=(v[(u<<2)+4592>>2]&l>>>0-e)+(r&65535)|0;v[k+76>>2]=u;A=(J+(m>>>0>J>>>0?I:C)|0)-m|0;ia:{if(e>>>0>32){break ia}ja:{if((a|0)>=4){a=a-(e>>>3|0)|0;v[k+48>>2]=q+a;e=e&7;break ja}if(!a){a=0;g=0;j=0;h=0;i=0;d=0;break ia}d=e>>>3|0;d=q>>>0>(a+q|0)-d>>>0?a:d;a=a-d|0;v[k+48>>2]=q+a;e=e-(d<<3)|0}d=a+q|0;l=w[d|0]|w[d+1|0]<<8|(w[d+2|0]<<16|w[d+3|0]<<24);v[k+40>>2]=l;g=a;j=a;h=a;i=a;d=a}r=(k+112|0)+(c<<4)|0;v[r+12>>2]=A;v[r+8>>2]=m;v[r+4>>2]=f;v[r>>2]=z;f=s>>>24|0;e=f+e|0;v[k+44>>2]=e;z=(v[(f<<2)+4592>>2]&l>>>0-e)+(s&65535)|0;v[k+68>>2]=z;c=c+1|0;if(e>>>0<=32){continue}break}}if((c|0)<(O|0)){break a}}A=H-32|0;d=b;ka:{while(1){if(e>>>0>=33){if((c|0)<(F|0)){break a}break ka}a=v[k+48>>2];r=v[k+56>>2];la:{if(a>>>0>=r>>>0){f=e&7;v[k+44>>2]=f;a=a-(e>>>3|0)|0;v[k+48>>2]=a;v[k+40>>2]=w[a|0]|w[a+1|0]<<8|(w[a+2|0]<<16|w[a+3|0]<<24);break la}f=v[k+52>>2];if((f|0)==(a|0)){f=e;break la}g=e>>>3|0;f=f>>>0>a-g>>>0?a-f|0:g;a=a-f|0;v[k+48>>2]=a;f=e-(f<<3)|0;v[k+44>>2]=f;v[k+40>>2]=w[a|0]|w[a+1|0]<<8|(w[a+2|0]<<16|w[a+3|0]<<24)}if((c|0)>=(F|0)){break ka}e=v[k+64>>2]+(v[k+60>>2]<<3)|0;j=v[e+4>>2];g=v[e>>2];e=j;q=(e&65535)<<16|g>>>16;s=q&255;j=v[k+80>>2]+(v[k+76>>2]<<3)|0;h=v[j+4>>2];j=v[j>>2];i=h;J=(h&65535)<<16|j>>>16;u=J&255;h=v[k+72>>2]+(v[k+68>>2]<<3)|0;m=v[h+4>>2];h=v[h>>2];l=m;D=l;m=i;z=e;i=(l&65535)<<16|h>>>16;e=i&255;ma:{if(e>>>0>=2){na:{if(e>>>0>24&n){l=e;i=32-f|0;e=e>>>0<i>>>0?e:i;l=l-e|0;o=v[k+40>>2];i=o<<f>>>0-e<<l;f=e+f|0;oa:{if(f>>>0>32){break oa}pa:{if(a>>>0>=r>>>0){a=a-(f>>>3|0)|0;v[k+48>>2]=a;f=f&7;break pa}e=v[k+52>>2];if((e|0)==(a|0)){break oa}o=f>>>3|0;e=e>>>0>a-o>>>0?a-e|0:o;a=a-e|0;v[k+48>>2]=a;f=f-(e<<3)|0}o=w[a|0]|w[a+1|0]<<8|(w[a+2|0]<<16|w[a+3|0]<<24);v[k+40>>2]=o}i=i+D|0;if(!l){e=f;break na}e=f+l|0;v[k+44>>2]=e;i=(o<<f>>>0-l|0)+i|0;break na}i=D+(v[k+40>>2]<<f>>>0-i|0)|0;f=e+f|0;if(f>>>0>32){e=f;break na}if(a>>>0>=r>>>0){e=f&7;v[k+44>>2]=e;a=a-(f>>>3|0)|0;v[k+48>>2]=a;v[k+40>>2]=w[a|0]|w[a+1|0]<<8|(w[a+2|0]<<16|w[a+3|0]<<24);break na}e=v[k+52>>2];if((e|0)==(a|0)){e=f;break na}l=f>>>3|0;e=e>>>0>a-l>>>0?a-e|0:l;a=a-e|0;v[k+48>>2]=a;e=f-(e<<3)|0;v[k+44>>2]=e;v[k+40>>2]=w[a|0]|w[a+1|0]<<8|(w[a+2|0]<<16|w[a+3|0]<<24)}f=v[k+88>>2];l=v[k+84>>2];v[k+84>>2]=i;v[k+88>>2]=l;v[k+92>>2]=f;break ma}if(!e){if(z){i=v[k+84>>2];e=f;break ma}i=v[k+88>>2];v[k+88>>2]=v[k+84>>2];v[k+84>>2]=i;e=f;break ma}e=f+1|0;v[k+44>>2]=e;f=D+!z+(v[k+40>>2]<<f>>>31)|0;qa:{ra:{if((f|0)==3){f=v[k+84>>2]-1|0;i=!f+f|0;break ra}i=v[((f<<2)+k|0)+84>>2];i=!i+i|0;if((f|0)==1){break qa}}v[k+92>>2]=v[k+88>>2]}v[k+88>>2]=v[k+84>>2];v[k+84>>2]=i}f=m;if(u){f=(v[k+40>>2]<<e>>>0-J|0)+f|0;e=e+u|0}sa:{if(s+u>>>0<20|e>>>0>32){break sa}l=k;ta:{if(a>>>0>=r>>>0){a=a-(e>>>3|0)|0;v[k+48>>2]=a;e=e&7;break ta}m=v[k+52>>2];if((m|0)==(a|0)){break sa}o=e>>>3|0;m=m>>>0>a-o>>>0?a-m|0:o;a=a-m|0;v[k+48>>2]=a;e=e-(m<<3)|0}v[l+44>>2]=e;v[k+40>>2]=w[a|0]|w[a+1|0]<<8|(w[a+2|0]<<16|w[a+3|0]<<24)}m=j>>>24|0;o=g>>>24|0;if(s){z=(v[k+40>>2]<<e>>>0-q|0)+z|0;e=e+s|0}ua:{if(e>>>0>32){break ua}va:{if(a>>>0>=r>>>0){a=a-(e>>>3|0)|0;v[k+48>>2]=a;e=e&7;break va}l=v[k+52>>2];if((l|0)==(a|0)){break ua}s=e>>>3|0;l=l>>>0>a-s>>>0?a-l|0:s;a=a-l|0;v[k+48>>2]=a;e=e-(l<<3)|0}v[k+40>>2]=w[a|0]|w[a+1|0]<<8|(w[a+2|0]<<16|w[a+3|0]<<24)}u=v[k+104>>2]+z|0;v[k+104>>2]=u+f;l=v[k+40>>2];e=e+o|0;v[k+60>>2]=(v[(o<<2)+4592>>2]&l>>>0-e)+(g&65535);e=e+m|0;v[k+76>>2]=(v[(m<<2)+4592>>2]&l>>>0-e)+(j&65535);D=v[(k+40|0)+(i>>>0>u>>>0?60:56)>>2];wa:{if(e>>>0>32){break wa}xa:{if(a>>>0>=r>>>0){a=a-(e>>>3|0)|0;v[k+48>>2]=a;e=e&7;break xa}g=v[k+52>>2];if((g|0)==(a|0)){break wa}j=e>>>3|0;g=g>>>0>a-j>>>0?a-g|0:j;a=a-g|0;v[k+48>>2]=a;e=e-(g<<3)|0}l=w[a|0]|w[a+1|0]<<8|(w[a+2|0]<<16|w[a+3|0]<<24);v[k+40>>2]=l}a=h>>>24|0;e=a+e|0;v[k+44>>2]=e;v[k+68>>2]=(v[(a<<2)+4592>>2]&l>>>0-e)+(h&65535);ya:{za:{h=v[k+188>>2];l=(k+112|0)+((c&3)<<4)|0;r=v[l>>2];q=h+r|0;Aa:{if(q>>>0>K>>>0){break Aa}g=v[l+4>>2];j=r+g|0;if(A>>>0<j+d>>>0){break Aa}if(j+32>>>0<=H-d>>>0){break za}}a=v[l+12>>2];v[k+24>>2]=v[l+8>>2];v[k+28>>2]=a;a=v[l+4>>2];v[k+16>>2]=v[l>>2];v[k+20>>2]=a;j=ha(d,H,k+16|0,k+188|0,K,C,L,I);break ya}a=d+r|0;m=v[l+8>>2];e=h;o=w[e+4|0]|w[e+5|0]<<8|(w[e+6|0]<<16|w[e+7|0]<<24);s=w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24);t[d|0]=s;t[d+1|0]=s>>>8;t[d+2|0]=s>>>16;t[d+3|0]=s>>>24;t[d+4|0]=o;t[d+5|0]=o>>>8;t[d+6|0]=o>>>16;t[d+7|0]=o>>>24;o=w[e+12|0]|w[e+13|0]<<8|(w[e+14|0]<<16|w[e+15|0]<<24);e=w[e+8|0]|w[e+9|0]<<8|(w[e+10|0]<<16|w[e+11|0]<<24);t[d+8|0]=e;t[d+9|0]=e>>>8;t[d+10|0]=e>>>16;t[d+11|0]=e>>>24;t[d+12|0]=o;t[d+13|0]=o>>>8;t[d+14|0]=o>>>16;t[d+15|0]=o>>>24;if(r>>>0>=17){e=d+16|0;while(1){o=w[h+20|0]|w[h+21|0]<<8|(w[h+22|0]<<16|w[h+23|0]<<24);r=w[h+16|0]|w[h+17|0]<<8|(w[h+18|0]<<16|w[h+19|0]<<24);t[e|0]=r;t[e+1|0]=r>>>8;t[e+2|0]=r>>>16;t[e+3|0]=r>>>24;t[e+4|0]=o;t[e+5|0]=o>>>8;t[e+6|0]=o>>>16;t[e+7|0]=o>>>24;o=w[h+28|0]|w[h+29|0]<<8|(w[h+30|0]<<16|w[h+31|0]<<24);r=w[h+24|0]|w[h+25|0]<<8|(w[h+26|0]<<16|w[h+27|0]<<24);t[e+8|0]=r;t[e+9|0]=r>>>8;t[e+10|0]=r>>>16;t[e+11|0]=r>>>24;t[e+12|0]=o;t[e+13|0]=o>>>8;t[e+14|0]=o>>>16;t[e+15|0]=o>>>24;h=h+16|0;e=e+16|0;if(e>>>0<a>>>0){continue}break}}e=a-m|0;v[k+188>>2]=q;if(m>>>0>a-C>>>0){if(m>>>0>a-L>>>0){break a}e=e-C|0;h=e+I|0;if(I>>>0>=h+g>>>0){Z(a,h,g);break ya}g=e+g|0;a=Z(a,h,0-e|0)-e|0;e=C}if(m>>>0>=16){m=a+g|0;while(1){g=w[e+4|0]|w[e+5|0]<<8|(w[e+6|0]<<16|w[e+7|0]<<24);h=w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24);t[a|0]=h;t[a+1|0]=h>>>8;t[a+2|0]=h>>>16;t[a+3|0]=h>>>24;t[a+4|0]=g;t[a+5|0]=g>>>8;t[a+6|0]=g>>>16;t[a+7|0]=g>>>24;g=w[e+12|0]|w[e+13|0]<<8|(w[e+14|0]<<16|w[e+15|0]<<24);h=w[e+8|0]|w[e+9|0]<<8|(w[e+10|0]<<16|w[e+11|0]<<24);t[a+8|0]=h;t[a+9|0]=h>>>8;t[a+10|0]=h>>>16;t[a+11|0]=h>>>24;t[a+12|0]=g;t[a+13|0]=g>>>8;t[a+14|0]=g>>>16;t[a+15|0]=g>>>24;e=e+16|0;a=a+16|0;if(m>>>0>a>>>0){continue}break}break ya}Ba:{if(m>>>0<=7){t[a|0]=w[e|0];t[a+1|0]=w[e+1|0];t[a+2|0]=w[e+2|0];t[a+3|0]=w[e+3|0];m=m<<2;e=v[m+4752>>2]+e|0;h=w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24);t[a+4|0]=h;t[a+5|0]=h>>>8;t[a+6|0]=h>>>16;t[a+7|0]=h>>>24;e=e-v[m+4784>>2]|0;break Ba}h=w[e+4|0]|w[e+5|0]<<8|(w[e+6|0]<<16|w[e+7|0]<<24);m=w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24);t[a|0]=m;t[a+1|0]=m>>>8;t[a+2|0]=m>>>16;t[a+3|0]=m>>>24;t[a+4|0]=h;t[a+5|0]=h>>>8;t[a+6|0]=h>>>16;t[a+7|0]=h>>>24}if(g>>>0<9){break ya}m=a+g|0;a=a+8|0;e=e+8|0;if((a-e|0)<=15){while(1){g=w[e+4|0]|w[e+5|0]<<8|(w[e+6|0]<<16|w[e+7|0]<<24);h=w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24);t[a|0]=h;t[a+1|0]=h>>>8;t[a+2|0]=h>>>16;t[a+3|0]=h>>>24;t[a+4|0]=g;t[a+5|0]=g>>>8;t[a+6|0]=g>>>16;t[a+7|0]=g>>>24;e=e+8|0;a=a+8|0;if(m>>>0>a>>>0){continue}break ya}}while(1){g=w[e+4|0]|w[e+5|0]<<8|(w[e+6|0]<<16|w[e+7|0]<<24);h=w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24);t[a|0]=h;t[a+1|0]=h>>>8;t[a+2|0]=h>>>16;t[a+3|0]=h>>>24;t[a+4|0]=g;t[a+5|0]=g>>>8;t[a+6|0]=g>>>16;t[a+7|0]=g>>>24;g=w[e+12|0]|w[e+13|0]<<8|(w[e+14|0]<<16|w[e+15|0]<<24);h=w[e+8|0]|w[e+9|0]<<8|(w[e+10|0]<<16|w[e+11|0]<<24);t[a+8|0]=h;t[a+9|0]=h>>>8;t[a+10|0]=h>>>16;t[a+11|0]=h>>>24;t[a+12|0]=g;t[a+13|0]=g>>>8;t[a+14|0]=g>>>16;t[a+15|0]=g>>>24;e=e+16|0;a=a+16|0;if(m>>>0>a>>>0){continue}break}}if(j>>>0<=4294967176){v[l>>2]=z;v[(l|4)>>2]=f;v[(l|8)>>2]=i;v[l+12>>2]=(u+D|0)-i;c=c+1|0;d=d+j|0;e=v[k+44>>2];continue}break}p=j;break a}i=c-O|0;if((F|0)>(i|0)){n=H-32|0;while(1){Ca:{Da:{m=v[k+188>>2];e=(k+112|0)+((i&3)<<4)|0;j=v[e>>2];l=m+j|0;Ea:{if(l>>>0>K>>>0){break Ea}z=v[e+4>>2];c=j+z|0;if(n>>>0<d+c>>>0){break Ea}if(c+32>>>0<=H-d>>>0){break Da}}a=v[e+12>>2];v[k+8>>2]=v[e+8>>2];v[k+12>>2]=a;a=v[e+4>>2];v[k>>2]=v[e>>2];v[k+4>>2]=a;c=ha(d,H,k,k+188|0,K,C,L,I);break Ca}a=d+j|0;f=v[e+8>>2];e=m;g=w[e+4|0]|w[e+5|0]<<8|(w[e+6|0]<<16|w[e+7|0]<<24);h=w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24);t[d|0]=h;t[d+1|0]=h>>>8;t[d+2|0]=h>>>16;t[d+3|0]=h>>>24;t[d+4|0]=g;t[d+5|0]=g>>>8;t[d+6|0]=g>>>16;t[d+7|0]=g>>>24;g=w[e+12|0]|w[e+13|0]<<8|(w[e+14|0]<<16|w[e+15|0]<<24);e=w[e+8|0]|w[e+9|0]<<8|(w[e+10|0]<<16|w[e+11|0]<<24);t[d+8|0]=e;t[d+9|0]=e>>>8;t[d+10|0]=e>>>16;t[d+11|0]=e>>>24;t[d+12|0]=g;t[d+13|0]=g>>>8;t[d+14|0]=g>>>16;t[d+15|0]=g>>>24;if(j>>>0>=17){e=d+16|0;while(1){g=w[m+20|0]|w[m+21|0]<<8|(w[m+22|0]<<16|w[m+23|0]<<24);j=w[m+16|0]|w[m+17|0]<<8|(w[m+18|0]<<16|w[m+19|0]<<24);t[e|0]=j;t[e+1|0]=j>>>8;t[e+2|0]=j>>>16;t[e+3|0]=j>>>24;t[e+4|0]=g;t[e+5|0]=g>>>8;t[e+6|0]=g>>>16;t[e+7|0]=g>>>24;g=w[m+28|0]|w[m+29|0]<<8|(w[m+30|0]<<16|w[m+31|0]<<24);j=w[m+24|0]|w[m+25|0]<<8|(w[m+26|0]<<16|w[m+27|0]<<24);t[e+8|0]=j;t[e+9|0]=j>>>8;t[e+10|0]=j>>>16;t[e+11|0]=j>>>24;t[e+12|0]=g;t[e+13|0]=g>>>8;t[e+14|0]=g>>>16;t[e+15|0]=g>>>24;m=m+16|0;e=e+16|0;if(e>>>0<a>>>0){continue}break}}e=a-f|0;v[k+188>>2]=l;if(f>>>0>a-C>>>0){if(f>>>0>a-L>>>0){break a}e=e-C|0;g=e+I|0;if(I>>>0>=g+z>>>0){Z(a,g,z);break Ca}z=e+z|0;a=Z(a,g,0-e|0)-e|0;e=C}if(f>>>0>=16){j=a+z|0;while(1){f=w[e+4|0]|w[e+5|0]<<8|(w[e+6|0]<<16|w[e+7|0]<<24);g=w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24);t[a|0]=g;t[a+1|0]=g>>>8;t[a+2|0]=g>>>16;t[a+3|0]=g>>>24;t[a+4|0]=f;t[a+5|0]=f>>>8;t[a+6|0]=f>>>16;t[a+7|0]=f>>>24;f=w[e+12|0]|w[e+13|0]<<8|(w[e+14|0]<<16|w[e+15|0]<<24);g=w[e+8|0]|w[e+9|0]<<8|(w[e+10|0]<<16|w[e+11|0]<<24);t[a+8|0]=g;t[a+9|0]=g>>>8;t[a+10|0]=g>>>16;t[a+11|0]=g>>>24;t[a+12|0]=f;t[a+13|0]=f>>>8;t[a+14|0]=f>>>16;t[a+15|0]=f>>>24;e=e+16|0;a=a+16|0;if(j>>>0>a>>>0){continue}break}break Ca}Fa:{if(f>>>0<=7){t[a|0]=w[e|0];t[a+1|0]=w[e+1|0];t[a+2|0]=w[e+2|0];t[a+3|0]=w[e+3|0];g=f<<2;e=v[g+4752>>2]+e|0;f=w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24);t[a+4|0]=f;t[a+5|0]=f>>>8;t[a+6|0]=f>>>16;t[a+7|0]=f>>>24;e=e-v[g+4784>>2]|0;break Fa}f=w[e+4|0]|w[e+5|0]<<8|(w[e+6|0]<<16|w[e+7|0]<<24);g=w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24);t[a|0]=g;t[a+1|0]=g>>>8;t[a+2|0]=g>>>16;t[a+3|0]=g>>>24;t[a+4|0]=f;t[a+5|0]=f>>>8;t[a+6|0]=f>>>16;t[a+7|0]=f>>>24}if(z>>>0<9){break Ca}j=a+z|0;a=a+8|0;e=e+8|0;if((a-e|0)<=15){while(1){f=w[e+4|0]|w[e+5|0]<<8|(w[e+6|0]<<16|w[e+7|0]<<24);g=w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24);t[a|0]=g;t[a+1|0]=g>>>8;t[a+2|0]=g>>>16;t[a+3|0]=g>>>24;t[a+4|0]=f;t[a+5|0]=f>>>8;t[a+6|0]=f>>>16;t[a+7|0]=f>>>24;e=e+8|0;a=a+8|0;if(j>>>0>a>>>0){continue}break Ca}}while(1){f=w[e+4|0]|w[e+5|0]<<8|(w[e+6|0]<<16|w[e+7|0]<<24);g=w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24);t[a|0]=g;t[a+1|0]=g>>>8;t[a+2|0]=g>>>16;t[a+3|0]=g>>>24;t[a+4|0]=f;t[a+5|0]=f>>>8;t[a+6|0]=f>>>16;t[a+7|0]=f>>>24;f=w[e+12|0]|w[e+13|0]<<8|(w[e+14|0]<<16|w[e+15|0]<<24);g=w[e+8|0]|w[e+9|0]<<8|(w[e+10|0]<<16|w[e+11|0]<<24);t[a+8|0]=g;t[a+9|0]=g>>>8;t[a+10|0]=g>>>16;t[a+11|0]=g>>>24;t[a+12|0]=f;t[a+13|0]=f>>>8;t[a+14|0]=f>>>16;t[a+15|0]=f>>>24;e=e+16|0;a=a+16|0;if(j>>>0>a>>>0){continue}break}}if(c>>>0>4294967176){p=c;break a}d=c+d|0;i=i+1|0;if((F|0)!=(i|0)){continue}break}}c=v[k+88>>2];a=G;v[a>>2]=v[k+84>>2];v[a+4>>2]=c;v[a+8>>2]=v[k+92>>2];e=v[k+188>>2]}p=-70;a=K-e|0;if(a>>>0>H-d>>>0){break a}if(d){a=X(d,e,a)+a|0}else{a=0}p=a-b|0;break a}v[a+28956>>2]=0}m=h;n=0;h=Q-112|0;Q=h;f=a;e=v[a+28912>>2];v[h+92>>2]=e;d=b;r=d+c|0;u=v[a+28928>>2]+e|0;Ga:{Ha:{if(!F){c=d;break Ha}D=v[f+28740>>2];z=v[f+28736>>2];l=v[f+28732>>2];v[f+28812>>2]=1;v[h+76>>2]=v[f+26676>>2];C=f+26668|0;a=C;b=v[a+4>>2];v[h+68>>2]=v[a>>2];v[h+72>>2]=b;if(!g){f=-20;break Ga}v[h+36>>2]=q;v[h+40>>2]=q+4;Ia:{Ja:{if(g>>>0>=4){n=g-4|0;a=q+n|0;v[h+32>>2]=a;j=w[a|0]|w[a+1|0]<<8|(w[a+2|0]<<16|w[a+3|0]<<24);v[h+24>>2]=j;if(j>>>0>=16777216){break Ja}f=-20;break Ga}v[h+32>>2]=q;j=w[q|0];v[h+24>>2]=j;Ka:{switch(g-2|0){case 1:j=w[q+2|0]<<16|j;case 0:j=(w[q+1|0]<<8)+j|0;v[h+24>>2]=j;break;default:break Ka}}a=w[(g+q|0)-1|0];if(!a){f=-20;break Ga}g=(E(a)-(g<<3)|0)+9|0;v[h+28>>2]=g;break Ia}if(g>>>0>4294967176){f=-20;break Ga}g=E(j>>>24|0)-23|0}c=v[f>>2];a=v[c+4>>2];g=a+g|0;a=j>>>0-g&v[(a<<2)+4592>>2];v[h+44>>2]=a;La:{if(g>>>0>32){break La}Ma:{if((n|0)>=4){n=n-(g>>>3|0)|0;v[h+32>>2]=q+n;g=g&7;break Ma}if(!n){n=0;break La}b=g>>>3|0;b=q>>>0>(n+q|0)-b>>>0?n:b;n=n-b|0;v[h+32>>2]=q+n;g=g-(b<<3)|0}b=n+q|0;j=w[b|0]|w[b+1|0]<<8|(w[b+2|0]<<16|w[b+3|0]<<24);v[h+24>>2]=j}e=c+8|0;v[h+48>>2]=e;c=v[f+8>>2];b=v[c+4>>2];i=b+g|0;g=j>>>0-i&v[(b<<2)+4592>>2];v[h+52>>2]=g;Na:{if(i>>>0>32){break Na}Oa:{if((n|0)>=4){n=n-(i>>>3|0)|0;v[h+32>>2]=q+n;i=i&7;break Oa}if(!n){n=0;break Na}b=i>>>3|0;b=q>>>0>(n+q|0)-b>>>0?n:b;n=n-b|0;v[h+32>>2]=q+n;i=i-(b<<3)|0}b=n+q|0;j=w[b|0]|w[b+1|0]<<8|(w[b+2|0]<<16|w[b+3|0]<<24);v[h+24>>2]=j}o=c+8|0;v[h+56>>2]=o;p=v[f+4>>2];c=v[p+4>>2];b=c+i|0;v[h+28>>2]=b;i=v[(c<<2)+4592>>2]&j>>>0-b;v[h+60>>2]=i;Pa:{if(b>>>0>32){break Pa}c=n+q|0;f=h;Qa:{if((n|0)>=4){c=c-(b>>>3|0)|0;v[h+32>>2]=c;b=b&7;break Qa}if(!n){break Pa}j=b>>>3|0;j=q>>>0>c-j>>>0?n:j;c=c-j|0;v[h+32>>2]=c;b=b-(j<<3)|0}v[f+28>>2]=b;v[h+24>>2]=w[c|0]|w[c+1|0]<<8|(w[c+2|0]<<16|w[c+3|0]<<24)}n=p+8|0;v[h- -64>>2]=n;I=r-32|0;c=d;f=0;while(1){a=(a<<3)+e|0;e=v[a+4>>2];j=v[a>>2];a=e;H=(a&65535)<<16|j>>>16;A=H&255;e=(i<<3)+n|0;i=v[e+4>>2];p=v[e>>2];e=i;K=(e&65535)<<16|p>>>16;G=K&255;g=(g<<3)+o|0;i=v[g+4>>2];n=v[g>>2];q=i;o=e;e=a;g=(i&65535)<<16|n>>>16;a=g&255;Ra:{if(a>>>0>=2){Sa:{if(!(!m|a>>>0<25)){i=a;g=32-b|0;a=a>>>0<g>>>0?a:g;s=i-a|0;i=v[h+24>>2];L=i<<b>>>0-a<<s;a=a+b|0;Ta:{if(a>>>0>32){break Ta}b=v[h+32>>2];Ua:{if(b>>>0>=y[h+40>>2]){b=b-(a>>>3|0)|0;v[h+32>>2]=b;a=a&7;break Ua}g=v[h+36>>2];if((g|0)==(b|0)){break Ta}i=a>>>3|0;g=g>>>0>b-i>>>0?b-g|0:i;b=b-g|0;v[h+32>>2]=b;a=a-(g<<3)|0}i=w[b|0]|w[b+1|0]<<8|(w[b+2|0]<<16|w[b+3|0]<<24);v[h+24>>2]=i}g=q+L|0;if(!s){break Sa}g=(i<<a>>>0-s|0)+g|0;a=a+s|0;break Sa}g=q+(v[h+24>>2]<<b>>>0-g|0)|0;b=a+b|0;if(b>>>0>32){a=b;break Sa}i=v[h+32>>2];if(i>>>0>=y[h+40>>2]){a=b&7;v[h+28>>2]=a;b=i-(b>>>3|0)|0;v[h+32>>2]=b;v[h+24>>2]=w[b|0]|w[b+1|0]<<8|(w[b+2|0]<<16|w[b+3|0]<<24);break Sa}a=v[h+36>>2];if((a|0)==(i|0)){a=b;break Sa}M=b;b=b>>>3|0;b=a>>>0>i-b>>>0?i-a|0:b;a=M-(b<<3)|0;v[h+28>>2]=a;b=i-b|0;v[h+32>>2]=b;v[h+24>>2]=w[b|0]|w[b+1|0]<<8|(w[b+2|0]<<16|w[b+3|0]<<24)}b=v[h+72>>2];i=v[h+68>>2];v[h+68>>2]=g;v[h+72>>2]=i;v[h+76>>2]=b;break Ra}if(!a){if(e){g=v[h+68>>2];a=b;break Ra}g=v[h+72>>2];v[h+72>>2]=v[h+68>>2];v[h+68>>2]=g;a=b;break Ra}a=b+1|0;v[h+28>>2]=a;b=q+!e+(v[h+24>>2]<<b>>>31)|0;Va:{Wa:{if((b|0)==3){b=v[h+68>>2]-1|0;g=!b+b|0;break Wa}g=v[(h+(b<<2)|0)+68>>2];g=!g+g|0;if((b|0)==1){break Va}}v[h+76>>2]=v[h+72>>2]}v[h+72>>2]=v[h+68>>2];v[h+68>>2]=g}b=o;if(G){b=(v[h+24>>2]<<a>>>0-K|0)+b|0;a=a+G|0}Xa:{if(A+G>>>0<20|a>>>0>32){break Xa}o=h;i=v[h+32>>2];Ya:{if(i>>>0>=y[h+40>>2]){i=i-(a>>>3|0)|0;v[h+32>>2]=i;a=a&7;break Ya}s=v[h+36>>2];if((s|0)==(i|0)){break Xa}G=a>>>3|0;s=s>>>0>i-G>>>0?i-s|0:G;i=i-s|0;v[h+32>>2]=i;a=a-(s<<3)|0}v[o+28>>2]=a;v[h+24>>2]=w[i|0]|w[i+1|0]<<8|(w[i+2|0]<<16|w[i+3|0]<<24)}o=p>>>24|0;i=j;s=i>>>24|0;if(A){e=(v[h+24>>2]<<a>>>0-H|0)+e|0;a=a+A|0}Za:{if(a>>>0>32){break Za}j=v[h+32>>2];_a:{if(j>>>0>=y[h+40>>2]){j=j-(a>>>3|0)|0;v[h+32>>2]=j;a=a&7;break _a}A=v[h+36>>2];if((A|0)==(j|0)){break Za}G=a>>>3|0;A=A>>>0>j-G>>>0?j-A|0:G;j=j-A|0;v[h+32>>2]=j;a=a-(A<<3)|0}v[h+24>>2]=w[j|0]|w[j+1|0]<<8|(w[j+2|0]<<16|w[j+3|0]<<24)}j=v[h+24>>2];a=a+s|0;v[h+44>>2]=(v[(s<<2)+4592>>2]&j>>>0-a)+(i&65535);a=a+o|0;v[h+60>>2]=(v[(o<<2)+4592>>2]&j>>>0-a)+(p&65535);$a:{if(a>>>0>32){break $a}i=v[h+32>>2];ab:{if(i>>>0>=y[h+40>>2]){j=i-(a>>>3|0)|0;v[h+32>>2]=j;a=a&7;break ab}p=v[h+36>>2];if((p|0)==(i|0)){break $a}A=i;j=a>>>3|0;i=p>>>0>i-j>>>0?i-p|0:j;j=A-i|0;v[h+32>>2]=j;a=a-(i<<3)|0}j=w[j|0]|w[j+1|0]<<8|(w[j+2|0]<<16|w[j+3|0]<<24);v[h+24>>2]=j}i=a;a=n>>>24|0;i=i+a|0;v[h+28>>2]=i;v[h+52>>2]=(v[(a<<2)+4592>>2]&j>>>0-i)+(n&65535);v[h+96>>2]=e;v[h+100>>2]=b;v[h+104>>2]=g;bb:{cb:{i=v[h+92>>2];o=i+e|0;db:{if(o>>>0>u>>>0){break db}j=b+e|0;if(I>>>0<j+c>>>0){break db}if(j+32>>>0<=r-c>>>0){break cb}}a=v[h+108>>2];v[h+16>>2]=v[h+104>>2];v[h+20>>2]=a;a=v[h+100>>2];v[h+8>>2]=v[h+96>>2];v[h+12>>2]=a;j=ha(c,r,h+8|0,h+92|0,u,l,z,D);break bb}a=c+e|0;p=w[i+4|0]|w[i+5|0]<<8|(w[i+6|0]<<16|w[i+7|0]<<24);n=w[i|0]|w[i+1|0]<<8|(w[i+2|0]<<16|w[i+3|0]<<24);t[c|0]=n;t[c+1|0]=n>>>8;t[c+2|0]=n>>>16;t[c+3|0]=n>>>24;t[c+4|0]=p;t[c+5|0]=p>>>8;t[c+6|0]=p>>>16;t[c+7|0]=p>>>24;p=w[i+12|0]|w[i+13|0]<<8|(w[i+14|0]<<16|w[i+15|0]<<24);n=w[i+8|0]|w[i+9|0]<<8|(w[i+10|0]<<16|w[i+11|0]<<24);t[c+8|0]=n;t[c+9|0]=n>>>8;t[c+10|0]=n>>>16;t[c+11|0]=n>>>24;t[c+12|0]=p;t[c+13|0]=p>>>8;t[c+14|0]=p>>>16;t[c+15|0]=p>>>24;if(e>>>0>=17){e=c+16|0;while(1){p=w[i+20|0]|w[i+21|0]<<8|(w[i+22|0]<<16|w[i+23|0]<<24);n=w[i+16|0]|w[i+17|0]<<8|(w[i+18|0]<<16|w[i+19|0]<<24);t[e|0]=n;t[e+1|0]=n>>>8;t[e+2|0]=n>>>16;t[e+3|0]=n>>>24;t[e+4|0]=p;t[e+5|0]=p>>>8;t[e+6|0]=p>>>16;t[e+7|0]=p>>>24;p=w[i+28|0]|w[i+29|0]<<8|(w[i+30|0]<<16|w[i+31|0]<<24);n=w[i+24|0]|w[i+25|0]<<8|(w[i+26|0]<<16|w[i+27|0]<<24);t[e+8|0]=n;t[e+9|0]=n>>>8;t[e+10|0]=n>>>16;t[e+11|0]=n>>>24;t[e+12|0]=p;t[e+13|0]=p>>>8;t[e+14|0]=p>>>16;t[e+15|0]=p>>>24;i=i+16|0;e=e+16|0;if(e>>>0<a>>>0){continue}break}}e=a-g|0;v[h+92>>2]=o;if(a-l>>>0<g>>>0){if(a-z>>>0<g>>>0){j=-20;break bb}e=e-l|0;i=e+D|0;if(D>>>0>=i+b>>>0){Z(a,i,b);break bb}a=Z(a,i,0-e|0);b=b+e|0;v[h+100>>2]=b;a=a-e|0;e=l}if(g>>>0>=16){i=a+b|0;while(1){b=w[e+4|0]|w[e+5|0]<<8|(w[e+6|0]<<16|w[e+7|0]<<24);g=w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24);t[a|0]=g;t[a+1|0]=g>>>8;t[a+2|0]=g>>>16;t[a+3|0]=g>>>24;t[a+4|0]=b;t[a+5|0]=b>>>8;t[a+6|0]=b>>>16;t[a+7|0]=b>>>24;b=w[e+12|0]|w[e+13|0]<<8|(w[e+14|0]<<16|w[e+15|0]<<24);g=w[e+8|0]|w[e+9|0]<<8|(w[e+10|0]<<16|w[e+11|0]<<24);t[a+8|0]=g;t[a+9|0]=g>>>8;t[a+10|0]=g>>>16;t[a+11|0]=g>>>24;t[a+12|0]=b;t[a+13|0]=b>>>8;t[a+14|0]=b>>>16;t[a+15|0]=b>>>24;e=e+16|0;a=a+16|0;if(i>>>0>a>>>0){continue}break}break bb}eb:{if(g>>>0<=7){t[a|0]=w[e|0];t[a+1|0]=w[e+1|0];t[a+2|0]=w[e+2|0];t[a+3|0]=w[e+3|0];i=g<<2;e=v[i+4752>>2]+e|0;g=w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24);t[a+4|0]=g;t[a+5|0]=g>>>8;t[a+6|0]=g>>>16;t[a+7|0]=g>>>24;e=e-v[i+4784>>2]|0;break eb}g=w[e+4|0]|w[e+5|0]<<8|(w[e+6|0]<<16|w[e+7|0]<<24);i=w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24);t[a|0]=i;t[a+1|0]=i>>>8;t[a+2|0]=i>>>16;t[a+3|0]=i>>>24;t[a+4|0]=g;t[a+5|0]=g>>>8;t[a+6|0]=g>>>16;t[a+7|0]=g>>>24}if(b>>>0<9){break bb}i=a+b|0;a=a+8|0;e=e+8|0;if((a-e|0)<=15){while(1){b=w[e+4|0]|w[e+5|0]<<8|(w[e+6|0]<<16|w[e+7|0]<<24);g=w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24);t[a|0]=g;t[a+1|0]=g>>>8;t[a+2|0]=g>>>16;t[a+3|0]=g>>>24;t[a+4|0]=b;t[a+5|0]=b>>>8;t[a+6|0]=b>>>16;t[a+7|0]=b>>>24;e=e+8|0;a=a+8|0;if(i>>>0>a>>>0){continue}break bb}}while(1){b=w[e+4|0]|w[e+5|0]<<8|(w[e+6|0]<<16|w[e+7|0]<<24);g=w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24);t[a|0]=g;t[a+1|0]=g>>>8;t[a+2|0]=g>>>16;t[a+3|0]=g>>>24;t[a+4|0]=b;t[a+5|0]=b>>>8;t[a+6|0]=b>>>16;t[a+7|0]=b>>>24;b=w[e+12|0]|w[e+13|0]<<8|(w[e+14|0]<<16|w[e+15|0]<<24);g=w[e+8|0]|w[e+9|0]<<8|(w[e+10|0]<<16|w[e+11|0]<<24);t[a+8|0]=g;t[a+9|0]=g>>>8;t[a+10|0]=g>>>16;t[a+11|0]=g>>>24;t[a+12|0]=b;t[a+13|0]=b>>>8;t[a+14|0]=b>>>16;t[a+15|0]=b>>>24;e=e+16|0;a=a+16|0;if(i>>>0>a>>>0){continue}break}}a=v[h+28>>2];fb:{if(a>>>0>32){b=a;break fb}e=v[h+32>>2];if(e>>>0>=y[h+40>>2]){b=a&7;v[h+28>>2]=b;a=e-(a>>>3|0)|0;v[h+32>>2]=a;v[h+24>>2]=w[a|0]|w[a+1|0]<<8|(w[a+2|0]<<16|w[a+3|0]<<24);break fb}b=v[h+36>>2];if((b|0)==(e|0)){b=a;break fb}i=a;a=a>>>3|0;a=b>>>0>e-a>>>0?e-b|0:a;b=i-(a<<3)|0;v[h+28>>2]=b;a=e-a|0;v[h+32>>2]=a;v[h+24>>2]=w[a|0]|w[a+1|0]<<8|(w[a+2|0]<<16|w[a+3|0]<<24)}a=j>>>0<4294967177;f=a?f:j;c=(a?j:0)+c|0;F=F-1|0;if(F){g=v[h+52>>2];o=v[h+56>>2];i=v[h+60>>2];n=v[h+64>>2];a=v[h+44>>2];e=v[h+48>>2];continue}break}if(f>>>0>4294967176){break Ga}if(b>>>0<=32){a=v[h+32>>2];if(a>>>0>=y[h+40>>2]){f=-20;break Ga}if((a|0)!=v[h+36>>2]){f=-20;break Ga}f=-20;if((b|0)!=32){break Ga}}b=v[h+72>>2];a=C;v[a>>2]=v[h+68>>2];v[a+4>>2]=b;v[a+8>>2]=v[h+76>>2];e=v[h+92>>2]}f=-70;a=u-e|0;if(a>>>0>r-c>>>0){break Ga}if(c){a=X(c,e,a)+a|0}else{a=0}f=a-d|0}Q=h+112|0;p=f}Q=k+192|0;return p}function Aa(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,x=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,R=0,T=0,U=0,V=0,W=0,Z=0;u=Q-16|0;Q=u;i=v[c+8>>2];k=v[c+4>>2];a:{if(i>>>0>k>>>0){e=-72;break a}g=v[b+8>>2];f=v[b+4>>2];if(g>>>0>f>>>0){e=-70;break a}d=v[b>>2];p=v[c>>2];if(!(!v[a+28964>>2]|v[a+29024>>2]!=1)){e=-104;if((d|0)!=v[a+29028>>2]|(g|0)!=v[a+29036>>2]|(f|0)!=v[a+29032>>2]){break a}}H=d+f|0;m=a+4120|0;L=a+6176|0;M=a+16|0;q=a+26668|0;N=a+10280|0;r=a+28728|0;F=k+p|0;p=i+p|0;o=F-p|0;k=a+160144|0;i=a+28752|0;I=a+29028|0;x=a+28804|0;t=a+28972|0;C=a+28988|0;J=a+160164|0;j=a+28856|0;K=j;f=p;O=d+g|0;s=O;b:{while(1){c:{e=-1;d=i;g=k;d:{e:{f:{g:{h:{switch(v[a+28964>>2]){case 3:d=v[x>>2];e=v[a+28744>>2];break e;case 1:e=v[a+29e3>>2];break g;case 2:break f;case 0:break h;case 4:break d;default:break a}}v[a+28964>>2]=1;v[a+28992>>2]=0;v[a+28996>>2]=0;v[a+29012>>2]=0;v[a+29016>>2]=0;v[a+29e3>>2]=0;v[a+28976>>2]=0;e=v[b+4>>2];v[I>>2]=v[b>>2];v[I+4>>2]=e;v[I+8>>2]=v[b+8>>2];e=0}e=aa(d,g,e,v[a+28908>>2]);if(e>>>0>4294967176){break a}if(e){d=v[a+29e3>>2];h=e-d|0;g=F-f|0;if(h>>>0>g>>>0){if(g){X((a+d|0)+160144|0,f,g);d=g+v[a+29e3>>2]|0;v[a+29e3>>2]=d}v[c+8>>2]=v[c+4>>2];a=v[a+28908>>2]?2:6;e=((a>>>0>e>>>0?a:e)-d|0)+3|0;break a}X((a+d|0)+160144|0,f,h);v[a+29e3>>2]=e;f=f+h|0;continue}i:{d=v[i>>2];e=v[i+4>>2];if((d|0)==-1&(e|0)==-1|v[a+28772>>2]==1){break i}G=H-s|0;if(!e&G>>>0<d>>>0|e){break i}n=0;l=Q-48|0;Q=l;j:{if(!(((w[p|0]|w[p+1|0]<<8|(w[p+2|0]<<16|w[p+3|0]<<24))&-16)!=407710288|o>>>0<8)){e=w[p+4|0]|w[p+5|0]<<8|(w[p+6|0]<<16|w[p+7|0]<<24);v[u+8>>2]=0;v[u+12>>2]=0;v[u+4>>2]=0;d=e+8|0;v[u>>2]=e>>>0>4294967287?-14:d>>>0>o>>>0?-72:d;break j}h=u;e=aa(l+8|0,p,o,0);k:{if(e>>>0>=4294967177){v[u>>2]=e;e=-2;d=-1;break k}if(e){v[u>>2]=-72;e=-2;d=-1;break k}e=v[l+32>>2];d=o-e|0;e=e+p|0;l:{while(1){if(d>>>0<3){D=-72;break l}D=-20;m:{n:{E=w[e|0]|w[e+1|0]<<8;g=E>>>1&3;switch(g-1|0){case 2:break l;case 0:break m;default:break n}}g=(E|w[e+2|0]<<16)>>>3|0}g=g+3|0;if(g>>>0>d>>>0){v[u>>2]=-72;e=-2;d=-1;break k}n=n+1|0;d=d-g|0;e=e+g|0;if(!(E&1)){continue}break}if(v[l+40>>2]){if(d>>>0<=3){v[u>>2]=-72;e=-2;d=-1;break k}e=e+4|0}D=v[l+24>>2];d=v[l+8>>2];g=v[l+12>>2];v[u+4>>2]=0;v[u>>2]=e-p;e=d;d=(d|0)==-1&(g|0)==-1;e=d?B(n,D):e;d=d?0:g;break k}v[u>>2]=D;e=-2;d=-1}v[h+8>>2]=e;v[h+12>>2]=d}Q=l+48|0;n=v[u>>2];if(n>>>0>o>>>0){break i}g=s;k=p;h=n;o=0;x=0;D=0;o:{p:{switch(v[a+28960>>2]+1|0){default:e=v[a+28944>>2];q:{if(!e){break q}d=v[e+26692>>2];f=v[e+26688>>2];r:{s:{i=v[e>>2];if(i){if(!f){break s}S[f|0](d,i);S[f|0](d,e);break q}if(!f){break r}S[f|0](d,e);break q}Y(i)}Y(e)}v[a+28960>>2]=0;v[a+28944>>2]=0;v[a+28948>>2]=0;r=0;break o;case 2:v[a+28960>>2]=0;break;case 0:break p}}r=v[a+28948>>2]}if(r){x=v[r+8>>2];o=v[r+4>>2]}f=v[a+28908>>2]?1:5;t:{u:{if(h>>>0<f>>>0){e=g;break u}K=a+28816|0;L=a+28752|0;M=r+10276|0;N=r+4116|0;P=r+6172|0;R=r+12|0;T=a+4120|0;U=a+6176|0;V=a+16|0;J=a+26668|0;W=a+10280|0;C=a+28728|0;l=a+28856|0;E=l;e=g;while(1){if(((w[k|0]|w[k+1|0]<<8|(w[k+2|0]<<16|w[k+3|0]<<24))&-16)==407710288){d=-72;if(h>>>0<8){break t}d=-14;i=w[k+4|0]|w[k+5|0]<<8|(w[k+6|0]<<16|w[k+7|0]<<24);if(i>>>0>4294967287){break t}d=i+8|0;d=d>>>0>h>>>0?-72:d;if(d>>>0>4294967176){break t}k=d+k|0;h=h-d|0;if(h>>>0>=f>>>0){continue}break u}v:{if(r){d=v[r+8>>2];i=v[r+4>>2];v[a+28804>>2]=0;v[a+28744>>2]=f;v[a+28792>>2]=0;v[a+28796>>2]=0;v[a+28956>>2]=v[a+28740>>2]!=(d+i|0);f=C;v[f+8>>2]=0;v[f+12>>2]=0;v[f>>2]=0;v[f+4>>2]=0;v[a+10280>>2]=201326604;v[a+28808>>2]=0;v[a+28812>>2]=0;v[a+28800>>2]=3;v[J+8>>2]=v[814];f=v[813];v[J>>2]=v[812];v[J+4>>2]=f;v[a+12>>2]=W;v[a+8>>2]=T;v[a+4>>2]=U;v[a>>2]=V;v[a+28952>>2]=v[r+26676>>2];f=v[r+4>>2];v[a+28736>>2]=f;v[a+28732>>2]=f;d=f+v[r+8>>2]|0;v[a+28728>>2]=d;v[a+28740>>2]=d;if(v[r+26680>>2]){v[a+28808>>2]=1;v[a+28812>>2]=1;v[a+12>>2]=M;v[a+8>>2]=N;v[a+4>>2]=P;v[a>>2]=R;v[a+26668>>2]=v[r+26664>>2];v[a+26672>>2]=v[r+26668>>2];v[a+26676>>2]=v[r+26672>>2];break v}v[a+28808>>2]=0;v[a+28812>>2]=0;break v}d=0;v[a+28792>>2]=0;v[a+28796>>2]=0;v[a+28728>>2]=0;v[a+28732>>2]=0;v[a+28952>>2]=0;v[a+28808>>2]=0;v[a+28812>>2]=0;v[a+28800>>2]=3;v[a+28804>>2]=0;f=a+28736|0;v[f>>2]=0;v[f+4>>2]=0;f=a+10280|0;v[f>>2]=201326604;v[a+28744>>2]=v[a+28908>>2]?1:5;v[a+12>>2]=f;v[a+8>>2]=a+4120;v[a+4>>2]=a+6176;v[a>>2]=a+16;i=v[813];f=a+26668|0;v[f>>2]=v[812];v[f+4>>2]=i;v[a+26676>>2]=v[814];w:{if(!o|!x){break w}Z=a+28728|0;x:{if(!((w[o|0]|w[o+1|0]<<8|(w[o+2|0]<<16|w[o+3|0]<<24))!=-332356553|x>>>0<=7)){v[a+28952>>2]=w[o+4|0]|w[o+5|0]<<8|(w[o+6|0]<<16|w[o+7|0]<<24);d=-30;t=a+16|0;i=Q-128|0;Q=i;f=-30;y:{if(x>>>0<9){break y}q=o+8|0;j=ia(t+10264|0,q,x-8|0,t,10264);if(j>>>0>4294967176){break y}v[i+124>>2]=31;j=q+(j>>>0<4294967177?j:0)|0;q=o+x|0;m=$(i,i+124|0,i+120|0,j,q-j|0);if(m>>>0>4294967176){break y}A=v[i+124>>2];if(A>>>0>31){break y}z=v[i+120>>2];if(z>>>0>=9){break y}ba(t+4104|0,i,A,2256,2384,z);v[i+124>>2]=52;j=j+m|0;m=$(i,i+124|0,i+120|0,j,q-j|0);if(m>>>0>4294967176){break y}A=v[i+124>>2];if(A>>>0>52){break y}z=v[i+120>>2];if(z>>>0>=10){break y}ba(t+6160|0,i,A,2512,2736,z);v[i+124>>2]=35;j=j+m|0;m=$(i,i+124|0,i+120|0,j,q-j|0);if(m>>>0>4294967176){break y}A=v[i+124>>2];if(A>>>0>35){break y}z=v[i+120>>2];if(z>>>0>=10){break y}ba(t,i,A,2960,3104,z);j=j+m|0;A=j+12|0;if(A>>>0>q>>>0){break y}m=w[j|0]|w[j+1|0]<<8|(w[j+2|0]<<16|w[j+3|0]<<24);if(!m){break y}q=q-A|0;if(q>>>0<m>>>0){break y}v[t+26652>>2]=m;m=w[j+4|0]|w[j+5|0]<<8|(w[j+6|0]<<16|w[j+7|0]<<24);if(!m|m>>>0>q>>>0){break y}v[t+26656>>2]=m;j=j+4|0;m=w[j+4|0]|w[j+5|0]<<8|(w[j+6|0]<<16|w[j+7|0]<<24);if(!m|m>>>0>q>>>0){break y}v[t+26660>>2]=m;f=(j-o|0)+8|0}Q=i+128|0;if(f>>>0>4294967176){break w}v[a+28808>>2]=1;v[a+28812>>2]=1;i=v[a+28728>>2];v[a+28740>>2]=i;j=v[a+28732>>2];d=(f>>>0<4294967177?f:0)+o|0;v[a+28732>>2]=d;v[a+28736>>2]=d+(j-i|0);d=d+(x-f|0)|0;break x}v[a+28736>>2]=o;v[a+28740>>2]=0;v[a+28732>>2]=o;d=o+x|0}v[Z>>2]=d;d=0}if(d>>>0>4294967176){break t}d=v[C>>2]}if((e|0)!=(d|0)){v[a+28740>>2]=d;v[a+28728>>2]=e;f=v[a+28732>>2];v[a+28732>>2]=e;v[a+28736>>2]=(f-d|0)+e}z:{d=v[a+28908>>2];A:{if((d?5:9)>>>0>h>>>0){f=-72;break A}j=d?1:5;f=w[(j+k|0)-1|0];i=f&32;f=(!i+(v[(f>>>4&12)+4736>>2]+(j+v[((f&3)<<2)+4720>>2]|0)|0)|0)+(i>>>5&f>>>0<64)|0;if(f>>>0>4294967176){break A}if(f+3>>>0>h>>>0){f=-72;break A}d=aa(L,k,f,d);if(d>>>0>4294967176){f=d;break A}if(d){f=-72;break A}d=v[a+28780>>2];if(!(!d|(d|0)==v[a+28952>>2])){f=-32;break A}if(v[a+28784>>2]){v[a+28848>>2]=2048144761;v[a+28852>>2]=1640531534;v[a+28840>>2]=0;v[a+28844>>2]=0;v[a+28832>>2]=668265295;v[a+28836>>2]=-1028477379;v[a+28824>>2]=-1379879466;v[a+28828>>2]=1625958382;v[a+28816>>2]=0;v[a+28820>>2]=0;v[l+32>>2]=0;v[l+36>>2]=0;v[E+24>>2]=0;v[E+28>>2]=0;d=l;v[d+16>>2]=0;v[d+20>>2]=0;v[d+8>>2]=0;v[d+12>>2]=0;v[d>>2]=0;v[d+4>>2]=0}t=e+G|0;h=h-f|0;k=f+k|0;j=e;while(1){if(h>>>0<3){f=-72;break A}q=w[k|0]|w[k+1|0]<<8;m=q|w[k+2|0]<<16;i=m>>>3|0;f=-20;B:{C:{z=q>>>1&3;d=z;switch(d-1|0){case 2:break A;case 0:break B;default:break C}}d=i}h=h-3|0;if(h>>>0<d>>>0){f=-72;break A}k=k+3|0;D:{E:{switch(z-1|0){default:if(!j){f=0;if(!d){break D}f=-74;break A}if(t-j>>>0<d>>>0){f=-70;break A}X(j,k,d);f=d;break D;case 0:if(!j){f=0;if(m>>>0<8){break D}f=-74;break A}if(i>>>0>t-j>>>0){f=-70;break A}_(j,w[k|0],i);f=i;break D;case 1:break E}}f=qa(a,j,t-j|0,k,d);if(f>>>0>4294967176){break A}}if(v[a+28784>>2]){pa(K,j,f)}h=h-d|0;k=d+k|0;j=f+j|0;if(!(q&1)){continue}break}f=v[a+28756>>2];d=f;i=v[a+28752>>2];if((i|0)!=-1|(d|0)!=-1){f=-20;z=i;i=j-e|0;if((z|0)!=(i|0)|i>>31!=(d|0)){break A}}if(v[a+28784>>2]){f=-22;d=oa(K);if((d|0)!=(w[k|0]|w[k+1|0]<<8|(w[k+2|0]<<16|w[k+3|0]<<24))|h>>>0<4){break A}h=h-4|0;k=k+4|0}f=j-e|0;if(f>>>0<4294967177){break z}}d=(f|0)==-10?D?-72:f:f;break t}D=1;G=G-f|0;e=e+f|0;f=v[a+28908>>2]?1:5;if(h>>>0>=f>>>0){continue}break}}d=-72;if(h){break t}d=e-g|0}e=d;if(d>>>0>4294967176){break a}v[a+28744>>2]=0;s=e+s|0;f=p+n|0;break c}F:{if(v[a+28772>>2]==1|v[a+29024>>2]!=1){break F}e=v[i>>2];d=v[i+4>>2];if((e|0)==-1&(d|0)==-1|!d&H-s>>>0>=e>>>0){break F}e=-70;break a}G:{H:{switch(v[a+28960>>2]+1|0){default:e=v[a+28944>>2];I:{if(!e){break I}g=v[e+26692>>2];d=v[e+26688>>2];J:{K:{h=v[e>>2];if(h){if(!d){break K}S[d|0](g,h);S[d|0](g,e);break I}if(!d){break J}S[d|0](g,e);break I}Y(h)}Y(e)}e=0;v[a+28960>>2]=0;v[a+28944>>2]=0;v[a+28948>>2]=0;g=1;break G;case 2:v[a+28960>>2]=0;break;case 0:break H}}e=v[a+28948>>2];if(!e){e=0;g=1;break G}v[a+28956>>2]=v[a+28740>>2]!=(v[e+4>>2]+v[e+8>>2]|0);g=0}v[a+28792>>2]=0;v[a+28796>>2]=0;v[x>>2]=0;h=v[a+28908>>2];v[a+28744>>2]=h?1:5;d=r;v[d+8>>2]=0;v[d+12>>2]=0;v[d>>2]=0;v[d+4>>2]=0;v[a+10280>>2]=201326604;v[a+28952>>2]=0;v[a+28808>>2]=0;v[a+28812>>2]=0;v[a+28800>>2]=3;v[q+8>>2]=v[814];d=v[813];v[q>>2]=v[812];v[q+4>>2]=d;v[a+12>>2]=N;v[a+8>>2]=m;v[a+4>>2]=L;v[a>>2]=M;L:{if(g){break L}v[a+28952>>2]=v[e+26676>>2];d=v[e+4>>2];v[a+28736>>2]=d;v[a+28732>>2]=d;d=d+v[e+8>>2]|0;v[a+28728>>2]=d;v[a+28740>>2]=d;if(v[e+26680>>2]){v[a+28808>>2]=1;v[a+28812>>2]=1;v[a+12>>2]=e+10276;v[a+8>>2]=e+4116;v[a+4>>2]=e+6172;v[a>>2]=e+12;v[a+26668>>2]=v[e+26664>>2];v[a+26672>>2]=v[e+26668>>2];v[a+26676>>2]=v[e+26672>>2];break L}v[a+28808>>2]=0;v[a+28812>>2]=0}M:{if(((w[k|0]|w[k+1|0]<<8|(w[k+2|0]<<16|w[k+3|0]<<24))&-16)==407710288){e=w[a+160148|0]|w[a+160149|0]<<8|(w[a+160150|0]<<16|w[a+160151|0]<<24);g=7;break M}e=aa(i,k,v[a+29e3>>2],h);if(e>>>0>4294967176){break a}if(e){e=-72;break a}e=v[a+28780>>2];if(!(!e|(e|0)==v[a+28952>>2])){e=-32;break a}g=2;e=3;if(!v[a+28784>>2]){break M}v[a+28848>>2]=2048144761;v[a+28852>>2]=1640531534;v[a+28840>>2]=0;v[a+28844>>2]=0;v[a+28832>>2]=668265295;v[a+28836>>2]=-1028477379;v[a+28824>>2]=-1379879466;v[a+28828>>2]=1625958382;v[a+28816>>2]=0;v[a+28820>>2]=0;v[K+32>>2]=0;v[K+36>>2]=0;d=j;v[d+24>>2]=0;v[d+28>>2]=0;v[d+16>>2]=0;v[d+20>>2]=0;v[d+8>>2]=0;v[d+12>>2]=0;v[d>>2]=0;v[d+4>>2]=0}v[a+28744>>2]=e;v[x>>2]=g;e=v[a+28760>>2];d=v[a+28764>>2];g=!d&e>>>0>1024|(d|0)!=0;e=g?e:1024;d=g?d:0;h=d;v[a+28760>>2]=e;v[a+28764>>2]=d;if(!d&e>>>0>y[a+28980>>2]|d){e=-16;break a}d=v[a+28768>>2];l=d>>>0>4?d:4;d=0;g=0;if(!v[a+29024>>2]){g=v[i+4>>2];D=g;G=v[i>>2];n=e;e=!h&e>>>0<131072;E=e?n:131072;n=n+E|0;e=(e?h:0)+h|0;e=n>>>0<E>>>0?e+1|0:e;h=n;n=h- -64|0;e=e-((h>>>0<4294967232)-1|0)|0;g=(g|0)==(e|0)&n>>>0>G>>>0|e>>>0>g>>>0;g=(g?D:e)?-16:g?G:n}e=v[C>>2];n=v[t>>2];h=g+l|0;d=e+n>>>0>=B(h,3)>>>0?v[J>>2]+1|0:d;v[J>>2]=d;if(!(!(e>>>0<g>>>0|l>>>0>n>>>0)&d>>>0<128)){N:{O:{e=v[a+28936>>2];if(e){if(h>>>0<=e-160168>>>0){break O}e=-64;break a}e=v[a+28968>>2];P:{if(!e){break P}d=w[a+28920|0]|w[a+28921|0]<<8|(w[a+28922|0]<<16|w[a+28923|0]<<24);if(d){S[d|0](w[a+28924|0]|w[a+28925|0]<<8|(w[a+28926|0]<<16|w[a+28927|0]<<24),e);break P}Y(e)}v[C>>2]=0;v[t>>2]=0;e=a;d=w[a+28916|0]|w[a+28917|0]<<8|(w[a+28918|0]<<16|w[a+28919|0]<<24);Q:{if(d){d=S[d|0](w[a+28924|0]|w[a+28925|0]<<8|(w[a+28926|0]<<16|w[a+28927|0]<<24),h)|0;break Q}d=ea(h)}v[e+28968>>2]=d;if(d){break N}e=-64;break a}d=v[a+28968>>2]}v[C>>2]=g;v[a+28984>>2]=d+l;v[t>>2]=l}v[a+28964>>2]=2}h=F-f|0;d=v[x>>2];R:{S:{if(!(v[a+28800>>2]|d-3>>>0>1)){e=v[a+28744>>2];g=h>>>0>1?h:1;if(e>>>0<=g>>>0){break S}break R}e=v[a+28744>>2]}g=e;if(!e){break c}}if(g>>>0<=h>>>0){h=a;T:{if(!v[a+29024>>2]){l=(d|0)!=7;U:{if(!l){e=v[a+28992>>2];d=0;break U}e=v[a+28992>>2];d=v[C>>2]-e|0}e=ca(a,v[a+28984>>2]+e|0,d,f,g);if(e>>>0>4294967176){break a}if(!e){d=2;if(l){break T}}v[a+28996>>2]=v[a+28992>>2]+e;d=4;break T}e=ca(a,s,(d|0)==7?0:H-s|0,f,g);if(e>>>0>4294967176){break a}s=e+s|0;d=2}v[h+28964>>2]=d;f=f+g|0;continue}if((f|0)==(F|0)){f=F;break b}v[a+28964>>2]=3}h=v[a+28976>>2];g=e-h|0;V:{if((d|0)==7){d=F-f|0;d=d>>>0>g>>>0?g:d;break V}if(g>>>0>v[t>>2]-h>>>0){e=-20;break a}d=F-f|0;d=d>>>0>g>>>0?g:d;if(!d){d=0;break V}X(v[a+28968>>2]+h|0,f,d);h=v[a+28976>>2]}v[a+28976>>2]=d+h;f=d+f|0;if(d>>>0<g>>>0){break b}v[a+28976>>2]=0;g=v[x>>2];h=v[a+28968>>2];d=a;W:{if(!v[a+29024>>2]){n=(g|0)!=7;X:{if(!n){g=v[a+28992>>2];l=0;break X}g=v[a+28992>>2];l=v[C>>2]-g|0}e=ca(a,v[a+28984>>2]+g|0,l,h,e);if(e>>>0>4294967176){break a}if(!e){g=2;if(n){break W}}v[a+28996>>2]=v[a+28992>>2]+e;g=4;break W}e=ca(a,s,(g|0)==7?0:H-s|0,h,e);if(e>>>0>4294967176){break a}s=e+s|0;g=2}v[d+28964>>2]=g;continue}d=a;h=H-s|0;e=v[a+28992>>2];l=v[a+28996>>2]-e|0;n=h>>>0<l>>>0;g=n?h:l;if(g){X(s,e+v[a+28984>>2]|0,g);e=v[a+28992>>2]}e=e+g|0;v[d+28992>>2]=e;Y:{if(n){break Y}v[a+28964>>2]=2;d=v[C>>2];if(!v[a+28756>>2]&d>>>0>=y[a+28752>>2]|d>>>0>=e+v[a+28768>>2]>>>0){break Y}v[a+28992>>2]=0;v[a+28996>>2]=0}s=g+s|0;if(h>>>0>=l>>>0){continue}break b}break}v[a+28964>>2]=0}v[c+8>>2]=f-v[c>>2];e=s-v[b>>2]|0;v[b+8>>2]=e;v[I+8>>2]=e;e=v[b+4>>2];v[I>>2]=v[b>>2];v[I+4>>2]=e;Z:{if(!((f|0)!=(p|0)|(s|0)!=(O|0))){b=v[a+29020>>2];v[a+29020>>2]=b+1;if((b|0)<15){break Z}e=-70;if((H|0)==(O|0)){break a}e=-72;if((p|0)!=(F|0)){break Z}break a}v[a+29020>>2]=0}b=v[a+28744>>2];if(!b){b=v[a+29016>>2];if(v[a+28996>>2]==v[a+28992>>2]){e=0;if(!b){break a}b=v[c+8>>2];if(b>>>0>=y[c+4>>2]){v[a+28964>>2]=2;e=1;break a}v[c+8>>2]=b+1;break a}e=1;if(b){break a}v[c+8>>2]=v[c+8>>2]-1;v[a+29016>>2]=1;break a}e=(b-v[a+28976>>2]|0)+(v[a+28804>>2]==3?3:0)|0}Q=u+16|0;return e|0}function na(a,b,c,d,e,f){var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,y=0,z=0,A=0,B=0,C=0;r=Q-784|0;Q=r;j=-72;a:{if(!f){break a}g=t[e|0];A=g&255;b:{c:{if((g|0)<0){g=A-126>>>1|0;if(g>>>0>=f>>>0){break a}j=-20;i=A-127|0;if(i>>>0>=256){break a}if(!i){break b}n=e+1|0;j=A-128|0;e=(j>>>1|0)+1|0;k=e&1;f=0;if(j>>>0>=2){e=e&-2;while(1){j=n+(f>>>1|0)|0;t[a+f|0]=w[j|0]>>>4;t[(f|1)+a|0]=w[j|0]&15;j=f|2;l=n+(j>>>1|0)|0;t[a+j|0]=w[l|0]>>>4;t[(f|3)+a|0]=w[l|0]&15;f=f+4|0;e=e-2|0;if(e){continue}break}}if(k){e=n+(f>>>1|0)|0;t[a+f|0]=w[e|0]>>>4;t[(f|1)+a|0]=w[e|0]&15}A=g;break c}if(f>>>0<=A>>>0){break a}v[r+264>>2]=255;q=e+1|0;g=$(r+272|0,r+264|0,r+268|0,q,A);if(g>>>0>4294967176){j=g;break a}j=-44;m=v[r+268>>2];if(m>>>0>6){break a}z=r+272|0;p=Q-512|0;Q=p;j=-46;s=v[r+264>>2];d:{if(s>>>0>255){break d}j=-44;if(m>>>0>12){break d}B=r+4|0;o=1<<m;f=o-1|0;h=1;e=s+1|0;C=e&1;y=65536<<m-1>>16;e:{if(!s){e=f;break e}j=e&-2;e=f;while(1){k=l<<1;i=x[k+z>>1];f:{if((i|0)==65535){t[(B+(e<<2)|0)+2|0]=l;e=e-1|0;i=1;break f}h=(y|0)>i<<16>>16?h:0}u[k+p>>1]=i;n=l|1;k=n<<1;i=x[z+k>>1];g:{if((i|0)!=65535){h=(y|0)>i<<16>>16?h:0;break g}t[(B+(e<<2)|0)+2|0]=n;e=e-1|0;i=1}u[k+p>>1]=i;l=l+2|0;j=j-2|0;if(j){continue}break}}if(C){i=x[z+(l<<1)>>1];h:{if((i|0)!=65535){h=(y|0)>i<<16>>16?h:0;break h}t[(B+(e<<2)|0)+2|0]=l;e=e-1|0;i=1}u[p+(l<<1)>>1]=i}u[r+2>>1]=h;u[r>>1]=m;n=((o>>>3)+(o>>>1)|0)+3|0;l=0;j=0;while(1){i=j;k=u[z+(i<<1)>>1];i:{if((k|0)<=0){break i}if((k|0)!=1){j=k&-2;while(1){t[(B+(l<<2)|0)+2|0]=i;while(1){l=f&l+n;if(l>>>0>e>>>0){continue}break}t[(B+(l<<2)|0)+2|0]=i;while(1){l=f&l+n;if(l>>>0>e>>>0){continue}break}j=j-2|0;if(j){continue}break}}if(!(k&1)){break i}t[(B+(l<<2)|0)+2|0]=i;while(1){l=f&l+n;if(l>>>0>e>>>0){continue}break}}j=i+1|0;if((i|0)!=(s|0)){continue}break}j=-1;if(l){break d}f=m+1|0;j=0;l=0;while(1){i=B+(l<<2)|0;e=p+(w[i+2|0]<<1)|0;k=x[e>>1];u[e>>1]=k+1;e=f+(E(k)^-32)|0;t[i+3|0]=e;u[i>>1]=(k<<e)-o;l=l+1|0;if((o|0)!=(l|0)){continue}break}}Q=p+512|0;if(j>>>0>=4294967177){break a}m=g+q|0;f=A-g|0;C=a;s=a+255|0;y=s-3|0;j:{k:{l:{m:{n:{if(x[r+2>>1]){i=-72;if(!f){break j}o:{p:{if(f>>>0>=4){q=-1;e=w[(f+m|0)-1|0];if(!e){break l}if(f>>>0<=4294967176){break p}i=f;break j}g=w[m|0];q:{switch(f-2|0){case 1:g=w[m+2|0]<<16|g;case 0:g=(w[m+1|0]<<8)+g|0;break;default:break q}}j=w[(f+m|0)-1|0];i=-20;if(!j){break j}h=0;e=(E(j)-(f<<3)|0)+9|0;break o}h=f-4|0;f=m+h|0;g=w[f|0]|w[f+1|0]<<8|(w[f+2|0]<<16|w[f+3|0]<<24);e=E(e)-23|0}l=x[r>>1];k=l+e|0;f=g>>>0-k|0;i=v[(l<<2)+4592>>2];r:{if(k>>>0>32){break r}s:{if((h|0)>=4){g=k>>>3|0;k=k&7;break s}if(!h){h=0;break r}e=k>>>3|0;g=m>>>0>(h+m|0)-e>>>0?h:e;k=k-(g<<3)|0}h=h-g|0;e=m+h|0;g=w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24)}j=f&i;p=r+4|0;f=k+l|0;n=i&g>>>0-f;if(f>>>0>32){e=f;f=a;break m}if((h|0)>=4){e=f&7;h=h-(f>>>3|0)|0;f=m+h|0;g=w[f|0]|w[f+1|0]<<8|(w[f+2|0]<<16|w[f+3|0]<<24);break n}if(!h){h=0;e=f;break n}e=f>>>3|0;e=m>>>0>(h+m|0)-e>>>0?h:e;h=h-e|0;g=m+h|0;g=w[g|0]|w[g+1|0]<<8|(w[g+2|0]<<16|w[g+3|0]<<24);e=f-(e<<3)|0;if(e>>>0<=32){break n}f=a;break m}i=-72;if(!f){break j}t:{u:{if(f>>>0>=4){q=-1;e=w[(f+m|0)-1|0];if(!e){break l}if(f>>>0<=4294967176){break u}i=f;break j}g=w[m|0];v:{switch(f-2|0){case 1:g=w[m+2|0]<<16|g;case 0:g=(w[m+1|0]<<8)+g|0;break;default:break v}}j=w[(f+m|0)-1|0];i=-20;if(!j){break j}h=0;e=(E(j)-(f<<3)|0)+9|0;break t}h=f-4|0;f=m+h|0;g=w[f|0]|w[f+1|0]<<8|(w[f+2|0]<<16|w[f+3|0]<<24);e=E(e)-23|0}l=x[r>>1];k=l+e|0;f=g>>>0-k|0;i=v[(l<<2)+4592>>2];w:{if(k>>>0>32){break w}x:{if((h|0)>=4){g=k>>>3|0;k=k&7;break x}if(!h){h=0;break w}e=k>>>3|0;g=m>>>0>(h+m|0)-e>>>0?h:e;k=k-(g<<3)|0}h=h-g|0;e=m+h|0;g=w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24)}j=f&i;p=r+4|0;f=k+l|0;n=i&g>>>0-f;y:{if(f>>>0>32){e=f;f=a;break y}z:{if((h|0)>=4){e=f&7;h=h-(f>>>3|0)|0;f=m+h|0;g=w[f|0]|w[f+1|0]<<8|(w[f+2|0]<<16|w[f+3|0]<<24);break z}if(!h){h=0;e=f;break z}e=f>>>3|0;e=m>>>0>(h+m|0)-e>>>0?h:e;h=h-e|0;g=m+h|0;g=w[g|0]|w[g+1|0]<<8|(w[g+2|0]<<16|w[g+3|0]<<24);e=f-(e<<3)|0;if(e>>>0<=32){break z}f=a;break y}f=a;while(1){A:{if((h|0)>=4){g=e>>>3|0;k=0;e=e&7;break A}if(!h){h=0;break y}g=e>>>3|0;k=m>>>0>(h+m|0)-g>>>0;g=k?h:g;e=e-(g<<3)|0}h=h-g|0;o=m+h|0;g=w[o|0]|w[o+1|0]<<8|(w[o+2|0]<<16|w[o+3|0]<<24);if(k|f>>>0>=y>>>0){break y}i=(j<<2)+p|0;j=x[i>>1];q=w[i+3|0];t[f|0]=w[i+2|0];l=(n<<2)+p|0;k=x[l>>1];i=w[l+3|0];t[f+1|0]=w[l+2|0];e=e+q|0;j=j+(v[(q<<2)+4592>>2]&g>>>0-e)|0;l=v[(i<<2)+4592>>2];i=e+i|0;n=k+(l&g>>>0-i)|0;B:{C:{if(i>>>0>32){e=i;break C}if((h|0)>=4){e=i&7;h=h-(i>>>3|0)|0;g=m+h|0;g=w[g|0]|w[g+1|0]<<8|(w[g+2|0]<<16|w[g+3|0]<<24);break B}if(!h){h=0;e=i;break C}e=i>>>3|0;k=o-e|0;g=k>>>0<m>>>0?h:e;e=i-(g<<3)|0;h=h-g|0;g=m+h|0;g=w[g|0]|w[g+1|0]<<8|(w[g+2|0]<<16|w[g+3|0]<<24);if(k>>>0>=m>>>0){break B}}f=f+2|0;break y}i=(j<<2)+p|0;j=x[i>>1];q=w[i+3|0];t[f+2|0]=w[i+2|0];l=(n<<2)+p|0;i=x[l>>1];k=w[l+3|0];t[f+3|0]=w[l+2|0];e=e+q|0;j=j+(v[(q<<2)+4592>>2]&g>>>0-e)|0;e=e+k|0;n=i+(v[(k<<2)+4592>>2]&g>>>0-e)|0;f=f+4|0;if(e>>>0<33){continue}break}}q=-70;o=s-2|0;if(o>>>0<f>>>0){break l}z=2;while(1){j=(j<<2)+p|0;y=x[j>>1];s=w[j+3|0];t[f|0]=w[j+2|0];i=f+1|0;e=e+s|0;if(e>>>0>32){j=n;break k}D:{E:{if((h|0)>=4){j=e>>>3|0;l=e&7;break E}if(!h){h=0;l=e;k=g;break D}j=e>>>3|0;j=m>>>0>(h+m|0)-j>>>0?h:j;l=e-(j<<3)|0}h=h-j|0;j=m+h|0;k=w[j|0]|w[j+1|0]<<8|(w[j+2|0]<<16|w[j+3|0]<<24)}if(i>>>0>o>>>0){break l}j=y+(v[(s<<2)+4592>>2]&g>>>0-e)|0;e=(n<<2)+p|0;n=x[e>>1];g=w[e+3|0];t[f+1|0]=w[e+2|0];i=f+2|0;e=g+l|0;if(e>>>0>32){z=3;break k}f=v[(g<<2)+4592>>2]&k>>>0-e;F:{G:{if((h|0)>=4){l=e>>>3|0;e=e&7;break G}if(!h){h=0;g=k;break F}g=e;e=e>>>3|0;l=m>>>0>(h+m|0)-e>>>0?h:e;e=g-(l<<3)|0}h=h-l|0;g=m+h|0;g=w[g|0]|w[g+1|0]<<8|(w[g+2|0]<<16|w[g+3|0]<<24)}n=f+n|0;f=i;if(o>>>0>=f>>>0){continue}break}break l}f=a;while(1){H:{if((h|0)>=4){g=e>>>3|0;k=0;e=e&7;break H}if(!h){h=0;break m}g=e>>>3|0;k=m>>>0>(h+m|0)-g>>>0;g=k?h:g;e=e-(g<<3)|0}h=h-g|0;o=m+h|0;g=w[o|0]|w[o+1|0]<<8|(w[o+2|0]<<16|w[o+3|0]<<24);if(k|f>>>0>=y>>>0){break m}i=(j<<2)+p|0;j=x[i>>1];q=w[i+3|0];t[f|0]=w[i+2|0];l=(n<<2)+p|0;i=x[l>>1];k=w[l+3|0];t[f+1|0]=w[l+2|0];j=j+(g<<e>>>0-q|0)|0;e=e+q|0;n=i+(g<<e>>>0-k|0)|0;I:{i=e+k|0;J:{if(i>>>0>32){e=i;break J}if((h|0)>=4){e=i&7;h=h-(i>>>3|0)|0;g=m+h|0;g=w[g|0]|w[g+1|0]<<8|(w[g+2|0]<<16|w[g+3|0]<<24);break I}if(!h){h=0;e=i;break J}e=i>>>3|0;k=o-e|0;g=k>>>0<m>>>0?h:e;e=i-(g<<3)|0;h=h-g|0;g=m+h|0;g=w[g|0]|w[g+1|0]<<8|(w[g+2|0]<<16|w[g+3|0]<<24);if(k>>>0>=m>>>0){break I}}f=f+2|0;break m}i=(j<<2)+p|0;j=x[i>>1];q=w[i+3|0];t[f+2|0]=w[i+2|0];l=(n<<2)+p|0;i=x[l>>1];k=w[l+3|0];t[f+3|0]=w[l+2|0];j=j+(g<<e>>>0-q|0)|0;e=e+q|0;n=i+(g<<e>>>0-k|0)|0;f=f+4|0;e=e+k|0;if(e>>>0<33){continue}break}}q=-70;o=s-2|0;if(o>>>0<f>>>0){break l}z=2;while(1){j=(j<<2)+p|0;y=x[j>>1];s=w[j+3|0];t[f|0]=w[j+2|0];i=f+1|0;k=e+s|0;if(k>>>0>32){j=n;break k}K:{L:{if((h|0)>=4){l=k>>>3|0;k=k&7;break L}if(!h){h=0;l=g;break K}j=k>>>3|0;l=m>>>0>(h+m|0)-j>>>0?h:j;k=k-(l<<3)|0}h=h-l|0;j=m+h|0;l=w[j|0]|w[j+1|0]<<8|(w[j+2|0]<<16|w[j+3|0]<<24)}if(i>>>0>o>>>0){break l}j=y+(g<<e>>>0-s|0)|0;e=(n<<2)+p|0;n=x[e>>1];g=w[e+3|0];t[f+1|0]=w[e+2|0];i=f+2|0;e=g+k|0;if(e>>>0>32){z=3;break k}f=l<<k>>>0-g|0;M:{N:{if((h|0)>=4){l=e>>>3|0;e=e&7;break N}if(!h){h=0;g=l;break M}g=e;e=e>>>3|0;l=m>>>0>(h+m|0)-e>>>0?h:e;e=g-(l<<3)|0}h=h-l|0;g=m+h|0;g=w[g|0]|w[g+1|0]<<8|(w[g+2|0]<<16|w[g+3|0]<<24)}n=f+n|0;f=i;if(o>>>0>=f>>>0){continue}break}}i=q;break j}t[i|0]=w[((j<<2)+p|0)+2|0];i=(f+z|0)-C|0}j=i;if(i>>>0>=4294967177){break a}}f=b;v[f>>2]=0;v[f+4>>2]=0;e=0;v[f+48>>2]=0;v[f+40>>2]=0;v[f+44>>2]=0;v[f+32>>2]=0;v[f+36>>2]=0;v[f+24>>2]=0;v[f+28>>2]=0;v[f+16>>2]=0;v[f+20>>2]=0;v[f+8>>2]=0;v[f+12>>2]=0;j=-20;if(!i){break a}f=0;while(1){k=a+f|0;g=w[k|0];if(g>>>0>11){break a}g=(g<<2)+b|0;v[g>>2]=v[g>>2]+1;e=(1<<w[k|0]>>1)+e|0;f=f+1|0;if((i|0)!=(f|0)){continue}break}if(!e|e>>>0>4095){break a}f=d;d=32-E(e)|0;v[f>>2]=d;e=(1<<d)-e|0;d=E(e)^31;if(1<<d!=(e|0)){break a}e=a+i|0;a=d+1|0;t[e|0]=a;a=(a<<2)+b|0;v[a>>2]=v[a>>2]+1;a=v[b+4>>2];if(a>>>0<2|a&1){break a}v[c>>2]=i+1;j=A+1|0;break a}v[b>>2]=0;v[b+4>>2]=0;v[b+48>>2]=0;v[b+40>>2]=0;v[b+44>>2]=0;v[b+32>>2]=0;v[b+36>>2]=0;v[b+24>>2]=0;v[b+28>>2]=0;v[b+16>>2]=0;v[b+20>>2]=0;v[b+8>>2]=0;v[b+12>>2]=0}Q=r+784|0;return j}function ra(a,b,c,d,e){var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,y=0,z=0,A=0,B=0,C=0,D=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,R=0,S=0,T=0;n=Q-32|0;Q=n;f=-20;a:{if(d>>>0<10){break a}j=w[c+4|0]|w[c+5|0]<<8;h=w[c|0]|w[c+1|0]<<8;m=h+6|0;i=w[c+2|0]|w[c+3|0]<<8;C=j+(m+i|0)|0;if(C>>>0>d>>>0){break a}if(!h){f=-72;break a}g=c+6|0;z=x[e+2>>1];b:{if(h>>>0>=4){f=-1;g=w[(h+g|0)-1|0];if(!g){break a}r=h+2|0;h=r+c|0;k=w[h|0]|w[h+1|0]<<8|(w[h+2|0]<<16|w[h+3|0]<<24);h=E(g)-23|0;break b}k=w[g|0];c:{switch(h-2|0){case 1:k=w[c+8|0]<<16|k;case 0:k=(w[c+7|0]<<8)+k|0;break;default:break c}}g=w[(h+g|0)-1|0];if(!g){break a}r=6;h=(E(g)-(h<<3)|0)+9|0}if(!i){f=-72;break a}B=c+m|0;d:{if(i>>>0>=4){f=-1;m=w[(i+B|0)-1|0];if(!m){break a}s=i-4|0;g=B+s|0;o=w[g|0]|w[g+1|0]<<8|(w[g+2|0]<<16|w[g+3|0]<<24);g=E(m)-23|0;break d}o=w[B|0];e:{switch(i-2|0){case 1:o=w[B+2|0]<<16|o;case 0:o=(w[B+1|0]<<8)+o|0;break;default:break e}}g=w[(i+B|0)-1|0];if(!g){f=-20;break a}g=(E(g)-(i<<3)|0)+9|0}f=-72;if(!j){break a}F=i+B|0;m=F+j|0;f:{if(j>>>0>=4){f=-1;l=w[m-1|0];if(!l){break a}u=j-4|0;i=F+u|0;D=w[i|0]|w[i+1|0]<<8|(w[i+2|0]<<16|w[i+3|0]<<24);i=E(l)-23|0;break f}D=w[F|0];g:{switch(j-2|0){case 1:D=w[F+2|0]<<16|D;case 0:D=(w[F+1|0]<<8)+D|0;break;default:break g}}i=w[m-1|0];if(!i){f=-20;break a}i=(E(i)-(j<<3)|0)+9|0}f=ja(n+8|0,m,d-C|0);if(f>>>0>4294967176){break a}l=e+4|0;p=0-z&31;A=v[n+16>>2];f=v[n+12>>2];q=v[n+8>>2];d=b+3>>>2|0;m=d+a|0;M=a+b|0;N=M-3|0;C=d+m|0;z=C+d|0;h:{if(N>>>0<=z>>>0){e=z;j=C;d=m;break h}P=v[n+24>>2];d=m;j=C;e=z;while(1){y=(k<<h>>>p<<2)+l|0;G=x[y>>1];t[a|0]=G;t[a+1|0]=G>>>8;G=w[y+2|0];I=w[y+3|0];y=(o<<g>>>p<<2)+l|0;H=x[y>>1];t[d|0]=H;t[d+1|0]=H>>>8;H=w[y+2|0];J=w[y+3|0];y=(D<<i>>>p<<2)+l|0;K=x[y>>1];t[j|0]=K;t[j+1|0]=K>>>8;K=w[y+2|0];O=w[y+3|0];y=(q<<f>>>p<<2)+l|0;L=x[y>>1];t[e|0]=L;t[e+1|0]=L>>>8;L=w[y+2|0];R=w[y+3|0];y=a+I|0;h=h+G|0;a=(k<<h>>>p<<2)+l|0;G=x[a>>1];t[y|0]=G;t[y+1|0]=G>>>8;G=w[a+2|0];S=w[a+3|0];d=d+J|0;I=g+H|0;a=(o<<I>>>p<<2)+l|0;g=x[a>>1];t[d|0]=g;t[d+1|0]=g>>>8;H=w[a+2|0];T=w[a+3|0];j=j+O|0;i=i+K|0;a=(D<<i>>>p<<2)+l|0;g=x[a>>1];t[j|0]=g;t[j+1|0]=g>>>8;J=w[a+2|0];K=w[a+3|0];e=e+R|0;f=f+L|0;g=(q<<f>>>p<<2)+l|0;a=x[g>>1];t[e|0]=a;t[e+1|0]=a>>>8;h=h+G|0;if((r|0)<10){G=3}else{r=r-(h>>>3|0)|0;a=r+c|0;k=w[a|0]|w[a+1|0]<<8|(w[a+2|0]<<16|w[a+3|0]<<24);h=h&7;G=0}O=w[g+3|0];L=w[g+2|0];g=H+I|0;I=3;if((s|0)<4){H=3}else{s=s-(g>>>3|0)|0;a=B+s|0;o=w[a|0]|w[a+1|0]<<8|(w[a+2|0]<<16|w[a+3|0]<<24);g=g&7;H=0}i=i+J|0;if((u|0)>=4){u=u-(i>>>3|0)|0;a=F+u|0;D=w[a|0]|w[a+1|0]<<8|(w[a+2|0]<<16|w[a+3|0]<<24);I=0;i=i&7}e=e+O|0;f=f+L|0;if(A>>>0<P>>>0){J=3}else{A=A-(f>>>3|0)|0;q=w[A|0]|w[A+1|0]<<8|(w[A+2|0]<<16|w[A+3|0]<<24);f=f&7;J=0}a=y+S|0;d=d+T|0;j=j+K|0;if(e>>>0>=N>>>0){break h}if(!(J|(G|H|I))){continue}break}}v[n+16>>2]=A;v[n+12>>2]=f;v[n+8>>2]=q;if(a>>>0>m>>>0){f=-20;break a}if(d>>>0>C>>>0){f=-20;break a}f=-20;if(j>>>0>z>>>0){break a}i:{j:{k:{if(h>>>0<=32){A=m-3|0;while(1){l:{if((r|0)>=10){k=h>>>3|0;q=0;f=h&7;break l}if((r|0)==6){q=m-2|0;r=6;f=h;break j}f=h>>>3|0;q=(r-f|0)<6;k=q?r-6|0:f;f=h-(k<<3)|0}r=r-k|0;h=r+c|0;k=w[h|0]|w[h+1|0]<<8|(w[h+2|0]<<16|w[h+3|0]<<24);if(q|a>>>0>=A>>>0){break k}h=(k<<f>>>p<<2)+l|0;q=x[h>>1];t[a|0]=q;t[a+1|0]=q>>>8;a=w[h+3|0]+a|0;f=w[h+2|0]+f|0;h=(k<<f>>>p<<2)+l|0;q=x[h>>1];t[a|0]=q;t[a+1|0]=q>>>8;a=a+w[h+3|0]|0;h=f+w[h+2|0]|0;if(h>>>0<33){continue}break}}q=m-2|0;break i}q=m-2|0;if(f>>>0<=32){break j}h=f;break i}while(1){m:{if((r|0)>=10){k=f>>>3|0;A=0;h=f&7;break m}if((r|0)==6){r=6;h=f;break i}h=f>>>3|0;A=(r-h|0)<6;k=A?r-6|0:h;h=f-(k<<3)|0}r=r-k|0;f=r+c|0;k=w[f|0]|w[f+1|0]<<8|(w[f+2|0]<<16|w[f+3|0]<<24);if(A|a>>>0>q>>>0){break i}f=(k<<h>>>p<<2)+l|0;A=x[f>>1];t[a|0]=A;t[a+1|0]=A>>>8;a=w[f+3|0]+a|0;f=w[f+2|0]+h|0;if(f>>>0<=32){continue}break}h=f}if(a>>>0<=q>>>0){while(1){c=(k<<h>>>p<<2)+l|0;f=x[c>>1];t[a|0]=f;t[a+1|0]=f>>>8;h=w[c+2|0]+h|0;a=w[c+3|0]+a|0;if(q>>>0>=a>>>0){continue}break}}n:{if(a>>>0>=m>>>0){break n}f=a;c=k<<h>>>p|0;a=(c<<2)+l|0;t[f|0]=w[a|0];if(w[a+3|0]==1){h=w[a+2|0]+h|0;break n}if(h>>>0>31){break n}a=w[((c<<2)+l|0)+2|0]+h|0;h=a>>>0<32?a:32}o:{p:{q:{if(g>>>0<=32){m=C-3|0;while(1){r:{if((s|0)>=4){f=g>>>3|0;a=0;c=g&7;break r}if(!s){f=C-2|0;s=0;k=B;c=g;break p}c=g>>>3|0;a=(B+s|0)-c>>>0<B>>>0;f=a?s:c;c=g-(f<<3)|0}s=s-f|0;k=B+s|0;o=w[k|0]|w[k+1|0]<<8|(w[k+2|0]<<16|w[k+3|0]<<24);if(a|d>>>0>=m>>>0){break q}a=(o<<c>>>p<<2)+l|0;g=x[a>>1];t[d|0]=g;t[d+1|0]=g>>>8;d=w[a+3|0]+d|0;c=w[a+2|0]+c|0;a=(o<<c>>>p<<2)+l|0;g=x[a>>1];t[d|0]=g;t[d+1|0]=g>>>8;d=d+w[a+3|0]|0;g=c+w[a+2|0]|0;if(g>>>0<33){continue}break}}k=B+s|0;f=C-2|0;break o}f=C-2|0;if(c>>>0<=32){break p}g=c;break o}while(1){s:{if((s|0)>=4){a=c>>>3|0;q=0;g=c&7;break s}if(!s){g=c;break o}a=c>>>3|0;q=k-a>>>0<B>>>0;a=q?s:a;g=c-(a<<3)|0}s=s-a|0;k=B+s|0;o=w[k|0]|w[k+1|0]<<8|(w[k+2|0]<<16|w[k+3|0]<<24);if(q|d>>>0>f>>>0){break o}a=(o<<g>>>p<<2)+l|0;c=x[a>>1];t[d|0]=c;t[d+1|0]=c>>>8;d=w[a+3|0]+d|0;c=w[a+2|0]+g|0;if(c>>>0<=32){continue}break}g=c}if(d>>>0<=f>>>0){while(1){a=(o<<g>>>p<<2)+l|0;c=x[a>>1];t[d|0]=c;t[d+1|0]=c>>>8;g=w[a+2|0]+g|0;d=w[a+3|0]+d|0;if(d>>>0<=f>>>0){continue}break}}t:{if(d>>>0>=C>>>0){break t}c=o<<g>>>p|0;a=(c<<2)+l|0;t[d|0]=w[a|0];if(w[a+3|0]==1){g=w[a+2|0]+g|0;break t}if(g>>>0>31){break t}a=w[((c<<2)+l|0)+2|0]+g|0;g=a>>>0<32?a:32}u:{v:{w:{if(i>>>0<=32){m=z-3|0;while(1){x:{if((u|0)>=4){f=i>>>3|0;a=0;c=i&7;break x}if(!u){f=z-2|0;u=0;o=F;c=i;break v}c=i>>>3|0;a=F>>>0>(u+F|0)-c>>>0;f=a?u:c;c=i-(f<<3)|0}u=u-f|0;o=F+u|0;D=w[o|0]|w[o+1|0]<<8|(w[o+2|0]<<16|w[o+3|0]<<24);if(a|j>>>0>=m>>>0){break w}a=(D<<c>>>p<<2)+l|0;d=x[a>>1];t[j|0]=d;t[j+1|0]=d>>>8;d=w[a+3|0]+j|0;c=w[a+2|0]+c|0;a=(D<<c>>>p<<2)+l|0;i=x[a>>1];t[d|0]=i;t[d+1|0]=i>>>8;j=d+w[a+3|0]|0;i=c+w[a+2|0]|0;if(i>>>0<33){continue}break}}o=u+F|0;f=z-2|0;break u}f=z-2|0;if(c>>>0<=32){break v}i=c;break u}while(1){y:{if((u|0)>=4){a=c>>>3|0;d=0;i=c&7;break y}if(!u){i=c;break u}a=c>>>3|0;d=F>>>0>o-a>>>0;a=d?u:a;i=c-(a<<3)|0}u=u-a|0;o=F+u|0;D=w[o|0]|w[o+1|0]<<8|(w[o+2|0]<<16|w[o+3|0]<<24);if(d|f>>>0<j>>>0){break u}a=(D<<i>>>p<<2)+l|0;c=x[a>>1];t[j|0]=c;t[j+1|0]=c>>>8;j=w[a+3|0]+j|0;c=w[a+2|0]+i|0;if(c>>>0<=32){continue}break}i=c}if(f>>>0>=j>>>0){while(1){a=(D<<i>>>p<<2)+l|0;c=x[a>>1];t[j|0]=c;t[j+1|0]=c>>>8;i=w[a+2|0]+i|0;j=w[a+3|0]+j|0;if(j>>>0<=f>>>0){continue}break}}z:{if(j>>>0>=z>>>0){break z}c=D<<i>>>p|0;a=(c<<2)+l|0;t[j|0]=w[a|0];if(w[a+3|0]==1){i=w[a+2|0]+i|0;break z}if(i>>>0>31){break z}a=w[((c<<2)+l|0)+2|0]+i|0;i=a>>>0<32?a:32}A:{B:{C:{c=v[n+12>>2];if(c>>>0<=32){while(1){a=n;f=v[a+16>>2];C=v[a+24>>2];D:{if(f>>>0>=C>>>0){f=f-(c>>>3|0)|0;v[n+16>>2]=f;d=0;c=c&7;break D}j=v[n+20>>2];if((j|0)==(f|0)){a=M-2|0;j=f;break B}m=c>>>3|0;d=j>>>0>f-m>>>0;j=d?f-j|0:m;f=f-j|0;v[n+16>>2]=f;c=c-(j<<3)|0}v[a+12>>2]=c;a=w[f|0]|w[f+1|0]<<8|(w[f+2|0]<<16|w[f+3|0]<<24);v[n+8>>2]=a;if(d|e>>>0>=N>>>0){break C}d=(a<<c>>>p<<2)+l|0;f=x[d>>1];t[e|0]=f;t[e+1|0]=f>>>8;e=w[d+3|0]+e|0;c=w[d+2|0]+c|0;a=(a<<c>>>p<<2)+l|0;d=x[a>>1];t[e|0]=d;t[e+1|0]=d>>>8;c=c+w[a+2|0]|0;v[n+12>>2]=c;e=e+w[a+3|0]|0;if(c>>>0<33){continue}break}}a=M-2|0;break A}a=M-2|0;if(c>>>0>32){break A}j=v[n+20>>2]}while(1){m=n;E:{if(f>>>0>=C>>>0){f=f-(c>>>3|0)|0;v[n+16>>2]=f;d=0;c=c&7;break E}if((f|0)==(j|0)){break A}z=c>>>3|0;d=j>>>0>f-z>>>0;z=d?f-j|0:z;f=f-z|0;v[n+16>>2]=f;c=c-(z<<3)|0}v[m+12>>2]=c;m=w[f|0]|w[f+1|0]<<8|(w[f+2|0]<<16|w[f+3|0]<<24);v[n+8>>2]=m;if(d|a>>>0<e>>>0){break A}d=(m<<c>>>p<<2)+l|0;m=x[d>>1];t[e|0]=m;t[e+1|0]=m>>>8;c=w[d+2|0]+c|0;v[n+12>>2]=c;e=w[d+3|0]+e|0;if(c>>>0<=32){continue}break}}if(a>>>0>=e>>>0){while(1){d=(v[n+8>>2]<<c>>>p<<2)+l|0;c=x[d>>1];t[e|0]=c;t[e+1|0]=c>>>8;c=v[n+12>>2]+w[d+2|0]|0;v[n+12>>2]=c;e=w[d+3|0]+e|0;if(e>>>0<=a>>>0){continue}break}}F:{if(e>>>0>=M>>>0){break F}d=v[n+8>>2]<<c>>>p|0;a=(d<<2)+l|0;t[e|0]=w[a|0];if(w[a+3|0]==1){c=v[n+12>>2]+w[a+2|0]|0;break F}c=v[n+12>>2];if(c>>>0>31){break F}a=w[((d<<2)+l|0)+2|0]+c|0;c=a>>>0<32?a:32}f=(r|0)==6?(h|0)==32?(k|0)==(B|0)?(g|0)==32?(o|0)==(F|0)?(i|0)==32?v[n+16>>2]==v[n+20>>2]?(c|0)==32?b:-20:-20:-20:-20:-20:-20:-20:-20}Q=n+32|0;return f}function ka(a,b,c,d,e){var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,y=0,z=0,A=0,C=0,D=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,R=0,S=0,T=0,U=0;n=Q-32|0;Q=n;f=-20;a:{if(d>>>0<10){break a}k=w[c+4|0]|w[c+5|0]<<8;h=w[c|0]|w[c+1|0]<<8;j=h+6|0;g=w[c+2|0]|w[c+3|0]<<8;q=k+(j+g|0)|0;if(q>>>0>d>>>0){break a}if(!h){f=-72;break a}i=c+6|0;l=x[e+2>>1];b:{if(h>>>0>=4){f=-1;i=w[(h+i|0)-1|0];if(!i){break a}r=h+2|0;f=r+c|0;m=w[f|0]|w[f+1|0]<<8|(w[f+2|0]<<16|w[f+3|0]<<24);h=E(i)-23|0;break b}m=w[i|0];c:{switch(h-2|0){case 1:m=w[c+8|0]<<16|m;case 0:m=(w[c+7|0]<<8)+m|0;break;default:break c}}f=w[(h+i|0)-1|0];if(!f){f=-20;break a}r=6;h=(E(f)-(h<<3)|0)+9|0}if(!g){f=-72;break a}y=c+j|0;d:{if(g>>>0>=4){f=-1;i=w[(g+y|0)-1|0];if(!i){break a}J=g-4|0;f=J+y|0;z=w[f|0]|w[f+1|0]<<8|(w[f+2|0]<<16|w[f+3|0]<<24);i=E(i)-23|0;break d}z=w[y|0];e:{switch(g-2|0){case 1:z=w[y+2|0]<<16|z;case 0:z=(w[y+1|0]<<8)+z|0;break;default:break e}}f=w[(g+y|0)-1|0];if(!f){f=-20;break a}i=(E(f)-(g<<3)|0)+9|0}f=-72;if(!k){break a}C=g+y|0;j=k+C|0;f:{if(k>>>0>=4){f=-1;g=w[j-1|0];if(!g){break a}G=k-4|0;f=G+C|0;A=w[f|0]|w[f+1|0]<<8|(w[f+2|0]<<16|w[f+3|0]<<24);g=E(g)-23|0;break f}A=w[C|0];g:{switch(k-2|0){case 1:A=w[C+2|0]<<16|A;case 0:A=(w[C+1|0]<<8)+A|0;break;default:break g}}f=w[j-1|0];if(!f){f=-20;break a}g=(E(f)-(k<<3)|0)+9|0}f=ja(n+8|0,j,d-q|0);if(f>>>0>4294967176){break a}o=e+4|0;p=0-l&31;f=v[n+16>>2];D=v[n+12>>2];N=v[n+8>>2];L=b+3>>>2|0;F=L+a|0;H=F+L|0;I=H+L|0;K=a+b|0;O=K-3|0;h:{if(I>>>0>=O>>>0){u=f;q=J;l=G;j=r;s=I;k=H;d=F;e=a;break h}P=1;S=v[n+24>>2];e=a;d=F;k=H;s=I;while(1){j=(m<<h>>>p<<1)+o|0;q=w[j+1|0];t[e|0]=w[j|0];j=(z<<i>>>p<<1)+o|0;l=w[j+1|0];t[d|0]=w[j|0];j=(A<<g>>>p<<1)+o|0;u=w[j+1|0];t[k|0]=w[j|0];j=(N<<D>>>p<<1)+o|0;M=w[j+1|0];t[s|0]=w[j|0];h=h+q|0;j=(m<<h>>>p<<1)+o|0;q=w[j+1|0];t[e+1|0]=w[j|0];i=i+l|0;j=(z<<i>>>p<<1)+o|0;l=w[j+1|0];t[d+1|0]=w[j|0];u=g+u|0;g=(A<<u>>>p<<1)+o|0;R=w[g+1|0];t[k+1|0]=w[g|0];D=D+M|0;g=(N<<D>>>p<<1)+o|0;M=w[g+1|0];t[s+1|0]=w[g|0];h=h+q|0;i:{if((r|0)<10){j=r;break i}j=r-(h>>>3|0)|0;g=j+c|0;m=w[g|0]|w[g+1|0]<<8|(w[g+2|0]<<16|w[g+3|0]<<24);h=h&7}i=i+l|0;j:{if((J|0)<4){q=J;break j}q=J-(i>>>3|0)|0;g=y+q|0;z=w[g|0]|w[g+1|0]<<8|(w[g+2|0]<<16|w[g+3|0]<<24);i=i&7}l=u+R|0;k:{if((G|0)<4){g=l;l=G;break k}g=l&7;l=G-(l>>>3|0)|0;u=C+l|0;A=w[u|0]|w[u+1|0]<<8|(w[u+2|0]<<16|w[u+3|0]<<24)}D=D+M|0;s=s+2|0;l:{if(f>>>0<S>>>0){u=f;break l}u=f-(D>>>3|0)|0;N=w[u|0]|w[u+1|0]<<8|(w[u+2|0]<<16|w[u+3|0]<<24);D=D&7}k=k+2|0;d=d+2|0;e=e+2|0;M=(J|0)>3;R=(G|0)>3;T=(r|0)>9;U=f>>>0>=S>>>0;r=j;G=l;J=q;f=u;P=T&(M&R)&P&U;if(P&s>>>0<O>>>0){continue}break}}v[n+16>>2]=u;v[n+12>>2]=D;v[n+8>>2]=N;if(e>>>0>F>>>0){f=-20;break a}if(d>>>0>H>>>0){f=-20;break a}f=-20;if(k>>>0>I>>>0){break a}m:{n:{o:{p:{if(h>>>0>32){break p}u=F-3|0;q:{while(1){r:{if((j|0)>=10){m=h>>>3|0;r=0;f=h&7;break r}if((j|0)==6){f=h;j=6;break q}f=h>>>3|0;r=(j-f|0)<6;m=r?j-6|0:f;f=h-(m<<3)|0}j=j-m|0;h=j+c|0;m=w[h|0]|w[h+1|0]<<8|(w[h+2|0]<<16|w[h+3|0]<<24);if(!(r|e>>>0>=u>>>0)){h=(m<<f>>>p<<1)+o|0;r=w[h+1|0];t[e|0]=w[h|0];f=f+r|0;h=(m<<f>>>p<<1)+o|0;r=w[h+1|0];t[e+1|0]=w[h|0];e=e+2|0;h=f+r|0;if(h>>>0<=32){continue}break p}break}if(f>>>0<=32){break q}h=f;break p}h=f;while(1){s:{if((j|0)>=10){m=h>>>3|0;r=0;h=h&7;break s}if((j|0)==6){j=6;break p}f=h>>>3|0;r=(j-f|0)<6;m=r?j-6|0:f;h=h-(m<<3)|0}j=j-m|0;f=j+c|0;m=w[f|0]|w[f+1|0]<<8|(w[f+2|0]<<16|w[f+3|0]<<24);f=e>>>0>=F>>>0;if(r|f){break o}f=(m<<h>>>p<<1)+o|0;r=w[f+1|0];t[e|0]=w[f|0];e=e+1|0;h=h+r|0;if(h>>>0<=32){continue}break}}if(e>>>0<F>>>0){break n}break m}if(f){break m}}c=e+1|0;if(F-e&1){f=(m<<h>>>p<<1)+o|0;r=w[f+1|0];t[e|0]=w[f|0];h=h+r|0;e=c}if((c|0)==(F|0)){break m}while(1){c=(m<<h>>>p<<1)+o|0;f=w[c+1|0];t[e|0]=w[c|0];c=f+h|0;f=(m<<c>>>p<<1)+o|0;h=w[f+1|0];t[e+1|0]=w[f|0];h=c+h|0;e=e+2|0;if((F|0)!=(e|0)){continue}break}}t:{u:{v:{w:{x:{if(i>>>0<=32){r=H-3|0;while(1){y:{if((q|0)>=4){f=i>>>3|0;e=0;c=i&7;break y}if(!q){q=0;m=y;c=i;break w}c=i>>>3|0;e=(q+y|0)-c>>>0<y>>>0;f=e?q:c;c=i-(f<<3)|0}q=q-f|0;m=y+q|0;z=w[m|0]|w[m+1|0]<<8|(w[m+2|0]<<16|w[m+3|0]<<24);if(e|d>>>0>=r>>>0){break x}e=(z<<c>>>p<<1)+o|0;f=w[e+1|0];t[d|0]=w[e|0];c=c+f|0;e=(z<<c>>>p<<1)+o|0;f=w[e+1|0];t[d+1|0]=w[e|0];d=d+2|0;i=c+f|0;if(i>>>0<33){continue}break}}m=q+y|0;break v}if(c>>>0<=32){break w}i=c;break v}i=c;while(1){z:{if((q|0)>=4){f=i>>>3|0;e=0;i=i&7;break z}if(!q){break v}c=i>>>3|0;e=m-c>>>0<y>>>0;f=e?q:c;i=i-(f<<3)|0}q=q-f|0;m=y+q|0;z=w[m|0]|w[m+1|0]<<8|(w[m+2|0]<<16|w[m+3|0]<<24);c=d>>>0>=H>>>0;if(e?1:c){if(c){break t}break u}c=(z<<i>>>p<<1)+o|0;e=w[c+1|0];t[d|0]=w[c|0];d=d+1|0;i=e+i|0;if(i>>>0<=32){continue}break}}if(d>>>0>=H>>>0){break t}}c=d+1|0;if(H-d&1){e=(z<<i>>>p<<1)+o|0;f=w[e+1|0];t[d|0]=w[e|0];i=f+i|0;d=c}if((c|0)==((L<<1)+a|0)){break t}while(1){c=(z<<i>>>p<<1)+o|0;e=w[c+1|0];t[d|0]=w[c|0];c=e+i|0;e=(z<<c>>>p<<1)+o|0;f=w[e+1|0];t[d+1|0]=w[e|0];i=c+f|0;d=d+2|0;if((H|0)!=(d|0)){continue}break}}A:{B:{C:{D:{E:{if(g>>>0<=32){q=I-3|0;while(1){F:{if((l|0)>=4){f=g>>>3|0;e=0;c=g&7;break F}if(!l){l=0;d=C;c=g;break D}c=g>>>3|0;e=(l+C|0)-c>>>0<C>>>0;f=e?l:c;c=g-(f<<3)|0}l=l-f|0;d=C+l|0;A=w[d|0]|w[d+1|0]<<8|(w[d+2|0]<<16|w[d+3|0]<<24);if(e|k>>>0>=q>>>0){break E}d=(A<<c>>>p<<1)+o|0;e=w[d+1|0];t[k|0]=w[d|0];c=c+e|0;d=(A<<c>>>p<<1)+o|0;e=w[d+1|0];t[k+1|0]=w[d|0];k=k+2|0;g=c+e|0;if(g>>>0<33){continue}break}}d=l+C|0;break C}if(c>>>0<=32){break D}g=c;break C}g=c;while(1){G:{if((l|0)>=4){f=g>>>3|0;e=0;g=g&7;break G}if(!l){break C}c=g>>>3|0;e=d-c>>>0<C>>>0;f=e?l:c;g=g-(f<<3)|0}l=l-f|0;d=C+l|0;A=w[d|0]|w[d+1|0]<<8|(w[d+2|0]<<16|w[d+3|0]<<24);c=k>>>0>=I>>>0;if(e?1:c){if(c){break A}break B}c=(A<<g>>>p<<1)+o|0;e=w[c+1|0];t[k|0]=w[c|0];k=k+1|0;g=e+g|0;if(g>>>0<=32){continue}break}}if(k>>>0>=I>>>0){break A}}c=k+1|0;if(I-k&1){e=(A<<g>>>p<<1)+o|0;f=w[e+1|0];t[k|0]=w[e|0];k=c;g=f+g|0}if((c|0)==(B(L,3)+a|0)){break A}while(1){a=(A<<g>>>p<<1)+o|0;c=w[a+1|0];t[k|0]=w[a|0];a=c+g|0;c=(A<<a>>>p<<1)+o|0;e=w[c+1|0];t[k+1|0]=w[c|0];g=a+e|0;k=k+2|0;if((I|0)!=(k|0)){continue}break}}c=v[n+12>>2];H:{I:{J:{if(c>>>0>32){break J}K:{while(1){e=n;G=e;f=v[e+16>>2];q=v[e+24>>2];L:{if(f>>>0>=q>>>0){f=f-(c>>>3|0)|0;v[n+16>>2]=f;a=0;c=c&7;break L}k=v[n+20>>2];a=f;if((k|0)==(f|0)){break K}l=c>>>3|0;a=k>>>0>f-l>>>0;k=a?f-k|0:l;f=f-k|0;v[n+16>>2]=f;c=c-(k<<3)|0}v[G+12>>2]=c;e=w[f|0]|w[f+1|0]<<8|(w[f+2|0]<<16|w[f+3|0]<<24);v[n+8>>2]=e;if(!(a|s>>>0>=O>>>0)){a=(e<<c>>>p<<1)+o|0;f=w[a+1|0];t[s|0]=w[a|0];a=c+f|0;c=(e<<a>>>p<<1)+o|0;e=w[c|0];c=a+w[c+1|0]|0;v[n+12>>2]=c;t[s+1|0]=e;s=s+2|0;if(c>>>0<=32){continue}break J}break}if(c>>>0>32){break J}a=v[n+20>>2]}k=a;while(1){e=n;M:{if(f>>>0>=q>>>0){f=f-(c>>>3|0)|0;v[n+16>>2]=f;a=0;c=c&7;break M}if((f|0)==(k|0)){break J}l=c>>>3|0;a=k>>>0>f-l>>>0;l=a?f-k|0:l;f=f-l|0;v[n+16>>2]=f;c=c-(l<<3)|0}v[e+12>>2]=c;e=w[f|0]|w[f+1|0]<<8|(w[f+2|0]<<16|w[f+3|0]<<24);v[n+8>>2]=e;l=s>>>0>=K>>>0;if(a?1:l){if(l){break H}break I}a=(e<<c>>>p<<1)+o|0;e=w[a|0];c=w[a+1|0]+c|0;v[n+12>>2]=c;t[s|0]=e;s=s+1|0;if(c>>>0<=32){continue}break}}if(s>>>0>=K>>>0){break H}e=v[n+8>>2]}a=(e<<c>>>p<<1)+o|0;e=w[a|0];v[n+12>>2]=w[a+1|0]+c;t[s|0]=e;if((K-s|0)==1){break H}a=K-2|0;if((s^-1)+K&1){c=v[n+12>>2];e=(v[n+8>>2]<<c>>>p<<1)+o|0;f=w[e|0];v[n+12>>2]=c+w[e+1|0];t[s+1|0]=f;c=s+2|0}else{c=s+1|0}if((a|0)==(s|0)){break H}while(1){a=v[n+12>>2];e=(v[n+8>>2]<<a>>>p<<1)+o|0;f=w[e|0];v[n+12>>2]=a+w[e+1|0];t[c|0]=f;a=v[n+12>>2];e=(v[n+8>>2]<<a>>>p<<1)+o|0;f=w[e|0];v[n+12>>2]=a+w[e+1|0];t[c+1|0]=f;c=c+2|0;if((K|0)!=(c|0)){continue}break}}f=(j|0)==6?(h|0)==32?(m|0)==(y|0)?(i|0)==32?(d|0)==(C|0)?(g|0)==32?v[n+16>>2]==v[n+20>>2]?v[n+12>>2]==32?b:-20:-20:-20:-20:-20:-20:-20:-20}Q=n+32|0;return f}function ia(a,b,c,d,e){var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;h=Q-144|0;Q=h;f=-44;a:{if(e>>>0<1500){break a}e=v[a>>2];m=_(d+624|0,0,108);s=e&255;if(s>>>0>12){break a}k=d+1244|0;D=na(k,m,h+8|0,h+12|0,b,c);if(D>>>0<=4294967176){q=v[h+12>>2];if(q>>>0>s>>>0){break a}z=d+732|0;G=d+676|0;A=a+4|0;H=e&-16777216;c=d+680|0;b=q;while(1){e=b;b=b-1|0;if(!v[m+(e<<2)>>2]){continue}break}b=1;o=e+1|0;b:{if(o>>>0<2){break b}i=e&3;if(e-1>>>0>=3){f=e&-4;while(1){g=b<<2;l=v[g+m>>2];v[c+g>>2]=p;n=g+4|0;r=v[n+m>>2];p=l+p|0;v[c+n>>2]=p;l=g+8|0;n=v[l+m>>2];p=p+r|0;v[c+l>>2]=p;g=g+12|0;l=v[g+m>>2];j=c+g|0;g=p+n|0;v[j>>2]=g;p=g+l|0;b=b+4|0;f=f-4|0;if(f){continue}break}}if(!i){break b}while(1){f=b<<2;g=v[f+m>>2];v[c+f>>2]=p;b=b+1|0;p=g+p|0;i=i-1|0;if(i){continue}break}}v[c>>2]=p;f=v[h+8>>2];c:{if(!f){break c}b=0;if((f|0)!=1){g=f&-2;while(1){l=w[b+k|0];n=c+(l<<2)|0;i=v[n>>2];v[n>>2]=i+1;i=(i<<1)+z|0;t[i+1|0]=l;t[i|0]=b;l=b|1;n=w[l+k|0];r=c+(n<<2)|0;i=v[r>>2];v[r>>2]=i+1;i=(i<<1)+z|0;t[i+1|0]=n;t[i|0]=l;b=b+2|0;g=g-2|0;if(g){continue}break}}if(!(f&1)){break c}f=w[b+k|0];g=c+(f<<2)|0;c=v[g>>2];v[g>>2]=c+1;c=(c<<1)+z|0;t[c+1|0]=f;t[c|0]=b}c=0;v[d+680>>2]=0;d:{if(o>>>0>=2){b=1;n=e-1|0;if(n){f=(q^-1)+s|0;k=e&-2;while(1){g=b<<2;i=v[g+m>>2];v[d+g>>2]=c;g=b+1|0;l=g<<2;r=v[l+m>>2];c=(i<<b+f)+c|0;v[d+l>>2]=c;c=c+(r<<f+g)|0;b=b+2|0;k=k-2|0;if(k){continue}break}}if(e&1){v[(b<<2)+d>>2]=c}l=q+1|0;q=l-e|0;i=(s-q|0)+1|0;if(o>>>0<2|i>>>0<=q>>>0){break d}c=e&-4;k=e&3;e=q;while(1){f=1;g=c;if(n>>>0>=3){while(1){m=B(e,52)+d|0;b=f<<2;v[m+b>>2]=v[b+d>>2]>>>e;o=b+4|0;v[o+m>>2]=v[d+o>>2]>>>e;o=b+8|0;v[o+m>>2]=v[d+o>>2]>>>e;b=b+12|0;v[b+m>>2]=v[b+d>>2]>>>e;f=f+4|0;g=g-4|0;if(g){continue}break}}b=k;if(b){while(1){g=f<<2;v[g+(B(e,52)+d|0)>>2]=v[d+g>>2]>>>e;f=f+1|0;b=b-1|0;if(b){continue}break}}e=e+1|0;if(i>>>0>e>>>0){continue}break}break d}l=q+1|0;q=l-e|0}v[h- -64>>2]=v[d+48>>2];b=v[d+44>>2];v[h+56>>2]=v[d+40>>2];v[h+60>>2]=b;b=v[d+36>>2];v[h+48>>2]=v[d+32>>2];v[h+52>>2]=b;b=v[d+28>>2];v[h+40>>2]=v[d+24>>2];v[h+44>>2]=b;b=v[d+20>>2];v[h+32>>2]=v[d+16>>2];v[h+36>>2]=b;b=v[d+4>>2];v[h+16>>2]=v[d>>2];v[h+20>>2]=b;b=v[d+12>>2];v[h+24>>2]=v[d+8>>2];v[h+28>>2]=b;if(p){I=l-s|0;n=0;while(1){b=(n<<1)+z|0;c=w[b+1|0];m=l-c|0;o=s-m|0;r=1<<o;C=w[b|0];E=(h+16|0)+(c<<2)|0;k=v[E>>2];e:{if(o>>>0>=q>>>0){c=m+I|0;e=((c|0)>1?c:1)<<2;x=v[e+G>>2];b=B(m,52)+d|0;v[h+128>>2]=v[b+48>>2];f=v[b+44>>2];v[h+120>>2]=v[b+40>>2];v[h+124>>2]=f;f=v[b+36>>2];v[h+112>>2]=v[b+32>>2];v[h+116>>2]=f;f=v[b+28>>2];v[h+104>>2]=v[b+24>>2];v[h+108>>2]=f;f=v[b+20>>2];v[h+96>>2]=v[b+16>>2];v[h+100>>2]=f;f=v[b+12>>2];v[h+88>>2]=v[b+8>>2];v[h+92>>2]=f;f=v[b+4>>2];v[h+80>>2]=v[b>>2];v[h+84>>2]=f;F=p-x|0;f=(k<<2)+A|0;f:{if((c|0)<2){break f}e=v[e+(h+80|0)>>2];if(!e){break f}b=m<<16&16711680|C|16777216;g=e&7;c=0;if(e-1>>>0>=7){i=e&-8;while(1){e=c<<2;j=e+f|0;u[j>>1]=b;y=b>>>16|0;u[j+2>>1]=y;j=f+(e|4)|0;u[j>>1]=b;u[j+2>>1]=y;j=f+(e|8)|0;u[j>>1]=b;u[j+2>>1]=y;j=f+(e|12)|0;u[j>>1]=b;u[j+2>>1]=y;j=f+(e|16)|0;u[j>>1]=b;u[j+2>>1]=y;j=f+(e|20)|0;u[j>>1]=b;u[j+2>>1]=y;j=f+(e|24)|0;u[j>>1]=b;u[j+2>>1]=y;e=f+(e|28)|0;u[e>>1]=b;u[e+2>>1]=y;c=c+8|0;i=i-8|0;if(i){continue}break}}if(!g){break f}while(1){e=f+(c<<2)|0;u[e>>1]=b;u[e+2>>1]=b>>>16;c=c+1|0;g=g-1|0;if(g){continue}break}}if(F){i=(x<<1)+z|0;g=0;while(1){x=i+(g<<1)|0;c=w[x+1|0];b=l-c|0;j=(h+80|0)+(c<<2)|0;e=v[j>>2];c=e+(1<<o-b)|0;b=b+m<<16&16711680|(w[x|0]<<8|C)|33554432;while(1){x=f+(e<<2)|0;u[x>>1]=b;u[x+2>>1]=b>>>16;e=e+1|0;if(c>>>0>e>>>0){continue}break}v[j>>2]=c;g=g+1|0;if((F|0)!=(g|0)){continue}break}}b=k+r|0;break e}b=k+r|0;if(k>>>0>=b>>>0){break e}c=m<<16&16711680|C|16777216;if(o>>>0<=2){f=r&7;while(1){e=(k<<2)+A|0;u[e>>1]=c;u[e+2>>1]=c>>>16;k=k+1|0;f=f-1|0;if(f){continue}break}}if(o>>>0<3){break e}while(1){e=(k<<2)+A|0;u[e>>1]=c;f=c>>>16|0;u[e+2>>1]=f;u[e+28>>1]=c;u[e+30>>1]=f;u[e+24>>1]=c;u[e+26>>1]=f;u[e+20>>1]=c;u[e+22>>1]=f;u[e+16>>1]=c;u[e+18>>1]=f;u[e+12>>1]=c;u[e+14>>1]=f;u[e+8>>1]=c;u[e+10>>1]=f;u[e+4>>1]=c;u[e+6>>1]=f;k=k+8|0;if((k|0)!=(b|0)){continue}break}}v[E>>2]=b;n=n+1|0;if((p|0)!=(n|0)){continue}break}}v[a>>2]=s<<16|H|s|256}f=D}Q=h+144|0;return f}function ha(a,b,c,d,e,f,g,h){var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;n=-70;l=v[c+4>>2];j=v[c>>2];p=l+j|0;a:{if(p>>>0>b-a>>>0){break a}n=-20;i=v[d>>2];if(j>>>0>e-i>>>0){break a}e=b-32|0;q=i+j|0;b=a+j|0;o=v[c+8>>2];b:{if((j|0)<=7){if((j|0)<=0){break b}while(1){t[a|0]=w[i|0];i=i+1|0;a=a+1|0;if(b>>>0>a>>>0){continue}break}break b}if(b>>>0<=e>>>0){while(1){j=w[i+4|0]|w[i+5|0]<<8|(w[i+6|0]<<16|w[i+7|0]<<24);k=w[i|0]|w[i+1|0]<<8|(w[i+2|0]<<16|w[i+3|0]<<24);t[a|0]=k;t[a+1|0]=k>>>8;t[a+2|0]=k>>>16;t[a+3|0]=k>>>24;t[a+4|0]=j;t[a+5|0]=j>>>8;t[a+6|0]=j>>>16;t[a+7|0]=j>>>24;j=w[i+12|0]|w[i+13|0]<<8|(w[i+14|0]<<16|w[i+15|0]<<24);k=w[i+8|0]|w[i+9|0]<<8|(w[i+10|0]<<16|w[i+11|0]<<24);t[a+8|0]=k;t[a+9|0]=k>>>8;t[a+10|0]=k>>>16;t[a+11|0]=k>>>24;t[a+12|0]=j;t[a+13|0]=j>>>8;t[a+14|0]=j>>>16;t[a+15|0]=j>>>24;i=i+16|0;a=a+16|0;if(b>>>0>a>>>0){continue}break b}}if(a>>>0<=e>>>0){r=e-a|0;j=i;while(1){k=w[j+4|0]|w[j+5|0]<<8|(w[j+6|0]<<16|w[j+7|0]<<24);m=w[j|0]|w[j+1|0]<<8|(w[j+2|0]<<16|w[j+3|0]<<24);t[a|0]=m;t[a+1|0]=m>>>8;t[a+2|0]=m>>>16;t[a+3|0]=m>>>24;t[a+4|0]=k;t[a+5|0]=k>>>8;t[a+6|0]=k>>>16;t[a+7|0]=k>>>24;k=w[j+12|0]|w[j+13|0]<<8|(w[j+14|0]<<16|w[j+15|0]<<24);m=w[j+8|0]|w[j+9|0]<<8|(w[j+10|0]<<16|w[j+11|0]<<24);t[a+8|0]=m;t[a+9|0]=m>>>8;t[a+10|0]=m>>>16;t[a+11|0]=m>>>24;t[a+12|0]=k;t[a+13|0]=k>>>8;t[a+14|0]=k>>>16;t[a+15|0]=k>>>24;j=j+16|0;a=a+16|0;if(e>>>0>a>>>0){continue}break}i=i+r|0;a=e}if(a>>>0>=b>>>0){break b}while(1){t[a|0]=w[i|0];i=i+1|0;a=a+1|0;if(b>>>0>a>>>0){continue}break}}a=b-o|0;v[d>>2]=q;c:{d:{if(b-f>>>0<o>>>0){if(b-g>>>0<o>>>0){break a}a=a-f|0;d=a+h|0;if(d+l>>>0<=h>>>0){Z(b,d,l);break c}b=Z(b,d,0-a|0);l=a+l|0;v[c+4>>2]=l;b=b-a|0;break d}f=a}c=b+l|0;if((l|0)<=7){if((l|0)<=0){break c}while(1){t[b|0]=w[f|0];f=f+1|0;b=b+1|0;if(c>>>0>b>>>0){continue}break}break c}a=b-f|0;e:{if(a>>>0<=7){t[b|0]=w[f|0];t[b+1|0]=w[f+1|0];t[b+2|0]=w[f+2|0];t[b+3|0]=w[f+3|0];d=f;f=a<<2;a=d+v[f+4752>>2]|0;d=w[a|0]|w[a+1|0]<<8|(w[a+2|0]<<16|w[a+3|0]<<24);t[b+4|0]=d;t[b+5|0]=d>>>8;t[b+6|0]=d>>>16;t[b+7|0]=d>>>24;f=a-v[f+4784>>2]|0;break e}a=w[f+4|0]|w[f+5|0]<<8|(w[f+6|0]<<16|w[f+7|0]<<24);d=w[f|0]|w[f+1|0]<<8|(w[f+2|0]<<16|w[f+3|0]<<24);t[b|0]=d;t[b+1|0]=d>>>8;t[b+2|0]=d>>>16;t[b+3|0]=d>>>24;t[b+4|0]=a;t[b+5|0]=a>>>8;t[b+6|0]=a>>>16;t[b+7|0]=a>>>24}a=b+8|0;i=f+8|0;if(c>>>0<=e>>>0){d=a+l|0;if((a-i|0)<=15){while(1){b=w[i+4|0]|w[i+5|0]<<8|(w[i+6|0]<<16|w[i+7|0]<<24);c=w[i|0]|w[i+1|0]<<8|(w[i+2|0]<<16|w[i+3|0]<<24);t[a|0]=c;t[a+1|0]=c>>>8;t[a+2|0]=c>>>16;t[a+3|0]=c>>>24;t[a+4|0]=b;t[a+5|0]=b>>>8;t[a+6|0]=b>>>16;t[a+7|0]=b>>>24;i=i+8|0;a=a+8|0;if(d>>>0>a>>>0){continue}break c}}while(1){b=w[i+4|0]|w[i+5|0]<<8|(w[i+6|0]<<16|w[i+7|0]<<24);c=w[i|0]|w[i+1|0]<<8|(w[i+2|0]<<16|w[i+3|0]<<24);t[a|0]=c;t[a+1|0]=c>>>8;t[a+2|0]=c>>>16;t[a+3|0]=c>>>24;t[a+4|0]=b;t[a+5|0]=b>>>8;t[a+6|0]=b>>>16;t[a+7|0]=b>>>24;b=w[i+12|0]|w[i+13|0]<<8|(w[i+14|0]<<16|w[i+15|0]<<24);c=w[i+8|0]|w[i+9|0]<<8|(w[i+10|0]<<16|w[i+11|0]<<24);t[a+8|0]=c;t[a+9|0]=c>>>8;t[a+10|0]=c>>>16;t[a+11|0]=c>>>24;t[a+12|0]=b;t[a+13|0]=b>>>8;t[a+14|0]=b>>>16;t[a+15|0]=b>>>24;i=i+16|0;a=a+16|0;if(d>>>0>a>>>0){continue}break}break c}f:{if(a>>>0>e>>>0){e=a;break f}g=e-a|0;g:{if((a-i|0)<=15){b=i;while(1){d=w[b+4|0]|w[b+5|0]<<8|(w[b+6|0]<<16|w[b+7|0]<<24);f=w[b|0]|w[b+1|0]<<8|(w[b+2|0]<<16|w[b+3|0]<<24);t[a|0]=f;t[a+1|0]=f>>>8;t[a+2|0]=f>>>16;t[a+3|0]=f>>>24;t[a+4|0]=d;t[a+5|0]=d>>>8;t[a+6|0]=d>>>16;t[a+7|0]=d>>>24;b=b+8|0;a=a+8|0;if(e>>>0>a>>>0){continue}break}break g}b=i;while(1){d=w[b+4|0]|w[b+5|0]<<8|(w[b+6|0]<<16|w[b+7|0]<<24);f=w[b|0]|w[b+1|0]<<8|(w[b+2|0]<<16|w[b+3|0]<<24);t[a|0]=f;t[a+1|0]=f>>>8;t[a+2|0]=f>>>16;t[a+3|0]=f>>>24;t[a+4|0]=d;t[a+5|0]=d>>>8;t[a+6|0]=d>>>16;t[a+7|0]=d>>>24;d=w[b+12|0]|w[b+13|0]<<8|(w[b+14|0]<<16|w[b+15|0]<<24);f=w[b+8|0]|w[b+9|0]<<8|(w[b+10|0]<<16|w[b+11|0]<<24);t[a+8|0]=f;t[a+9|0]=f>>>8;t[a+10|0]=f>>>16;t[a+11|0]=f>>>24;t[a+12|0]=d;t[a+13|0]=d>>>8;t[a+14|0]=d>>>16;t[a+15|0]=d>>>24;b=b+16|0;a=a+16|0;if(e>>>0>a>>>0){continue}break}}i=g+i|0}if(c>>>0<=e>>>0){break c}while(1){t[e|0]=w[i|0];i=i+1|0;e=e+1|0;if(c>>>0>e>>>0){continue}break}}n=p}return n}function ca(a,b,c,d,e){var f=0,g=0,h=0;h=v[a+28804>>2];g=v[a+28744>>2];a:{if(h-3>>>0>=2){break a}g=v[a+28744>>2];if(v[a+28800>>2]){break a}f=e>>>0>1?e:1;g=v[a+28744>>2];g=f>>>0<g>>>0?f:g}f=-72;b:{c:{d:{if((e|0)!=(g|0)){break d}e:{if(!c){break e}f=v[a+28728>>2];if((f|0)==(b|0)){break e}v[a+28740>>2]=f;v[a+28728>>2]=b;g=v[a+28732>>2];v[a+28732>>2]=b;v[a+28736>>2]=(g-f|0)+b}f=-1;f:{g:{h:{i:{j:{switch(h|0){case 0:f=1;k:{if(v[a+28908>>2]){break k}f=5;if(((w[d|0]|w[d+1|0]<<8|(w[d+2|0]<<16|w[d+3|0]<<24))&-16)!=407710288){break k}X(a+160144|0,d,e);v[a+28804>>2]=6;v[a+28744>>2]=8-e;break b}if(e>>>0<f>>>0){v[a+28904>>2]=-72;return-72}b=w[(d+f|0)-1|0];c=b&32;f=(!c+(v[(b>>>4&12)+4736>>2]+(v[((b&3)<<2)+4720>>2]+f|0)|0)|0)+(c>>>5&b>>>0<64)|0;v[a+28904>>2]=f;if(f>>>0>4294967176){break d}X(a+160144|0,d,e);v[a+28804>>2]=1;v[a+28744>>2]=f-e;break b;case 1:b=a+160144|0;X(b+(v[a+28904>>2]-e|0)|0,d,e);b=aa(a+28752|0,b,v[a+28904>>2],v[a+28908>>2]);if(b>>>0>4294967176){return b}f=-72;if(b){break d}b=v[a+28780>>2];if(b){f=-32;if((b|0)!=v[a+28952>>2]){break d}}if(v[a+28784>>2]){v[a+28816>>2]=0;v[a+28820>>2]=0;b=a+28856|0;v[b>>2]=0;v[b+4>>2]=0;b=a+28848|0;v[b>>2]=2048144761;v[b+4>>2]=1640531534;b=a+28840|0;v[b>>2]=0;v[b+4>>2]=0;b=a+28832|0;v[b>>2]=668265295;v[b+4>>2]=-1028477379;b=a+28824|0;v[b>>2]=-1379879466;v[b+4>>2]=1625958382;b=a+28864|0;v[b>>2]=0;v[b+4>>2]=0;b=a+28872|0;v[b>>2]=0;v[b+4>>2]=0;b=a+28880|0;v[b>>2]=0;v[b+4>>2]=0;b=a+28888|0;v[b>>2]=0;v[b+4>>2]=0}break c;case 2:c=w[d|0]|w[d+1|0]<<8;e=c&1;d=c|w[d+2|0]<<16;b=d>>>3|0;f=-20;l:{m:{n:{o:{c=c>>>1&3;switch(c-1|0){case 0:break o;case 2:break d;default:break n}}if(!v[a+28768>>2]){break d}v[a+28932>>2]=b;v[a+28800>>2]=1;v[a+28744>>2]=1;break m}if(b>>>0>y[a+28768>>2]){break d}v[a+28932>>2]=b;v[a+28800>>2]=c;v[a+28744>>2]=b;if(d>>>0<8){break l}}v[a+28804>>2]=e?4:3;break b}if(e){if(!v[a+28784>>2]){break i}v[a+28804>>2]=5;v[a+28744>>2]=4;break b}break c;case 3:case 4:f=-20;p:{q:{switch(v[a+28800>>2]){case 2:f=qa(a,b,c,d,e);break p;case 0:if(!b){f=-74;if(e){break d}break g}f=-70;if(c>>>0<e>>>0){break d}X(b,d,e);if(e>>>0<=4294967176){break g}return e;case 1:break q;default:break d}}e=v[a+28932>>2];f=e?-74:0;if(!b){break p}f=-70;if(c>>>0<e>>>0){break p}_(b,w[d|0],e);f=e}g=0;v[a+28744>>2]=0;if(f>>>0>4294967176){break d}break f;case 6:break h;case 7:break i;case 5:break j;default:break d}}f=-22;if((w[d|0]|w[d+1|0]<<8|(w[d+2|0]<<16|w[d+3|0]<<24))!=(oa(a+28816|0)|0)){break d}}f=0;v[a+28804>>2]=0;v[a+28744>>2]=0;break d}X((a-e|0)+160152|0,d,e);v[a+28804>>2]=7;b=a;a=a+160148|0;v[b+28744>>2]=w[a|0]|w[a+1|0]<<8|(w[a+2|0]<<16|w[a+3|0]<<24);break b}g=v[a+28744>>2]-e|0;v[a+28744>>2]=g;f=e}c=f;if(c>>>0>y[a+28768>>2]){return-20}f=v[a+28796>>2];e=c;h=e+v[a+28792>>2]|0;f=h>>>0<e>>>0?f+1|0:f;v[a+28792>>2]=h;v[a+28796>>2]=f;if(v[a+28784>>2]){pa(a+28816|0,b,c);g=v[a+28744>>2]}v[a+28728>>2]=b+c;if(g){return c}if(v[a+28804>>2]==4){b=v[a+28756>>2];d=b;e=v[a+28752>>2];if((e|0)!=-1|(b|0)!=-1){f=-20;if((e|0)!=v[a+28792>>2]|(d|0)!=v[a+28796>>2]){break d}}if(v[a+28784>>2]){v[a+28804>>2]=5;v[a+28744>>2]=4;return c}v[a+28804>>2]=0;v[a+28744>>2]=0;return c}v[a+28744>>2]=3;v[a+28804>>2]=2;return c}return f}v[a+28804>>2]=2;v[a+28744>>2]=3}return 0}function pa(a,b,c){var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;e=v[a+4>>2];h=c+v[a>>2]|0;v[a>>2]=h;v[a+4>>2]=c>>>0>h>>>0?e+1|0:e;d=v[a+72>>2];f=d+c|0;a:{b:{if(f>>>0<=31){if(!b){break b}X((a+d|0)+40|0,b,c);f=v[a+72>>2]+c|0;break b}j=b+c|0;if(d){X(d+(a+40|0)|0,b,32-d|0);h=v[a+72>>2];v[a+72>>2]=0;f=v[a+12>>2];c=v[a+8>>2];i=Ga(w[a+40|0]|w[a+41|0]<<8|(w[a+42|0]<<16|w[a+43|0]<<24),w[a+44|0]|w[a+45|0]<<8|(w[a+46|0]<<16|w[a+47|0]<<24),668265295,-1028477379);d=c+i|0;e=R+f|0;v[a+8>>2]=Ga(Ha(d,d>>>0<i>>>0?e+1|0:e,31),R,-2048144761,-1640531535);v[a+12>>2]=R;d=v[a+20>>2];c=v[a+16>>2];e=Ga(w[a+48|0]|w[a+49|0]<<8|(w[a+50|0]<<16|w[a+51|0]<<24),w[a+52|0]|w[a+53|0]<<8|(w[a+54|0]<<16|w[a+55|0]<<24),668265295,-1028477379);f=c+e|0;d=R+d|0;v[a+16>>2]=Ga(Ha(f,e>>>0>f>>>0?d+1|0:d,31),R,-2048144761,-1640531535);v[a+20>>2]=R;d=v[a+28>>2];c=v[a+24>>2];e=Ga(w[a+56|0]|w[a+57|0]<<8|(w[a+58|0]<<16|w[a+59|0]<<24),w[a+60|0]|w[a+61|0]<<8|(w[a+62|0]<<16|w[a+63|0]<<24),668265295,-1028477379);f=c+e|0;d=R+d|0;v[a+24>>2]=Ga(Ha(f,e>>>0>f>>>0?d+1|0:d,31),R,-2048144761,-1640531535);v[a+28>>2]=R;f=v[a+36>>2];c=v[a+32>>2];d=a- -64|0;i=Ga(w[d|0]|w[d+1|0]<<8|(w[d+2|0]<<16|w[d+3|0]<<24),w[d+4|0]|w[d+5|0]<<8|(w[d+6|0]<<16|w[d+7|0]<<24),668265295,-1028477379);d=c+i|0;e=R+f|0;v[a+32>>2]=Ga(Ha(d,d>>>0<i>>>0?e+1|0:e,31),R,-2048144761,-1640531535);v[a+36>>2]=R;b=(b-h|0)+32|0}if(j>>>0>=b+32>>>0){n=j-32|0;c=v[a+32>>2];i=v[a+36>>2];d=v[a+24>>2];k=v[a+28>>2];f=v[a+16>>2];l=v[a+20>>2];h=v[a+8>>2];m=v[a+12>>2];while(1){g=Ga(w[b+24|0]|w[b+25|0]<<8|(w[b+26|0]<<16|w[b+27|0]<<24),w[b+28|0]|w[b+29|0]<<8|(w[b+30|0]<<16|w[b+31|0]<<24),668265295,-1028477379)+c|0;e=i+R|0;c=Ga(Ha(g,c>>>0>g>>>0?e+1|0:e,31),R,-2048144761,-1640531535);i=R;g=Ga(w[b+16|0]|w[b+17|0]<<8|(w[b+18|0]<<16|w[b+19|0]<<24),w[b+20|0]|w[b+21|0]<<8|(w[b+22|0]<<16|w[b+23|0]<<24),668265295,-1028477379)+d|0;e=k+R|0;d=Ga(Ha(g,d>>>0>g>>>0?e+1|0:e,31),R,-2048144761,-1640531535);k=R;g=Ga(w[b+8|0]|w[b+9|0]<<8|(w[b+10|0]<<16|w[b+11|0]<<24),w[b+12|0]|w[b+13|0]<<8|(w[b+14|0]<<16|w[b+15|0]<<24),668265295,-1028477379)+f|0;e=l+R|0;f=Ga(Ha(g,f>>>0>g>>>0?e+1|0:e,31),R,-2048144761,-1640531535);l=R;g=Ga(w[b|0]|w[b+1|0]<<8|(w[b+2|0]<<16|w[b+3|0]<<24),w[b+4|0]|w[b+5|0]<<8|(w[b+6|0]<<16|w[b+7|0]<<24),668265295,-1028477379)+h|0;e=m+R|0;h=Ga(Ha(g,g>>>0<h>>>0?e+1|0:e,31),R,-2048144761,-1640531535);m=R;b=b+32|0;if(n>>>0>=b>>>0){continue}break}v[a+32>>2]=c;v[a+36>>2]=i;v[a+24>>2]=d;v[a+28>>2]=k;v[a+16>>2]=f;v[a+20>>2]=l;v[a+8>>2]=h;v[a+12>>2]=m}if(b>>>0>=j>>>0){break a}f=j-b|0;X(a+40|0,b,f)}v[a+72>>2]=f}}function oa(a){var b=0,c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=a+40|0;i=v[a+72>>2];g=f+i|0;b=v[a+4>>2];n=b;e=v[a>>2];a:{if(!b&e>>>0>=32|b){b=v[a+20>>2];o=b;j=v[a+16>>2];b=Ha(j,b,7);c=R;d=v[a+12>>2];p=d;k=v[a+8>>2];d=Ha(k,d,1);b=d+b|0;c=R+c|0;c=b>>>0<d>>>0?c+1|0:c;d=v[a+28>>2];q=d;l=v[a+24>>2];h=Ha(l,d,12);d=h+b|0;b=R+c|0;b=d>>>0<h>>>0?b+1|0:b;c=d;d=v[a+36>>2];h=d;m=v[a+32>>2];d=Ha(m,d,18);c=d+c|0;b=R+b|0;b=Ga(Ga(Ha(Ga(k,p,668265295,-1028477379),R,31),R,-2048144761,-1640531535)^c,R^(c>>>0<d>>>0?b+1|0:b),-2048144761,-1640531535);c=b-1028477341|0;b=R-((b>>>0<1028477341)+2048144776|0)|0;b=Ga(Ga(Ha(Ga(j,o,668265295,-1028477379),R,31),R,-2048144761,-1640531535)^c,R^b,-2048144761,-1640531535);c=b-1028477341|0;b=R-((b>>>0<1028477341)+2048144776|0)|0;b=Ga(Ga(Ha(Ga(l,q,668265295,-1028477379),R,31),R,-2048144761,-1640531535)^c,R^b,-2048144761,-1640531535);c=b-1028477341|0;b=R-((b>>>0<1028477341)+2048144776|0)|0;b=Ga(Ga(Ha(Ga(m,h,668265295,-1028477379),R,31),R,-2048144761,-1640531535)^c,R^b,-2048144761,-1640531535);c=b-1028477341|0;b=R-((b>>>0<1028477341)+2048144776|0)|0;break a}b=v[a+28>>2]+668265263|0;c=v[a+24>>2]+374761413|0;b=c>>>0<374761413?b+1|0:b}d=c+e|0;c=b+n|0;c=d>>>0<e>>>0?c+1|0:c;e=a+48|0;b:{if(g>>>0<e>>>0){b=f;break b}while(1){b=Ga(Ha(Ga(Ha(Ga(w[f|0]|w[f+1|0]<<8|(w[f+2|0]<<16|w[f+3|0]<<24),w[f+4|0]|w[f+5|0]<<8|(w[f+6|0]<<16|w[f+7|0]<<24),668265295,-1028477379),R,31),R,-2048144761,-1640531535)^d,c^R,27),R,-2048144761,-1640531535);d=b-1028477341|0;c=R-((b>>>0<1028477341)+2048144776|0)|0;b=e;f=b;e=b+8|0;if(g>>>0>=e>>>0){continue}break}}e=b+4|0;c:{if(g>>>0<e>>>0){e=b;break c}c=Ga(Ha(Ga(w[b|0]|w[b+1|0]<<8|(w[b+2|0]<<16|w[b+3|0]<<24),0,-2048144761,-1640531535)^d,c^R,23),R,668265295,-1028477379)-1640531463|0;b=R+374761393|0;d=c;c=c>>>0<2654435833?b+1|0:b}d:{if(e>>>0>=g>>>0){break d}a=a+i|0;f=a+39|0;a=a+40|0;if(a-e&1){d=Ga(Ha(Ga(w[e|0],0,374761413,668265263)^d,c^R,11),R,-2048144761,-1640531535);c=R;b=e+1|0}else{b=e}if((e|0)==(f|0)){break d}while(1){e=Ga(w[b+1|0],0,374761413,668265263);f=R;d=Ga(Ha(Ga(Ha(Ga(w[b|0],0,374761413,668265263)^d,c^R,11),R,-2048144761,-1640531535)^e,R^f,11),R,-2048144761,-1640531535);c=R;b=b+2|0;if((a|0)!=(b|0)){continue}break}}a=Ga(d^c>>>1,c,668265295,-1028477379);c=R;b=a;a=Ga(((c&536870911)<<3|b>>>29)^b,c^c>>>29,-1640531463,374761393);b=R;R=b;return a^b}function aa(a,b,c,d){var e=0,f=0,g=0,h=0,i=0,j=0,k=0;v[a>>2]=0;v[a+4>>2]=0;v[a+32>>2]=0;v[a+36>>2]=0;v[a+24>>2]=0;v[a+28>>2]=0;v[a+16>>2]=0;v[a+20>>2]=0;v[a+8>>2]=0;v[a+12>>2]=0;f=d?1:5;if(f>>>0>c>>>0){return f}if(!b){return-1}e=1;a:{b:{c:{d:{e:{f:{g:{h:{if((d|0)==1){d=b;if(c){break h}d=-72;break g}e=w[b|0]|w[b+1|0]<<8|(w[b+2|0]<<16|w[b+3|0]<<24);if((e|0)!=-47205080){break f}e=f;d=(b+f|0)-1|0}g=w[d|0];d=g&32;d=(!d+(v[(g>>>4&12)+4736>>2]+(v[((g&3)<<2)+4720>>2]+e|0)|0)|0)+(d>>>5&g>>>0<64)|0}if(d>>>0>c>>>0){break a}v[a+24>>2]=d;d=-14;c=b+f|0;g=w[c-1|0];if(g&8){break a}i=g&32;if(!i){d=-16;c=w[c|0];if(c>>>0>167){break a}d=c&7;c=(c>>>3|0)+10|0;h=c&31;if((c&63)>>>0>=32){e=1<<h;c=0}else{c=1<<h;e=c-1&1>>>32-h}d=Ga(d,0,(e&7)<<29|c>>>3,e>>>3|0)+c|0;h=e+R|0;h=c>>>0>d>>>0?h+1|0:h;j=d;f=f+1|0}k=g>>>6|0;e=g>>>2|0;d=0;switch((g&3)-1|0){case 2:break c;case 1:break d;case 0:break e;default:break b}}d=-10;if((e&-16)!=407710288){break a}d=8;if(c>>>0<8){break a}b=w[b+4|0]|w[b+5|0]<<8|(w[b+6|0]<<16|w[b+7|0]<<24);v[a+20>>2]=1;v[a>>2]=b;v[a+4>>2]=0;return 0}d=w[b+f|0];f=f+1|0;break b}c=b+f|0;d=w[c|0]|w[c+1|0]<<8;f=f+2|0;break b}c=b+f|0;d=w[c|0]|w[c+1|0]<<8|(w[c+2|0]<<16|w[c+3|0]<<24);f=f+4|0}g=e&1;i:{j:{switch(k-1|0){default:e=-1;c=-1;if(!i){break i}e=w[b+f|0];c=0;break i;case 0:c=0;b=b+f|0;b=(w[b|0]|w[b+1|0]<<8)+256|0;c=b>>>0<256?1:c;e=b;break i;case 1:b=b+f|0;e=w[b|0]|w[b+1|0]<<8|(w[b+2|0]<<16|w[b+3|0]<<24);c=0;break i;case 2:break j}}b=b+f|0;e=w[b|0]|w[b+1|0]<<8|(w[b+2|0]<<16|w[b+3|0]<<24);c=w[b+4|0]|w[b+5|0]<<8|(w[b+6|0]<<16|w[b+7|0]<<24)}v[a+32>>2]=g;v[a+28>>2]=d;b=e;v[a>>2]=b;v[a+4>>2]=c;d=0;v[a+20>>2]=0;e=i?b:j;v[a+8>>2]=e;b=i?c:h;v[a+12>>2]=b;v[a+16>>2]=!b&e>>>0<131072?e:131072}return d}function la(a,b,c,d,e){var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;if(!d){return-72}i=x[e+2>>1];a:{b:{c:{if(d>>>0>=4){g=w[(c+d|0)-1|0];f=-1;if(!g){break a}if(d>>>0<=4294967176){break c}return d}h=w[c|0];d:{switch(d-2|0){case 1:h=w[c+2|0]<<16|h;case 0:h=(w[c+1|0]<<8)+h|0;break;default:break d}}f=w[(c+d|0)-1|0];if(!f){return-20}f=(E(f)-(d<<3)|0)+9|0;d=0;break b}f=E(g)-23|0;d=d-4|0;g=d+c|0;h=w[g|0]|w[g+1|0]<<8|(w[g+2|0]<<16|w[g+3|0]<<24)}k=e+4|0;l=a+b|0;i=0-i&31;e:{f:{g:{h:{i:{if(f>>>0>32){break i}j=l-3|0;while(1){j:{if((d|0)>=4){e=f&7;h=f>>>3|0;f=0;break j}if(!d){d=0;g=c;break h}e=f;g=f>>>3|0;f=(c+d|0)-g>>>0<c>>>0;h=f?d:g;e=e-(h<<3)|0}d=d-h|0;g=d+c|0;h=w[g|0]|w[g+1|0]<<8|(w[g+2|0]<<16|w[g+3|0]<<24);if(!(f?0:a>>>0<j>>>0)){f=e;break i}f=(h<<e>>>i<<1)+k|0;m=w[f+1|0];t[a|0]=w[f|0];e=e+m|0;f=(h<<e>>>i<<1)+k|0;m=w[f+1|0];t[a+1|0]=w[f|0];a=a+2|0;f=e+m|0;if(f>>>0<=32){continue}break}break g}g=c+d|0;if(f>>>0>32){break g}}while(1){k:{if((d|0)>=4){e=f&7;h=f>>>3|0;f=0;break k}if(!d){break g}e=f;h=g;g=f>>>3|0;f=h-g>>>0<c>>>0;h=f?d:g;e=e-(h<<3)|0}d=d-h|0;g=d+c|0;h=w[g|0]|w[g+1|0]<<8|(w[g+2|0]<<16|w[g+3|0]<<24);j=a>>>0>=l>>>0;if(f?1:j){f=e;if(!j){break f}break e}f=(h<<e>>>i<<1)+k|0;j=w[f+1|0];t[a|0]=w[f|0];a=a+1|0;f=e+j|0;if(f>>>0<=32){continue}break}}if(a>>>0>=l>>>0){break e}}d=a+1|0;if(l-a&1){e=(h<<f>>>i<<1)+k|0;j=w[e+1|0];t[a|0]=w[e|0];f=f+j|0;a=d}if((d|0)==(l|0)){break e}while(1){d=(h<<f>>>i<<1)+k|0;e=w[d+1|0];t[a|0]=w[d|0];d=e+f|0;e=(h<<d>>>i<<1)+k|0;f=w[e+1|0];t[a+1|0]=w[e|0];f=d+f|0;a=a+2|0;if((l|0)!=(a|0)){continue}break}}f=(c|0)!=(g|0)?-20:(f|0)!=32?-20:b}return f}function ea(a){var b=0,c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;i=8;a:{b:{if(a>>>0>4294967239){break b}while(1){i=i>>>0>8?i:8;b=v[1467];h=b;e=v[1466];g=e;a=a>>>0>8?a+3&-4:8;c:{if(a>>>0<=127){f=(a>>>3|0)-1|0;break c}c=E(a);f=((a>>>29-c^4)-(c<<2)|0)+110|0;if(a>>>0<=4095){break c}c=((a>>>30-c^2)-(c<<1)|0)+71|0;f=c>>>0<63?c:63}d=f;c=d&31;if((d&63)>>>0>=32){d=0;b=b>>>c|0}else{d=b>>>c|0;b=((1<<c)-1&b)<<32-c|g>>>c}c=d;if(b|c){while(1){h=b;d=c;d:{if(c|b){e=d-1|0;j=e+1|0;g=e;e=b-1|0;g=(e|0)!=-1?j:g;e=E(b^e)+32|0;b=E(d^g);b=(b|0)==32?e:b;d=63-b|0;R=0-(b>>>0>63)|0;break d}R=0;d=64}e=d;d=e;b=d&31;if((d&63)>>>0>=32){d=0;h=c>>>b|0}else{d=c>>>b|0;h=((1<<b)-1&c)<<32-b|h>>>b}c=d;f=e+f|0;e=f<<4;d=v[e+4840>>2];g=e+4832|0;e:{if((d|0)!=(g|0)){b=da(d,i,a);if(b){break b}b=v[d+4>>2];v[b+8>>2]=v[d+8>>2];v[v[d+8>>2]+4>>2]=b;v[d+8>>2]=g;b=e+4836|0;v[d+4>>2]=v[b>>2];v[b>>2]=d;v[v[d+4>>2]+8>>2]=d;f=f+1|0;b=(c&1)<<31|h>>>1;c=c>>>1|0;break e}b=v[1467];v[1466]=v[1466]&Ha(-2,-1,f);v[1467]=R&b;b=h^1}if(b|c){continue}break}e=v[1466];h=v[1467]}f:{if(e|h){c=E(h);g=63-((c|0)==32?E(e)+32|0:c)|0;b=g<<4;c=v[b+4840>>2];g:{if(!h&e>>>0<1073741824){break g}f=99;d=b+4832|0;if((d|0)==(c|0)){break g}while(1){if(!f){break g}b=da(c,i,a);if(b){break b}f=f-1|0;c=v[c+8>>2];if((d|0)!=(c|0)){continue}break}c=d}if(fa(a+48|0)){break f}if(!c){break a}d=(g<<4)+4832|0;if((d|0)==(c|0)){break a}while(1){b=da(c,i,a);if(b){break b}c=v[c+8>>2];if((d|0)!=(c|0)){continue}break}break a}if(!fa(a+48|0)){break a}}b=0;if(i-1&i){break b}if(a>>>0<=4294967239){continue}break}}return b}return 0}function $(a,b,c,d,e){var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;l=Q-16|0;Q=l;a:{if(e>>>0<=3){v[l+12>>2]=0;f=l+12|0;X(f,d,e);a=$(a,b,c,f,4);i=a>>>0<4294967177?a>>>0>e>>>0?-20:a:a;break a}o=_(a,0,(v[b>>2]<<1)+2|0);g=w[d|0]|w[d+1|0]<<8|(w[d+2|0]<<16|w[d+3|0]<<24);f=g&15;i=-44;if(f>>>0>10){break a}v[c>>2]=f+5;c=4;a=g>>>4|0;m=f+6|0;e=d+e|0;n=e-4|0;p=e-7|0;r=e-5|0;j=32<<f;k=j|1;q=v[b>>2];f=d;e=0;g=0;while(1){b:{c:{if(!e){h=g;break c}e=g;if((a&65535)==65535){while(1){d:{if(f>>>0<r>>>0){a=(w[f+2|0]|w[f+3|0]<<8|(w[f+4|0]<<16|w[f+5|0]<<24))>>>c|0;f=f+2|0;break d}c=c+16|0;a=a>>>16|0}e=e+24|0;if((a&65535)==65535){continue}break}}h=a&3;if((h|0)==3){while(1){c=c+2|0;e=e+3|0;a=a>>>2|0;h=a&3;if((h|0)==3){continue}break}}h=e+h|0;i=-48;if(q>>>0<h>>>0){break a}c=c+2|0;e:{if(g>>>0>=h>>>0){h=g;break e}_((g<<1)+o|0,0,h-g<<1)}e=(c>>3)+f|0;if(!(n>>>0<e>>>0&f>>>0>p>>>0)){c=c&7;a=(w[e|0]|w[e+1|0]<<8|(w[e+2|0]<<16|w[e+3|0]<<24))>>>c|0;break b}a=a>>>2|0}e=f}f=j-1&a;g=(j<<1)-1|0;i=g-k|0;if(f>>>0<i>>>0){a=m-1|0}else{a=a&g;f=a-((a|0)<(j|0)?0:i)|0;a=m}g=f-1|0;u[(h<<1)+o>>1]=g;k=k-((f|0)<=0?1-f|0:g)|0;if((k|0)<(j|0)){while(1){m=m-1|0;j=j>>1;if((k|0)<(j|0)){continue}break}}a=a+c|0;f=(a>>3)+e|0;f:{if(!(n>>>0<f>>>0&e>>>0>p>>>0)){c=a&7;break f}f=n;c=a+(e-f<<3)|0}if((k|0)>=2){e=!g;a=(w[f|0]|w[f+1|0]<<8|(w[f+2|0]<<16|w[f+3|0]<<24))>>>c|0;g=h+1|0;if(q>>>0>=g>>>0){continue}}break}i=-20;if((k|0)!=1|(c|0)>32){break a}v[b>>2]=h;i=((c+7>>3)+f|0)-d|0}a=i;Q=l+16|0;return a}function ba(a,b,c,d,e,f){var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;q=Q-112|0;m=a+8|0;n=1;p=1<<f;a:{b:{if((c|0)!=-1){j=p-1|0;r=65536<<f-1>>16;g=c+1|0;s=g&1;if(!c){g=j;break b}k=g&-2;g=j;while(1){l=h<<1;i=x[l+b>>1];c:{if((i|0)==65535){v[((g<<3)+m|0)+4>>2]=h;g=g-1|0;i=1;break c}n=i<<16>>16<(r|0)?n:0}u[l+q>>1]=i;o=h|1;l=o<<1;i=x[l+b>>1];d:{if((i|0)!=65535){n=i<<16>>16<(r|0)?n:0;break d}v[((g<<3)+m|0)+4>>2]=o;g=g-1|0;i=1}u[l+q>>1]=i;h=h+2|0;k=k-2|0;if(k){continue}break}break b}v[a+4>>2]=f;v[a>>2]=1;break a}if(s){i=x[(h<<1)+b>>1];e:{if((i|0)!=65535){n=i<<16>>16<(r|0)?n:0;break e}v[((g<<3)+m|0)+4>>2]=h;g=g-1|0;i=1}u[(h<<1)+q>>1]=i}v[a+4>>2]=f;v[a>>2]=n;if((c|0)==-1){break a}o=((p>>>3)+(p>>>1)|0)+3|0;h=0;k=0;while(1){a=k;l=u[(a<<1)+b>>1];f:{if((l|0)<=0){break f}if((l|0)!=1){k=l&-2;while(1){v[((h<<3)+m|0)+4>>2]=a;while(1){h=j&h+o;if(h>>>0>g>>>0){continue}break}v[((h<<3)+m|0)+4>>2]=a;while(1){h=j&h+o;if(h>>>0>g>>>0){continue}break}k=k-2|0;if(k){continue}break}}if(!(l&1)){break f}v[((h<<3)+m|0)+4>>2]=a;while(1){h=j&h+o;if(h>>>0>g>>>0){continue}break}}k=a+1|0;if((a|0)!=(c|0)){continue}break}}c=f+1|0;g=0;while(1){j=(g<<3)+m|0;b=v[j+4>>2];a=(b<<1)+q|0;f=x[a>>1];u[a>>1]=f+1;a=c+(E(f)^-32)|0;t[j+3|0]=a;u[j>>1]=(f<<a)-p;a=b<<2;t[j+2|0]=v[a+e>>2];v[j+4>>2]=v[a+d>>2];g=g+1|0;if((p|0)!=(g|0)){continue}break}}function ma(a,b,c,d){var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;j=Q-16|0;Q=j;v[j+12>>2]=0;v[j+8>>2]=0;e=-44;n=d- -64|0;b=na(n,d,j+8|0,j+12|0,b,c);a:{b:{if(b>>>0>4294967176){break b}g=v[j+12>>2];c=v[a>>2];if(g>>>0>(c&255)+1>>>0){break a}v[a>>2]=c&-16776961|g<<16&16711680;c:{if(g+1>>>0<2){break c}c=g&3;d:{if(g-1>>>0<3){e=1;break d}i=g&-4;e=1;while(1){h=(e<<2)+d|0;k=v[h>>2];v[h>>2]=f;m=e+1|0;l=(m<<2)+d|0;o=v[l>>2];f=(k<<e-1)+f|0;v[l>>2]=f;k=e+2|0;l=(k<<2)+d|0;p=v[l>>2];f=f+(o<<e)|0;v[l>>2]=f;l=v[h+12>>2];f=f+(p<<m)|0;v[h+12>>2]=f;f=f+(l<<k)|0;e=e+4|0;i=i-4|0;if(i){continue}break}}if(!c){break c}while(1){h=(e<<2)+d|0;i=v[h>>2];v[h>>2]=f;f=(i<<e-1)+f|0;e=e+1|0;c=c-1|0;if(c){continue}break}}k=v[j+8>>2];if(!k){break b}h=a+4|0;m=g+1|0;f=0;while(1){g=w[f+n|0];a=(g<<2)+d|0;c=v[a>>2];e=1<<g>>1;i=c+e|0;v[a>>2]=i;a=m-g|0;e:{if(e>>>0>=4){if(c>>>0>=i>>>0){break e}while(1){e=h+(c<<1)|0;t[e+1|0]=a;t[e|0]=f;t[e+3|0]=a;t[e+2|0]=f;t[e+5|0]=a;t[e+4|0]=f;t[e+7|0]=a;t[e+6|0]=f;c=c+4|0;if(i>>>0>c>>>0){continue}break}break e}if(!g){break e}c=h+(c<<1)|0;t[c+1|0]=a;t[c|0]=f;if(e>>>0<2){break e}t[c+3|0]=a;t[c+2|0]=f;if(((e>>>0>1?e:1)|0)==2){break e}t[c+5|0]=a;t[c+4|0]=f}f=f+1|0;if((k|0)!=(f|0)){continue}break}}e=b}Q=j+16|0;return e}function X(a,b,c){var d=0,e=0,f=0;if(c>>>0>=512){O(a|0,b|0,c|0)|0;return a}e=a+c|0;a:{if(!((a^b)&3)){b:{if(!(a&3)){c=a;break b}if(!c){c=a;break b}c=a;while(1){t[c|0]=w[b|0];b=b+1|0;c=c+1|0;if(!(c&3)){break b}if(c>>>0<e>>>0){continue}break}}d=e&-4;c:{if(d>>>0<64){break c}f=d+-64|0;if(f>>>0<c>>>0){break c}while(1){v[c>>2]=v[b>>2];v[c+4>>2]=v[b+4>>2];v[c+8>>2]=v[b+8>>2];v[c+12>>2]=v[b+12>>2];v[c+16>>2]=v[b+16>>2];v[c+20>>2]=v[b+20>>2];v[c+24>>2]=v[b+24>>2];v[c+28>>2]=v[b+28>>2];v[c+32>>2]=v[b+32>>2];v[c+36>>2]=v[b+36>>2];v[c+40>>2]=v[b+40>>2];v[c+44>>2]=v[b+44>>2];v[c+48>>2]=v[b+48>>2];v[c+52>>2]=v[b+52>>2];v[c+56>>2]=v[b+56>>2];v[c+60>>2]=v[b+60>>2];b=b- -64|0;c=c- -64|0;if(f>>>0>=c>>>0){continue}break}}if(c>>>0>=d>>>0){break a}while(1){v[c>>2]=v[b>>2];b=b+4|0;c=c+4|0;if(d>>>0>c>>>0){continue}break}break a}if(e>>>0<4){c=a;break a}d=e-4|0;if(d>>>0<a>>>0){c=a;break a}c=a;while(1){t[c|0]=w[b|0];t[c+1|0]=w[b+1|0];t[c+2|0]=w[b+2|0];t[c+3|0]=w[b+3|0];b=b+4|0;c=c+4|0;if(d>>>0>=c>>>0){continue}break}}if(c>>>0<e>>>0){while(1){t[c|0]=w[b|0];b=b+1|0;c=c+1|0;if((e|0)!=(c|0)){continue}break}}return a}function fa(a){var b=0,c=0,d=0,e=0,f=0,g=0;e=v[1204];c=a+3&-4;b=e+c|0;a:{b:{if(b>>>0<=e>>>0?c:0){break b}if(b>>>0>T()<<16>>>0){if(!(P(b|0)|0)){break b}}v[1204]=b;break a}v[1468]=48;e=-1}if((e|0)!=-1){c=a+e|0;b=c-16|0;v[b+12>>2]=16;v[b>>2]=16;a=v[1464];if(a){d=v[a+8>>2]}else{d=0}c:{d:{if((d|0)==(e|0)){d=e-(v[e-4>>2]&-2)|0;f=v[d-4>>2];v[a+8>>2]=c;a=d-(f&-2)|0;c=-16;if(!(t[(a+v[a>>2]|0)-4|0]&1)){break d}c=v[a+4>>2];v[c+8>>2]=v[a+8>>2];v[v[a+8>>2]+4>>2]=c;b=b-a|0;v[a>>2]=b;break c}v[e+12>>2]=16;v[e>>2]=16;v[e+8>>2]=c;v[e+4>>2]=a;v[1464]=e;c=16}a=e+c|0;b=b-a|0;v[a>>2]=b}v[((b&-4)+a|0)-4>>2]=b|1;g=a;d=v[a>>2]-8|0;e:{if(d>>>0<=127){b=(d>>>3|0)-1|0;break e}f=E(d);b=((d>>>29-f^4)-(f<<2)|0)+110|0;if(d>>>0<=4095){break e}b=((d>>>30-f^2)-(f<<1)|0)+71|0;b=b>>>0<63?b:63}c=b<<4;v[g+4>>2]=c+4832;c=c+4840|0;v[a+8>>2]=v[c>>2];v[c>>2]=a;v[v[a+8>>2]+4>>2]=a;c=v[1467];a=b&31;if((b&63)>>>0>=32){b=1<<a;d=0}else{d=1<<a;b=d-1&1>>>32-a}v[1466]=d|v[1466];v[1467]=b|c}return(e|0)!=-1}function da(a,b,c){var d=0,e=0,f=0,g=0;d=a+4|0;e=(d+b|0)-1&0-b;b=v[a>>2];if(e+c>>>0<=(b+a|0)-4>>>0){f=v[a+4>>2];v[f+8>>2]=v[a+8>>2];v[v[a+8>>2]+4>>2]=f;if((d|0)!=(e|0)){e=e-d|0;f=a-(v[a-4>>2]&-2)|0;d=e+v[f>>2]|0;v[f>>2]=d;v[(f+(d&-4)|0)-4>>2]=d;a=a+e|0;b=b-e|0;v[a>>2]=b}a:{if(c+24>>>0<=b>>>0){d=(a+c|0)+8|0;b=(b-c|0)-8|0;v[d>>2]=b;v[(d+(b&-4)|0)-4>>2]=b|1;g=d;f=v[d>>2]-8|0;b:{if(f>>>0<=127){e=(f>>>3|0)-1|0;break b}b=E(f);e=((f>>>29-b^4)-(b<<2)|0)+110|0;if(f>>>0<=4095){break b}b=((f>>>30-b^2)-(b<<1)|0)+71|0;e=b>>>0<63?b:63}b=e;e=b<<4;v[g+4>>2]=e+4832;e=e+4840|0;v[d+8>>2]=v[e>>2];v[e>>2]=d;v[v[d+8>>2]+4>>2]=d;e=v[1467];d=b&31;if((b&63)>>>0>=32){b=1<<d;f=0}else{f=1<<d;b=f-1&1>>>32-d}v[1466]=f|v[1466];v[1467]=b|e;b=c+8|0;v[a>>2]=b;v[((b&-4)+a|0)-4>>2]=b;break a}v[(a+b|0)-4>>2]=b}a=a+4|0}else{a=0}return a}function Z(a,b,c){var d=0,e=0;a:{if((a|0)==(b|0)){break a}e=a+c|0;if(b-e>>>0<=0-(c<<1)>>>0){return X(a,b,c)}d=(a^b)&3;b:{c:{if(a>>>0<b>>>0){if(d){d=a;break b}if(!(a&3)){d=a;break c}d=a;while(1){if(!c){break a}t[d|0]=w[b|0];b=b+1|0;c=c-1|0;d=d+1|0;if(d&3){continue}break}break c}d:{if(d){break d}if(e&3){while(1){if(!c){break a}c=c-1|0;d=c+a|0;t[d|0]=w[b+c|0];if(d&3){continue}break}}if(c>>>0<=3){break d}while(1){c=c-4|0;v[c+a>>2]=v[b+c>>2];if(c>>>0>3){continue}break}}if(!c){break a}while(1){c=c-1|0;t[c+a|0]=w[b+c|0];if(c){continue}break}break a}if(c>>>0<=3){break b}while(1){v[d>>2]=v[b>>2];b=b+4|0;d=d+4|0;c=c-4|0;if(c>>>0>3){continue}break}}if(!c){break a}while(1){t[d|0]=w[b|0];d=d+1|0;b=b+1|0;c=c-1|0;if(c){continue}break}}return a}function _(a,b,c){var d=0,e=0,f=0;a:{if(!c){break a}f=a+c|0;t[f-1|0]=b;t[a|0]=b;if(c>>>0<3){break a}t[f-2|0]=b;t[a+1|0]=b;t[f-3|0]=b;t[a+2|0]=b;if(c>>>0<7){break a}t[f-4|0]=b;t[a+3|0]=b;if(c>>>0<9){break a}f=0-a&3;e=f+a|0;d=B(b&255,16843009);v[e>>2]=d;b=c-f&-4;c=b+e|0;v[c-4>>2]=d;if(b>>>0<9){break a}v[e+8>>2]=d;v[e+4>>2]=d;v[c-8>>2]=d;v[c-12>>2]=d;if(b>>>0<25){break a}v[e+24>>2]=d;v[e+20>>2]=d;v[e+16>>2]=d;v[e+12>>2]=d;v[c-16>>2]=d;v[c-20>>2]=d;v[c-24>>2]=d;v[c-28>>2]=d;c=b;b=e&4|24;c=c-b|0;if(c>>>0<32){break a}d=Ga(d,0,1,1);f=R;b=b+e|0;while(1){v[b+24>>2]=d;e=f;v[b+28>>2]=e;v[b+16>>2]=d;v[b+20>>2]=e;v[b+8>>2]=d;v[b+12>>2]=e;v[b>>2]=d;v[b+4>>2]=e;b=b+32|0;c=c-32|0;if(c>>>0>31){continue}break}}return a}function ta(a){a=a|0;var b=0;b=1812;a:{b:{switch((a>>>0<4294967177?0:0-a|0)|0){case 1:b=1855;break a;case 10:b=1159;break a;case 12:b=1766;break a;case 14:b=1184;break a;case 16:b=1506;break a;case 20:b=1830;break a;case 22:b=1271;break a;case 40:b=1212;break a;case 42:b=1692;break a;case 62:b=1061;break a;case 64:b=1024;break a;case 66:b=1378;break a;case 60:b=1616;break a;case 44:b=1718;break a;case 46:b=1575;break a;case 48:b=1340;break a;case 30:b=1788;break a;case 32:b=1415;break a;case 34:b=1112;break a;case 70:b=1308;break a;case 72:b=1090;break a;case 74:b=1234;break a;case 100:b=1550;break a;case 102:b=1463;break a;case 104:b=1435;break a;case 0:break a;default:break b}}b=1669}return b|0}function Y(a){var b=0,c=0,d=0,e=0,f=0;if(a){c=a-4|0;e=v[c>>2];b=e;d=c;f=v[a-8>>2];a=f&-2;if((a|0)!=(f|0)){d=c-a|0;b=v[d+4>>2];v[b+8>>2]=v[d+8>>2];v[v[d+8>>2]+4>>2]=b;b=a+e|0}a=c+e|0;c=v[a>>2];if((c|0)!=v[(a+c|0)-4>>2]){e=v[a+4>>2];v[e+8>>2]=v[a+8>>2];v[v[a+8>>2]+4>>2]=e;b=b+c|0}v[d>>2]=b;v[((b&-4)+d|0)-4>>2]=b|1;f=d;b=v[d>>2]-8|0;a:{if(b>>>0<=127){a=(b>>>3|0)-1|0;break a}e=E(b);a=((b>>>29-e^4)-(e<<2)|0)+110|0;if(b>>>0<=4095){break a}a=((b>>>30-e^2)-(e<<1)|0)+71|0;a=a>>>0<63?a:63}c=a<<4;v[f+4>>2]=c+4832;c=c+4840|0;v[d+8>>2]=v[c>>2];v[c>>2]=d;v[v[d+8>>2]+4>>2]=d;c=v[1467];d=a&31;if((a&63)>>>0>=32){a=1<<d;b=0}else{b=1<<d;a=b-1&1>>>32-d}v[1466]=b|v[1466];v[1467]=a|c}}function ga(a,b,c,d,e,f,g,h,i,j,k,l,m){var n=0,o=0;n=Q-128|0;Q=n;v[n+124>>2]=d;o=-1;a:{b:{switch(c|0){case 1:if(!g){o=-72;break a}o=-20;c=w[f|0];if(c>>>0>d>>>0){break a}c=c<<2;d=v[c+i>>2];c=v[c+h>>2];t[a+11|0]=0;v[a>>2]=0;v[a+4>>2]=0;v[a+12>>2]=c;t[a+10|0]=d;u[a+8>>1]=0;v[b>>2]=a;o=1;break a;case 0:v[b>>2]=j;o=0;break a;case 3:if(!k){o=-20;break a}o=0;if(!l|(m|0)<25){break a}a=(8<<e)+8|0;if(!a){break a}d=0;while(1){d=d- -64|0;if(a>>>0>d>>>0){continue}break};break a;case 2:break b;default:break a}}o=-20;c=$(n,n+124|0,n+120|0,f,g);if(c>>>0>4294967176){break a}d=v[n+120>>2];if(d>>>0>e>>>0){break a}ba(a,n,v[n+124>>2],h,i,d);v[b>>2]=a;o=c}Q=n+128|0;return o}function Ea(a){a=a|0;var b=0,c=0,d=0,e=0,f=0,g=0;a:{b:{if(!a){break b}b=-64;if(v[a+28936>>2]){break a}e=v[a+28924>>2];c=v[a+28920>>2];b=v[a+28944>>2];c:{if(!b){break c}f=v[b+26692>>2];d=v[b+26688>>2];d:{e:{g=v[b>>2];if(g){if(!d){break e}S[d|0](f,g);S[d|0](f,b);break c}if(!d){break d}S[d|0](f,b);break c}Y(g)}Y(b)}v[a+28960>>2]=0;v[a+28944>>2]=0;v[a+28948>>2]=0;f:{g:{b=v[a+28968>>2];if(b){if(!c){break g}S[c|0](e,b);v[a+28968>>2]=0;S[c|0](e,a);break b}v[a+28968>>2]=0;if(!c){break f}S[c|0](e,a);break b}Y(b)}Y(a)}b=0}return b|0}function ja(a,b,c){var d=0;if(!c){v[a>>2]=0;v[a+4>>2]=0;v[a+16>>2]=0;v[a+8>>2]=0;v[a+12>>2]=0;return-72}v[a+12>>2]=b;v[a+16>>2]=b+4;if(c>>>0>=4){d=b+c|0;b=d-4|0;v[a+8>>2]=b;v[a>>2]=w[b|0]|w[b+1|0]<<8|(w[b+2|0]<<16|w[b+3|0]<<24);b=w[d-1|0];if(!b){v[a+4>>2]=0;return-1}v[a+4>>2]=E(b)-23;return c}v[a+8>>2]=b;d=w[b|0];v[a>>2]=d;a:{switch(c-2|0){case 1:d=w[b+2|0]<<16|d;v[a>>2]=d;case 0:v[a>>2]=(w[b+1|0]<<8)+d;break;default:break a}}b=w[(b+c|0)-1|0];if(!b){v[a+4>>2]=0;return-20}v[a+4>>2]=(E(b)-(c<<3)|0)+9;return c}function Fa(){var a=0,b=0;a=ea(160168);if(!a){return 0}v[a+28924>>2]=0;v[a+28916>>2]=0;v[a+28920>>2]=0;v[a+28980>>2]=134217729;v[a+28936>>2]=0;v[a+28908>>2]=0;v[a+28948>>2]=0;v[a+160164>>2]=0;v[a+29004>>2]=0;v[a+29008>>2]=0;v[a+28988>>2]=0;v[a+28740>>2]=0;v[a+29020>>2]=0;v[a+29024>>2]=0;v[a+28940>>2]=0;v[a+28944>>2]=0;v[a+28956>>2]=0;v[a+28960>>2]=0;b=a+28964|0;v[b>>2]=0;v[b+4>>2]=0;v[a+28972>>2]=0;return a|0}function Ha(a,b,c){var d=0,e=0,f=0,g=0;g=c&63;f=g;e=f&31;if(f>>>0>=32){f=-1>>>e|0}else{f=-1>>>e|0;d=f;f=d|(1<<e)-1<<32-e}f=f&a;d=b&d;e=g&31;if(g>>>0>=32){d=f<<e;g=0}else{d=(1<<e)-1&f>>>32-e|d<<e;g=f<<e}f=d;e=0-c&63;d=e&31;if(e>>>0>=32){d=-1<<d;c=0}else{c=-1<<d;d=c|(1<<d)-1&-1>>>32-d}a=c&a;b=b&d;d=e&31;if(e>>>0>=32){c=0;a=b>>>d|0}else{c=b>>>d|0;a=((1<<d)-1&b)<<32-d|a>>>d}a=a|g;R=c|f;return a}
function Ba(a){a=a|0;var b=0,c=0,d=0,e=0;v[a+29020>>2]=0;v[a+28964>>2]=0;b=v[a+28944>>2];a:{if(!b){break a}d=v[b+26692>>2];c=v[b+26688>>2];b:{c:{e=v[b>>2];if(e){if(!c){break c}S[c|0](d,e);S[c|0](d,b);break a}if(!c){break b}S[c|0](d,b);break a}Y(e)}Y(b)}v[a+28960>>2]=0;v[a+28944>>2]=0;v[a+28948>>2]=0;return(v[a+28908>>2]?1:5)|0}function Ga(a,b,c,d){var e=0,f=0,g=0,h=0,i=0,j=0;e=c>>>16|0;f=a>>>16|0;j=B(e,f);g=c&65535;h=a&65535;i=B(g,h);f=(i>>>16|0)+B(f,g)|0;e=(f&65535)+B(e,h)|0;R=(B(b,c)+j|0)+B(a,d)+(f>>>16)+(e>>>16)|0;return i&65535|e<<16}function sa(){var a=0,b=0,c=0;while(1){b=a<<4;c=b+4832|0;v[b+4836>>2]=c;v[b+4840>>2]=c;a=a+1|0;if((a|0)!=64){continue}break}fa(48)}function ya(a){a=a|0;return a>>>0>4294967176|0}function ua(a){a=a|0;a=Q-a&-16;Q=a;return a|0}function za(a){a=a|0;return ea(a)|0}function Da(){return 131075}function Ca(){return 131072}function xa(a){a=a|0;Y(a)}function wa(){return Q|0}function va(a){a=a|0;Q=a}
// EMSCRIPTEN_END_FUNCS
e=w;p(V);var S=c([]);function T(){return s.byteLength/65536|0}return{"d":sa,"e":za,"f":xa,"g":ya,"h":ta,"i":Fa,"j":Ea,"k":Da,"l":Ca,"m":Ba,"n":Aa,"o":S,"p":wa,"q":va,"r":ua}}return U(W)}
// EMSCRIPTEN_END_ASM




)(E)}function ca(){return{then:function(c){c({instance:new ba})}}}var da=Error,WebAssembly={};B=[];"object"!==typeof WebAssembly&&F("no native wasm support detected");
var G,H=!1;function J(c){var f=a["_"+c];f||F("Assertion failed: Cannot call unknown function "+(c+", make sure it is exported"));return f}
function ea(c,f,d,n){var l={string:function(b){var e=0;if(null!==b&&void 0!==b&&0!==b){var g=(b.length<<2)+1;e=K(g);var h=e,k=L;if(0<g){g=h+g-1;for(var u=0;u<b.length;++u){var p=b.charCodeAt(u);if(55296<=p&&57343>=p){var I=b.charCodeAt(++u);p=65536+((p&1023)<<10)|I&1023}if(127>=p){if(h>=g)break;k[h++]=p}else{if(2047>=p){if(h+1>=g)break;k[h++]=192|p>>6}else{if(65535>=p){if(h+2>=g)break;k[h++]=224|p>>12}else{if(h+3>=g)break;k[h++]=240|p>>18;k[h++]=128|p>>12&63}k[h++]=128|p>>6&63}k[h++]=128|p&63}}k[h]=
0}}return e},array:function(b){var e=K(b.length);N.set(b,e);return e}};c=J(c);var m=[],q=0;if(n)for(var r=0;r<n.length;r++){var C=l[d[r]];C?(0===q&&(q=fa()),m[r]=C(n[r])):m[r]=n[r]}d=c.apply(null,m);return d=function(b){0!==q&&ha(q);if("string"===f)if(b){for(var e=L,g=b+NaN,h=b;e[h]&&!(h>=g);)++h;if(16<h-b&&e.subarray&&ia)b=ia.decode(e.subarray(b,h));else{for(g="";b<h;){var k=e[b++];if(k&128){var u=e[b++]&63;if(192==(k&224))g+=String.fromCharCode((k&31)<<6|u);else{var p=e[b++]&63;k=224==(k&240)?(k&
15)<<12|u<<6|p:(k&7)<<18|u<<12|p<<6|e[b++]&63;65536>k?g+=String.fromCharCode(k):(k-=65536,g+=String.fromCharCode(55296|k>>10,56320|k&1023))}}else g+=String.fromCharCode(k)}b=g}}else b="";else b="boolean"===f?!!b:b;return b}(d)}var ia="undefined"!==typeof TextDecoder?new TextDecoder("utf8"):void 0,O,N,L,D=a.INITIAL_MEMORY||150994944;a.wasmMemory?G=a.wasmMemory:G=new aa;G&&(O=G.buffer);D=O.byteLength;var P=O;O=P;a.HEAP8=N=new Int8Array(P);a.HEAP16=new Int16Array(P);a.HEAP32=new Int32Array(P);
a.HEAPU8=L=new Uint8Array(P);a.HEAPU16=new Uint16Array(P);a.HEAPU32=new Uint32Array(P);a.HEAPF32=new Float32Array(P);a.HEAPF64=new Float64Array(P);var ja,ka=[],la=[],ma=[];function na(){var c=a.preRun.shift();ka.unshift(c)}Math.imul||(Math.imul=function(c,f){var d=c&65535,n=f&65535;return d*n+((c>>>16)*n+d*(f>>>16)<<16)|0});if(!Math.fround){var oa=new Float32Array(1);Math.fround=function(c){oa[0]=c;return oa[0]}}
Math.clz32||(Math.clz32=function(c){var f=32,d=c>>16;d&&(f-=16,c=d);if(d=c>>8)f-=8,c=d;if(d=c>>4)f-=4,c=d;if(d=c>>2)f-=2,c=d;return c>>1?f-2:f-c});Math.trunc||(Math.trunc=function(c){return 0>c?Math.ceil(c):Math.floor(c)});var Q=0,R=null,S=null;a.preloadedImages={};a.preloadedAudios={};function F(c){if(a.onAbort)a.onAbort(c);c="Aborted("+c+")";A(c);H=!0;c=new da(c+". Build with -s ASSERTIONS=1 for more info.");v(c);throw c;}
function U(c){return c.startsWith("data:application/octet-stream;base64,")}var V;if(a.locateFile){if(V="zstddec-asm.wasm",!U(V)){var pa=V;V=a.locateFile?a.locateFile(pa,y):y+pa}}else V=(new URL("zstddec-asm.wasm",__LIB_URL)).toString();
function qa(){var c=V;try{if(c==V&&B)return new Uint8Array(B);if(U(c))try{var f=ra(c.slice(37)),d=new Uint8Array(f.length);for(c=0;c<f.length;++c)d[c]=f.charCodeAt(c);var n=d}catch(m){throw Error("Converting base64 string to bytes failed.");}else n=void 0;var l=n;if(l)return l;throw"both async and sync fetching of the wasm failed";}catch(m){F(m)}}
function sa(){return B||"function"!==typeof fetch?Promise.resolve().then(function(){return qa()}):fetch(V,{credentials:"same-origin"}).then(function(c){if(!c.ok)throw"failed to load wasm binary file at '"+V+"'";return c.arrayBuffer()}).catch(function(){return qa()})}function W(c){for(;0<c.length;){var f=c.shift();if("function"==typeof f)f(a);else{var d=f.H;"number"===typeof d?void 0===f.A?ta(d)():ta(d)(f.A):d(void 0===f.A?null:f.A)}}}var X=[];
function ta(c){var f=X[c];f||(c>=X.length&&(X.length=c+1),X[c]=f=ja.get(c));return f}
var ra="function"===typeof atob?atob:function(c){var f="",d=0;c=c.replace(/[^A-Za-z0-9\+\/=]/g,"");do{var n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(c.charAt(d++));var l="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(c.charAt(d++));var m="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(c.charAt(d++));var q="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(c.charAt(d++));n=n<<2|l>>4;
l=(l&15)<<4|m>>2;var r=(m&3)<<6|q;f+=String.fromCharCode(n);64!==m&&(f+=String.fromCharCode(l));64!==q&&(f+=String.fromCharCode(r))}while(d<c.length);return f},E={b:Uint8Array.prototype.copyWithin?function(c,f,d){L.copyWithin(c,f,f+d)}:function(c,f,d){L.set(L.subarray(f,f+d),c)},c:function(){F("OOM")},a:G};
(function(){function c(l){a.asm=l.exports;ja=a.asm.o;la.unshift(a.asm.d);Q--;a.monitorRunDependencies&&a.monitorRunDependencies(Q);0==Q&&(null!==R&&(clearInterval(R),R=null),S&&(l=S,S=null,l()))}function f(l){c(l.instance)}function d(l){return sa().then(function(){return ca()}).then(function(m){return m}).then(l,function(m){A("failed to asynchronously prepare wasm: "+m);F(m)})}var n={a:E};Q++;a.monitorRunDependencies&&a.monitorRunDependencies(Q);if(a.instantiateWasm)try{return a.instantiateWasm(n,
c)}catch(l){return A("Module.instantiateWasm callback failed with error: "+l),!1}(function(){return B||"function"!==typeof WebAssembly.instantiateStreaming||U(V)||"function"!==typeof fetch?d(f):fetch(V,{credentials:"same-origin"}).then(function(l){return WebAssembly.instantiateStreaming(l,n).then(f,function(m){A("wasm streaming compile failed: "+m);A("falling back to ArrayBuffer instantiation");return d(f)})})})().catch(v);return{}})();
a.___wasm_call_ctors=function(){return(a.___wasm_call_ctors=a.asm.d).apply(null,arguments)};a._malloc=function(){return(a._malloc=a.asm.e).apply(null,arguments)};a._free=function(){return(a._free=a.asm.f).apply(null,arguments)};a._ZSTD_isError=function(){return(a._ZSTD_isError=a.asm.g).apply(null,arguments)};a._ZSTD_getErrorName=function(){return(a._ZSTD_getErrorName=a.asm.h).apply(null,arguments)};a._ZSTD_createDStream=function(){return(a._ZSTD_createDStream=a.asm.i).apply(null,arguments)};
a._ZSTD_freeDStream=function(){return(a._ZSTD_freeDStream=a.asm.j).apply(null,arguments)};a._ZSTD_DStreamInSize=function(){return(a._ZSTD_DStreamInSize=a.asm.k).apply(null,arguments)};a._ZSTD_DStreamOutSize=function(){return(a._ZSTD_DStreamOutSize=a.asm.l).apply(null,arguments)};a._ZSTD_initDStream=function(){return(a._ZSTD_initDStream=a.asm.m).apply(null,arguments)};a._ZSTD_decompressStream=function(){return(a._ZSTD_decompressStream=a.asm.n).apply(null,arguments)};
var fa=a.stackSave=function(){return(fa=a.stackSave=a.asm.p).apply(null,arguments)},ha=a.stackRestore=function(){return(ha=a.stackRestore=a.asm.q).apply(null,arguments)},K=a.stackAlloc=function(){return(K=a.stackAlloc=a.asm.r).apply(null,arguments)};a.cwrap=function(c,f,d,n){d=d||[];var l=d.every(function(m){return"number"===m});return"string"!==f&&l&&!n?J(c):function(){return ea(c,f,d,arguments)}};var Y;S=function ua(){Y||Z();Y||(S=ua)};
function Z(){function c(){if(!Y&&(Y=!0,a.calledRun=!0,!H)){W(la);t(a);if(a.onRuntimeInitialized)a.onRuntimeInitialized();if(a.postRun)for("function"==typeof a.postRun&&(a.postRun=[a.postRun]);a.postRun.length;){var f=a.postRun.shift();ma.unshift(f)}W(ma)}}if(!(0<Q)){if(a.preRun)for("function"==typeof a.preRun&&(a.preRun=[a.preRun]);a.preRun.length;)na();W(ka);0<Q||(a.setStatus?(a.setStatus("Running..."),setTimeout(function(){setTimeout(function(){a.setStatus("")},1);c()},1)):c())}}a.run=Z;
if(a.preInit)for("function"==typeof a.preInit&&(a.preInit=[a.preInit]);0<a.preInit.length;)a.preInit.pop()();Z();


  return ZD.ready
}
);
})();
return ZD;
});
__def("zstddec-wasm", [], function(){

var ZD = (function() {
  var _scriptDir = __LIB_URL;
  
  return (
function(ZD) {
  ZD = ZD || {};


var a;a||(a=typeof ZD !== 'undefined' ? ZD : {});var q,r;a.ready=new Promise(function(b,c){q=b;r=c});var t={},w;for(w in a)a.hasOwnProperty(w)&&(t[w]=a[w]);var x="";"undefined"!==typeof document&&document.currentScript&&(x=document.currentScript.src);_scriptDir&&(x=_scriptDir);0!==x.indexOf("blob:")?x=x.substr(0,x.replace(/[?#].*/,"").lastIndexOf("/")+1):x="";var y=a.printErr||console.warn.bind(console);for(w in t)t.hasOwnProperty(w)&&(a[w]=t[w]);t=null;var z;
a.wasmBinary&&(z=a.wasmBinary);var noExitRuntime=a.noExitRuntime||!0;"object"!==typeof WebAssembly&&A("no native wasm support detected");var B,C=!1;function E(b){var c=a["_"+b];c||A("Assertion failed: Cannot call unknown function "+(b+", make sure it is exported"));return c}
function aa(b,c,h,p){var e={string:function(d){var m=0;if(null!==d&&void 0!==d&&0!==d){var l=(d.length<<2)+1;m=F(l);var g=m,f=G;if(0<l){l=g+l-1;for(var u=0;u<d.length;++u){var k=d.charCodeAt(u);if(55296<=k&&57343>=k){var da=d.charCodeAt(++u);k=65536+((k&1023)<<10)|da&1023}if(127>=k){if(g>=l)break;f[g++]=k}else{if(2047>=k){if(g+1>=l)break;f[g++]=192|k>>6}else{if(65535>=k){if(g+2>=l)break;f[g++]=224|k>>12}else{if(g+3>=l)break;f[g++]=240|k>>18;f[g++]=128|k>>12&63}f[g++]=128|k>>6&63}f[g++]=128|k&63}}f[g]=
0}}return m},array:function(d){var m=F(d.length);H.set(d,m);return m}};b=E(b);var n=[],D=0;if(p)for(var v=0;v<p.length;v++){var Q=e[h[v]];Q?(0===D&&(D=I()),n[v]=Q(p[v])):n[v]=p[v]}h=b.apply(null,n);return h=function(d){0!==D&&J(D);if("string"===c)if(d){for(var m=G,l=d+NaN,g=d;m[g]&&!(g>=l);)++g;if(16<g-d&&m.subarray&&K)d=K.decode(m.subarray(d,g));else{for(l="";d<g;){var f=m[d++];if(f&128){var u=m[d++]&63;if(192==(f&224))l+=String.fromCharCode((f&31)<<6|u);else{var k=m[d++]&63;f=224==(f&240)?(f&15)<<
12|u<<6|k:(f&7)<<18|u<<12|k<<6|m[d++]&63;65536>f?l+=String.fromCharCode(f):(f-=65536,l+=String.fromCharCode(55296|f>>10,56320|f&1023))}}else l+=String.fromCharCode(f)}d=l}}else d="";else d="boolean"===c?!!d:d;return d}(h)}var K="undefined"!==typeof TextDecoder?new TextDecoder("utf8"):void 0,H,G,L,M=[],N=[],O=[];function ba(){var b=a.preRun.shift();M.unshift(b)}var P=0,R=null,S=null;a.preloadedImages={};a.preloadedAudios={};
function A(b){if(a.onAbort)a.onAbort(b);b="Aborted("+b+")";y(b);C=!0;b=new WebAssembly.RuntimeError(b+". Build with -s ASSERTIONS=1 for more info.");r(b);throw b;}function T(){return U.startsWith("data:application/octet-stream;base64,")}var U;if(a.locateFile){if(U="zstddec-wasm.wasm",!T()){var V=U;U=a.locateFile?a.locateFile(V,x):x+V}}else U=(new URL("zstddec-wasm.wasm",__LIB_URL)).toString();
function ca(){var b=U;try{if(b==U&&z)return new Uint8Array(z);throw"both async and sync fetching of the wasm failed";}catch(c){A(c)}}function ea(){return z||"function"!==typeof fetch?Promise.resolve().then(function(){return ca()}):fetch(U,{credentials:"same-origin"}).then(function(b){if(!b.ok)throw"failed to load wasm binary file at '"+U+"'";return b.arrayBuffer()}).catch(function(){return ca()})}
function W(b){for(;0<b.length;){var c=b.shift();if("function"==typeof c)c(a);else{var h=c.u;"number"===typeof h?void 0===c.s?fa(h)():fa(h)(c.s):h(void 0===c.s?null:c.s)}}}var X=[];function fa(b){var c=X[b];c||(b>=X.length&&(X.length=b+1),X[b]=c=L.get(b));return c}var ha={a:function(b,c,h){G.copyWithin(b,c,c+h)},b:function(){A("OOM")}};
(function(){function b(e){a.asm=e.exports;B=a.asm.c;e=B.buffer;a.HEAP8=H=new Int8Array(e);a.HEAP16=new Int16Array(e);a.HEAP32=new Int32Array(e);a.HEAPU8=G=new Uint8Array(e);a.HEAPU16=new Uint16Array(e);a.HEAPU32=new Uint32Array(e);a.HEAPF32=new Float32Array(e);a.HEAPF64=new Float64Array(e);L=a.asm.o;N.unshift(a.asm.d);P--;a.monitorRunDependencies&&a.monitorRunDependencies(P);0==P&&(null!==R&&(clearInterval(R),R=null),S&&(e=S,S=null,e()))}function c(e){b(e.instance)}function h(e){return ea().then(function(n){return WebAssembly.instantiate(n,
p)}).then(function(n){return n}).then(e,function(n){y("failed to asynchronously prepare wasm: "+n);A(n)})}var p={a:ha};P++;a.monitorRunDependencies&&a.monitorRunDependencies(P);if(a.instantiateWasm)try{return a.instantiateWasm(p,b)}catch(e){return y("Module.instantiateWasm callback failed with error: "+e),!1}(function(){return z||"function"!==typeof WebAssembly.instantiateStreaming||T()||"function"!==typeof fetch?h(c):fetch(U,{credentials:"same-origin"}).then(function(e){return WebAssembly.instantiateStreaming(e,
p).then(c,function(n){y("wasm streaming compile failed: "+n);y("falling back to ArrayBuffer instantiation");return h(c)})})})().catch(r);return{}})();a.___wasm_call_ctors=function(){return(a.___wasm_call_ctors=a.asm.d).apply(null,arguments)};a._malloc=function(){return(a._malloc=a.asm.e).apply(null,arguments)};a._free=function(){return(a._free=a.asm.f).apply(null,arguments)};a._ZSTD_isError=function(){return(a._ZSTD_isError=a.asm.g).apply(null,arguments)};
a._ZSTD_getErrorName=function(){return(a._ZSTD_getErrorName=a.asm.h).apply(null,arguments)};a._ZSTD_createDStream=function(){return(a._ZSTD_createDStream=a.asm.i).apply(null,arguments)};a._ZSTD_freeDStream=function(){return(a._ZSTD_freeDStream=a.asm.j).apply(null,arguments)};a._ZSTD_DStreamInSize=function(){return(a._ZSTD_DStreamInSize=a.asm.k).apply(null,arguments)};a._ZSTD_DStreamOutSize=function(){return(a._ZSTD_DStreamOutSize=a.asm.l).apply(null,arguments)};
a._ZSTD_initDStream=function(){return(a._ZSTD_initDStream=a.asm.m).apply(null,arguments)};a._ZSTD_decompressStream=function(){return(a._ZSTD_decompressStream=a.asm.n).apply(null,arguments)};var I=a.stackSave=function(){return(I=a.stackSave=a.asm.p).apply(null,arguments)},J=a.stackRestore=function(){return(J=a.stackRestore=a.asm.q).apply(null,arguments)},F=a.stackAlloc=function(){return(F=a.stackAlloc=a.asm.r).apply(null,arguments)};
a.cwrap=function(b,c,h,p){h=h||[];var e=h.every(function(n){return"number"===n});return"string"!==c&&e&&!p?E(b):function(){return aa(b,c,h,arguments)}};var Y;S=function ia(){Y||Z();Y||(S=ia)};
function Z(){function b(){if(!Y&&(Y=!0,a.calledRun=!0,!C)){W(N);q(a);if(a.onRuntimeInitialized)a.onRuntimeInitialized();if(a.postRun)for("function"==typeof a.postRun&&(a.postRun=[a.postRun]);a.postRun.length;){var c=a.postRun.shift();O.unshift(c)}W(O)}}if(!(0<P)){if(a.preRun)for("function"==typeof a.preRun&&(a.preRun=[a.preRun]);a.preRun.length;)ba();W(M);0<P||(a.setStatus?(a.setStatus("Running..."),setTimeout(function(){setTimeout(function(){a.setStatus("")},1);b()},1)):b())}}a.run=Z;
if(a.preInit)for("function"==typeof a.preInit&&(a.preInit=[a.preInit]);0<a.preInit.length;)a.preInit.pop()();Z();


  return ZD.ready
}
);
})();
return ZD;
});
__def("zstddec_wrapper", ['uiUtil', 'zstddec-asm', 'zstddec-wasm'], function(uiUtil, ZDASM, ZDWASM){
﻿/**
 * zstddec_wrapper.js: Javascript wrapper around compiled zstd decompressor.
 *
 * Copyright 2023 Jaifroid, Mossroy and contributors
 * Licence GPL v3:
 *
 * This file is part of Kiwix.
 *
 * Kiwix is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public Licence as published by
 * the Free Software Foundation, either version 3 of the Licence, or
 * (at your option) any later version.
 *
 * Kiwix is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public Licence for more details.
 *
 * You should have received a copy of the GNU General Public Licence
 * along with Kiwix (file LICENCE-GPLv3.txt).  If not, see <http://www.gnu.org/licences/>
 */

'use strict';

/* global params */
/* eslint-disable no-multi-spaces */




// Variable specific to this decompressor (will be used to populate global variable)
var ZSTDMachineType = null;

// DEV: zstddec.js has been compiled with `-s EXPORT_NAME="ZD" -s MODULARIZE=1` to avoid a clash with xzdec.js
// For explanation of loading method below to avoid conflicts, see https://github.com/emscripten-core/emscripten/blob/master/src/settings.js

/**
 * @typedef EMSInstanceExt An object type representing an Emscripten instance with extended properties
 * @property {Integer} _decHandle The decoder stream context object in asm memory (to be re-used for each decoder operation)
 * @property {Object} _inBuffer A JS copy of the inBuffer structure to be set in asm memory (malloc)
 * @property {Object} _outBuffer A JS copy of the outBuffer structure to be set in asm memory (malloc)
 * @property {Integer} _chunkSize The number of compressed bytes to feed to the decompressor in any one read loop
 */

/**
 * The ZSTD Decoder instance
 * @type EMSInstanceExt
 */
var zd;

var instantiateDecoder = function (instance) {
    // Instantiate the zd object
    zd = instance;
    // Create JS API by wrapping C++ functions
    // DEV: Functions with simple types (integers, pointers) do not need to be wrapped
    zd.getErrorString = zd.cwrap('ZSTD_getErrorName', 'string', ['number']);
    // Get a permanent decoder handle (pointer to control structure)
    // NB there is no need to change this handle even between ZIM loads: zstddeclib encourages re-using assigned structures
    zd._decHandle = zd._ZSTD_createDStream();
    // In-built function below provides a max recommended chunk size
    zd._chunkSize = zd._ZSTD_DStreamInSize();
    // Change _chunkSize if you need a more conservative memory environment, but you may need to experiment with INITIAL_MEMORY
    // in zstddec.js (see below) for this to make any difference
    // zd._chunkSize = 5 * 1024;

    // Initialize inBuffer
    zd._inBuffer = {
        ptr: null,              /* pointer to this inBuffer structure in w/asm memory */
        src: null,              /* void* src   < start of input buffer */
        size: zd._chunkSize,    /* size_t size < size of input buffer */
        pos: 0                  /* size_t pos; < position where reading stopped. Will be updated. Necessarily 0 <= pos <= size */
    };
    // Reserve w/asm memory for the inBuffer structure (we will populate assigned memory later)
    zd._inBuffer.ptr = mallocOrDie(3 << 2); // 3 x 32bit bytes
    // Reserve w/asm memory for the inBuffer data stream
    zd._inBuffer.src = mallocOrDie(zd._inBuffer.size);

    // DEV: Size of outBuffer is currently set as recommended by zd._ZSTD_DStreamOutSize() below; if you are running into
    // memory issues, it may be possible to reduce memory consumption by setting a smaller outBuffer size here and
    // reompiling zstddec.js with lower TOTAL_MEMORY (or just search for INITIAL_MEMORY in zstddec.js and change it)
    var outBufSize = zd._ZSTD_DStreamOutSize();

    // Initialize outBuffer
    zd._outBuffer = {
        ptr: null,           /* pointer to this outBuffer structure in asm/wasm memory */
        dst: null,           /* void* dst   < start of output buffer (pointer) */
        size: outBufSize,    /* size_t size < size of output buffer */
        pos: 0               /* size_t pos  < position where writing stopped. Will be updated. Necessarily 0 <= pos <= size */
    };
    // Reserve w/asm memory for the outBuffer structure
    zd._outBuffer.ptr = mallocOrDie(3 << 2); // 3 x 32bit bytes
    // Reserve w/asm memory for the outBuffer data steam
    zd._outBuffer.dst = mallocOrDie(zd._outBuffer.size);
};

// Select asm or wasm conditionally
if ('WebAssembly' in self && 'fetch' in self) {
    console.debug('Instantiating WASM zstandard decoder');
    ZSTDMachineType = 'WASM';
} else {
    console.debug('Instantiating ASM zstandard decoder');
    ZSTDMachineType = 'ASM';
}

var loadASM = function () {
    ZDASM().then(function (inst) {
        params.decompressorAPI.assemblerMachineType = ZSTDMachineType;
        instantiateDecoder(inst);
    }).catch(function (err) {
        uiUtil.reportAssemblerErrorToAPIStatusPanel('ZSTD', err, ZSTDMachineType);
    });
};

if (ZSTDMachineType === 'WASM') {
    ZDWASM().then(function (inst) {
        params.decompressorAPI.assemblerMachineType = ZSTDMachineType;
        instantiateDecoder(inst);
    }).catch(function (err) {
        console.warn('WASM zstd decoder failed to load, falling back to ASM because:', err.message || err);
        ZSTDMachineType = 'ASM';
        loadASM();
    });
} else {
    loadASM();
}

/**
 * Number of milliseconds to wait for the decompressor to be available for another chunk
 * @type Integer
 */
var DELAY_WAITING_IDLE_DECOMPRESSOR = 50;

/**
 * Is the decompressor already working?
 * @type Boolean
 */
var busy = false;

/**
 * @typedef Decompressor
 * @property {FileReader} _reader The filereader to use (uses plain blob reader defined in zimfile.js)
 * @property {Integer} _inStreamPos The current known position in the steam of compressed bytes
 * @property {Integer} _inStreamChunkedPos The position once the currently loaded chunk will have been consumed
 * @property {Integer} _outStreamPos The position in the decoded byte stream (offset from start of cluster)
 * @property {Array} _outDataBuf The buffer that stores decoded bytes (it is set to the requested blob's length, and when full, the data are returned)
 * @property {Integer} _outDataBufPos The number of bytes of the requested blob decoded so far
 */

/**
 * @constructor
 * @param {FileReader} reader The reader used to extract file slices (defined in zimfile.js)
 */
function Decompressor (reader) {
    params.decompressorAPI.decompressorLastUsed = 'ZSTD';
    this._reader = reader;
}

/**
 * Set up the decompression stream, and initiate a read loop to decompress from the beginning of the cluster
 * until we reach <offset> in the decompressed byte stream
 * @param {Integer} offset Cluster offset (in decompressed stream) from which to start reading
 * @param {Integer} length Number of decompressed bytes to read
 * @returns {Promise<ArrayBuffer>} Promise for an ArrayBuffer with decoded data
 */
Decompressor.prototype.readSlice = function (offset, length) {
    busy = true;
    this._inStreamPos = 0;
    this._inStreamChunkedPos = 0;
    this._outStreamPos = 0;
    this._outDataBuf = new Int8Array(new ArrayBuffer(length));
    this._outDataBufPos = 0;
    var ret = zd._ZSTD_initDStream(zd._decHandle);
    if (zd._ZSTD_isError(ret)) {
        return Promise.reject(new Error('Failed to initialize ZSTD decompression'));
    }

    return this._readLoop(offset, length).then(function (data) {
        // DEV: We are re-using all the allocated w/asm memory, so we do not need to free any of structures assigned with _malloc
        // However, should you need to free assigned structures use, e.g., zd._free(zd._inBuffer.src);
        // Additionally, freeing zd._decHandle is not needed, and actually increases memory consumption (crashing zstddeclib)
        // Should you need to free the decoder stream handle, use command below, but be sure to create a new stream control object
        // before attempting further decompression
        // zd._ZSTD_freeDStream(zd._decHandle);
        busy = false;
        return data;
    });
};

/**
 * This function ensures that only one decompression runs at a time, launching readSlice() only when
 * the decompressor is no longer busy
 * @param {Integer} offset The cluster offset (in decompressed stream) at which the requested blob resides
 * @param {Integer} length The number of decompressed bytes to read
 * @returns {Promise} A Promise for the readSlice() function
 */
Decompressor.prototype.readSliceSingleThread = function (offset, length) {
    // Tests whether the decompressor is ready (initiated) and not busy
    if (zd && !busy) {
        return this.readSlice(offset, length);
    } else {
        // The decompressor is already in progress.
        // To avoid using too much memory, we wait until it has finished
        // before using it for another decompression
        var that = this;
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                that.readSliceSingleThread(offset, length).then(resolve, reject);
            }, DELAY_WAITING_IDLE_DECOMPRESSOR);
        });
    }
};

/**
 * The main loop for sending compressed data to the decompressor and retrieving decompressed bytes
 * Consecutive calls to readLoop may only advance in the stream and may not overlap
 * @param {Integer} offset The offset in the *decompressed* byte stream at which the requested blob resides
 * @returns {Promise<Int8Array>} A Promise for an Int8Array containing the requested blob's decompressed bytes
 */
Decompressor.prototype._readLoop = function (offset) {
    var that = this;
    return this._fillInBuffer().then(function () {
        var finished = false;
        var ret = zd._ZSTD_decompressStream(zd._decHandle, zd._outBuffer.ptr, zd._inBuffer.ptr);
        if (zd._ZSTD_isError(ret)) {
            var errorMessage = 'Failed to decompress data stream!\n' + zd.getErrorString(ret);
            return Promise.reject(errorMessage);
        }
        // Get updated outbuffer values
        var obxPtr32Bit = zd._outBuffer.ptr >> 2;
        var outPos = zd.HEAP32[obxPtr32Bit + 2];

        // If data have been decompressed, check to see whether the data are in the offset range we need
        if (outPos > 0 && that._outStreamPos + outPos >= offset) {
            var copyStart = offset - that._outStreamPos;
            if (copyStart < 0) copyStart = 0;
            for (var i = copyStart; i < outPos && that._outDataBufPos < that._outDataBuf.length; i++) {
                that._outDataBuf[that._outDataBufPos++] = zd.HEAP8[zd._outBuffer.dst + i];
            }
        }
        if (that._outDataBufPos === that._outDataBuf.length) finished = true;
        // Return without further processing if decompressor has finished
        if (finished) return that._outDataBuf;

        // Get updated inbuffer values for processing on the JS sice
        // NB the zd.Decoder will read these values from its own buffers
        var ibxPtr32Bit = zd._inBuffer.ptr >> 2;
        zd._inBuffer.pos = zd.HEAP32[ibxPtr32Bit + 2];

        // Increment the byte stream positions
        that._inStreamPos += zd._inBuffer.pos;
        that._outStreamPos += outPos;
        // DEV: if outPos is > 0, then we have either copied all data from outBuffer, or we can now throw those data away
        // because they are before our required offset
        // Se we can now reset the asm outBuffer.pos field to 0
        // Testing outPos is not strictly necessary, but there may be an overhead in writing to HEAP32
        if (!outPos) zd.HEAP32[obxPtr32Bit + 2] = 0;
        return that._readLoop(offset);
    }).catch(function (err) {
        console.error(err);
    });
};

/**
 * Fills in the instream buffer
 * @returns {Promise<0>} A Promise for 0 when all data have been added to the stream
 */
Decompressor.prototype._fillInBuffer = function () {
    var that = this;
    return this._reader(this._inStreamPos, zd._chunkSize).then(function (data) {
        // Populate inBuffer and assign asm/wasm memory if not already assigned
        zd._inBuffer.size = data.length;
        // Reset inBuffer
        zd._inBuffer.pos = 0;
        var inBufferStruct = new Int32Array([zd._inBuffer.src, zd._inBuffer.size, zd._inBuffer.pos]);
        // Write inBuffer structure to previously assigned w/asm memory
        zd.HEAP32.set(inBufferStruct, zd._inBuffer.ptr >> 2);
        var outBufferStruct = new Int32Array([zd._outBuffer.dst, zd._outBuffer.size, zd._outBuffer.pos]);
        // Write outBuffer structure to w/asm memory
        zd.HEAP32.set(outBufferStruct, zd._outBuffer.ptr >> 2);

        // Transfer the (new) data to be read to the inBuffer
        zd.HEAPU8.set(data, zd._inBuffer.src);
        that._inStreamChunkedPos += data.length;
        return 0;
    });
};

/**
 * Provision asm/wasm data block and get a pointer to the assigned location
 * Code used from excellent WASM tutorial here: https://marcoselvatici.github.io/WASM_tutorial/
 * @param {Integer} sizeOfData The number of bytes to be allocated
 * @returns {Integer} Pointer to the assigned data block
 */
function mallocOrDie (sizeOfData) {
    const dataPointer = zd._malloc(sizeOfData);
    if (dataPointer === 0) { // error allocating memory
        var errorMessage = 'Failed allocation of ' + sizeOfData + ' bytes.';
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    return dataPointer;
}

return {
    Decompressor: Decompressor
}
});
__def("zimfile", ['xzdec_wrapper', 'zstddec_wrapper', 'util', 'utf8', 'zimDirEntry', 'filecache'], function(xz, zstd, util, utf8, zimDirEntry, FileCache){
/**
 * zimfile.js: Low-level ZIM file reader.
 *
 * Copyright 2015 Mossroy and contributors
 * Licence GPL v3:
 *
 * This file is part of Kiwix.
 *
 * Kiwix is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public Licence as published by
 * the Free Software Foundation, either version 3 of the Licence, or
 * (at your option) any later version.
 *
 * Kiwix is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public Licence for more details.
 *
 * You should have received a copy of the GNU General Public Licence
 * along with Kiwix (file LICENSE-GPLv3.txt).  If not, see <http://www.gnu.org/licenses/>
 */

'use strict';

/* global params */







/**
 * This code makes an assumption that no Directory Entry will be larger that MAX_SUPPORTED_DIRENTRY_SIZE bytes.
 * If a larger dirEntry is encountered, a warning will display in console. Increase this value if necessary.
 * See https://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers to understand
 * why 5120 has been chosen here (maximum that IE11 can deal with in code).
 */
const MAX_SUPPORTED_DIRENTRY_SIZE = 5120;

/**
 * Add Polyfill currently required by IE11 to run zstddec-asm and xzdec-asm
 * See https://github.com/emscripten-core/emscripten/issues/14700
 * If this is resolved upstream, remove this polyfill
 * Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
 */
if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        value: function (search, rawPos) {
            var pos = rawPos > 0 ? rawPos | 0 : 0;
            return this.substring(pos, pos + search.length) === search;
        }
    });
}

// to learn more read init.js:57 or search DecompressorAPI in init.js
params.decompressorAPI = {
    assemblerMachineType: null,
    decompressorLastUsed: null,
    errorStatus: null
};

/**
 * A variable to keep track of the currently loaded ZIM archive, e.g., for labelling cache entries
 * The ID is temporary and is reset to 0 at each session start; it is incremented by 1 each time a new ZIM is loaded
 * @type {Integer}
 */
var tempFileId = 0;

/**
 * A Map to keep track of temporary File IDs
 * @type {Map}
 */
var fileIDs = new Map();

var readInt = function (data, offset, size) {
    var r = 0;
    for (var i = 0; i < size; i++) {
        var c = (data[offset + i] + 256) & 0xff;
        r += util.leftShift(c, 8 * i);
    }
    return r;
};

/**
 * A ZIM File
 *
 * See https://wiki.openzim.org/wiki/ZIM_file_format#Header
 * Some properties below are extended and are not part of the official OpenZIM specification
 *
 * @typedef {Object} ZIMFile
 * @property {Array<File>} _files Array of ZIM files
 * @property {String} name Abstract archive name for file set
 * @property {Integer} id Arbitrary numeric ZIM id used to track the currently loaded archive
 * @property {Integer} entryCount Total number of entries in the URL pointerlist
 * @property {Integer} articleCount Total number of article titles in the v1 article-only pointerlist (async calculated entry)
 * @property {Integer} clusterCount Total number of clusters
 * @property {Integer} urlPtrPos Position of the directory pointerlist ordered by URL
 * @property {Integer} titlePtrPos Position of the legacy v0 pointerlist ordered by title
 * @property {Integer} articlePtrPos Position of the v1 article-only pointerlist ordered by title (async calculated entry)
 * @property {Integer|String} fullTextIndex Extended property: position of the full text index, or its path if it exists but has no metadata
 * @property {Integer} fullTextIndexSize Extended property: the size of the full text index as indicated in the metadata, or null if not specified
 * @property {Integer} clusterPtrPos Position of the cluster pointer list
 * @property {Integer} mimeListPos Position of the MIME type list (also header size)
 * @property {Integer} mainPage Main page or 0xffffffff if no main page
 * @property {Integer} layoutPage Layout page or 0xffffffffff if no layout page
 * @property {Map} mimeTypes Extended property: the ZIM file's MIME type table rendered as a Map (calculated entry)
 */

/**
 * Abstract an array of one or more (split) ZIM archives
 * @param {Array<File>} abstractFileArray An array of ZIM file parts
 */
function ZIMFile (abstractFileArray) {
    this._files = abstractFileArray;
}

/**
 * Read and decode an integer value from the ZIM archive
 * @param {Integer} offset The offset at which the integer is found
 * @param {Integer} size The size of data to read
 * @returns {Promise<Integer>} A Promise for the returned value
 */
ZIMFile.prototype._readInteger = function (offset, size) {
    return this._readSlice(offset, size).then(function (data) {
        return readInt(data, 0, size);
    });
};

/**
 * Read a slice from the FileCache or ZIM set, starting at offset for size of bytes
 * @param {Integer} offset The absolute offset from the start of the ZIM file or file set at which to start reading
 * @param {Integer} size The number of bytes to read
 * @returns {Promise<Uint8Array>} A Promise for a Uint8Array containing the requested data
 */
ZIMFile.prototype._readSlice = function (offset, size) {
    return FileCache.read(this, offset, offset + size);
};

/**
 * Read a slice from a set of one or more ZIM files constituting a single archive, and concatenate the data parts
 * @param {Integer} begin The absolute byte offset from which to start reading
 * @param {Integer} end The absolute byte offset where reading should stop (the end byte is not read)
 * @returns {Promise<Uint8Array>} A Promise for a Uint8Array containing the concatenated data
 */
ZIMFile.prototype._readSplitSlice = function (begin, end) {
    var file = this;
    var readRequests = [];
    var currentOffset = 0;
    for (var i = 0; i < file._files.length; currentOffset += file._files[i].size, ++i) {
        var currentSize = file._files[i].size;
        if (begin < currentOffset + currentSize && currentOffset < end) {
            // DEV: Math.max is used below because we could be reading the last part of a blob split across two files,
            // in which case (begin - currentOffset) could be negative!
            var readStart = Math.max(0, begin - currentOffset);
            var readEnd = Math.min(currentSize, end - currentOffset);
            readRequests.push(util.readFileSlice(file._files[i], readStart, readEnd));
        }
    }
    if (readRequests.length === 0) {
        return Promise.resolve(new Uint8Array(0).buffer);
    } else if (readRequests.length === 1) {
        return readRequests[0];
    } else {
        // Wait until all are resolved and concatenate.
        return Promise.all(readRequests).then(function (arrays) {
            var concatenated = new Uint8Array(end - begin);
            var offset = 0;
            arrays.forEach(function (item) {
                concatenated.set(new Uint8Array(item), offset);
                offset += item.byteLength;
            });
            return concatenated;
        });
    }
};

/**
 * Read and parse a Directory Entry at the given archive offset
 * @param {Integer} offset The offset at which the DirEntry is located
 * @returns {Promise<DirEntry>} A Promise for the requested DirEntry
 */
ZIMFile.prototype.dirEntry = function (offset) {
    var that = this;
    return this._readSlice(offset, MAX_SUPPORTED_DIRENTRY_SIZE).then(function (data) {
        var dirEntry = {
            offset: offset,
            mimetypeInteger: readInt(data, 0, 2),
            namespace: String.fromCharCode(data[3])
        };
        dirEntry.redirect = (dirEntry.mimetypeInteger === 0xffff);
        if (dirEntry.redirect) {
            dirEntry.redirectTarget = readInt(data, 8, 4);
        } else {
            dirEntry.cluster = readInt(data, 8, 4);
            dirEntry.blob = readInt(data, 12, 4);
        }
        var pos = dirEntry.redirect ? 12 : 16;
        if (data.subarray) {
            dirEntry.url = utf8.parse(data.subarray(pos), true);
            for (pos; pos <= MAX_SUPPORTED_DIRENTRY_SIZE; pos++) {
                if (data[pos] === 0) break;
            }
            if (data[pos] === 0) {
                dirEntry.title = utf8.parse(data.subarray(pos + 1), true);
            } else {
                // DEV: If you encounter this warning in console, it means that a very large dirEntry.url has exceeded the maximum supported
                // dirEntry size. Consider increasing MAX_SUPPORTED_DIRENTRY_SIZE if such warnings are encountered regularly with a ZIM.
                console.warn('WARNING! A Directory Entry URL larger than ' + MAX_SUPPORTED_DIRENTRY_SIZE + ' bytes was encountered! ' +
                    'The dirEntry.url is likely to be invalid.', dirEntry.url
                );
            }
            return new zimDirEntry.DirEntry(that, dirEntry);
        }
    });
};

/**
 * Find a Directory Entry based on its URL Pointer index
 * @param {Integer} index The URL Pointer index to the DirEntry
 * @returns {Promise<DirEntry>} A Promise for the requested DirEntry
 */
ZIMFile.prototype.dirEntryByUrlIndex = function (index) {
    var that = this;
    return that._readInteger(that.urlPtrPos + index * 8, 8).then(function (dirEntryPos) {
        return that.dirEntry(dirEntryPos);
    });
};

/**
 * Find a Directory Entry based on its Title Pointer index
 * @param {Integer} index The Title Pointer index to the DirEntry
 * @returns {Promise<DirEntry>} A Promise for the requested DirEntry
 */
ZIMFile.prototype.dirEntryByTitleIndex = function (index) {
    var that = this;
    // Use v1 title pointerlist if available, or fall back to legacy v0 list
    var ptrList = that.articlePtrPos || that.titlePtrPos;
    return that._readInteger(ptrList + index * 4, 4).then(function (urlIndex) {
        return that.dirEntryByUrlIndex(urlIndex);
    });
};

/**
 * Read and if necessary decompress a BLOB based on its cluster number and blob number
 * @param {Integer} cluster The cluster number where the blob is to be found
 * @param {Integer} blob The blob number within the cluster
 * @param {Boolean} meta If true, and if the cluster is uncompressed, the function will return only the blob's metadata
 *        (its archive offset and its size), otherwise return null
 * @returns {Promise<Uint8Array>} A Promise for the BLOB's data
 */
ZIMFile.prototype.blob = function (cluster, blob, meta) {
    var that = this;
    return this._readSlice(this.clusterPtrPos + cluster * 8, 16).then(function (clusterOffsets) {
        var clusterOffset = readInt(clusterOffsets, 0, 8);
        var nextCluster = readInt(clusterOffsets, 8, 8);
        // DEV: The method below of calculating cluster size is not safe: see https://github.com/openzim/libzim/issues/84#issuecomment-612962250
        // var thisClusterLength = nextCluster - clusterOffset - 1;
        return that._readSlice(clusterOffset, 1).then(function (compressionType) {
            var decompressor;
            var plainBlobReader = function (offset, size, dataPass) {
                // Check that we are not reading beyond the end of the cluster
                var offsetStart = clusterOffset + 1 + offset;
                if (offsetStart < nextCluster) {
                    // Gratuitous parentheses added for legibility
                    size = (offsetStart + size) <= nextCluster ? size : (nextCluster - offsetStart);
                    // DEV: This blob reader is called twice: on the first pass it reads the cluster's blob list,
                    // and on the second pass ("dataPass") it is ready to read the blob's data
                    if (meta && dataPass) {
                        // If only metadata were requested and we are on the data pass, we should now have them
                        return {
                            ptr: offsetStart,
                            size: size
                        };
                    } else {
                        return that._readSlice(offsetStart, size);
                    }
                } else {
                    return Promise.resolve(new Uint8Array(0).buffer);
                }
            };
            // If only metadata were requested and the cluster is compressed, return null (this is probably a ZIM format error)
            // DEV: This is because metadata are only requested for finding absolute offsets into uncompressed clusters,
            // principally for finding the start and size of a title pointer listing
            if (meta && compressionType[0] > 1) return null;
            if (compressionType[0] === 0 || compressionType[0] === 1) {
                // uncompressed
                decompressor = { readSliceSingleThread: plainBlobReader };
            } else if (compressionType[0] === 4) {
                decompressor = new xz.Decompressor(plainBlobReader);
            } else if (compressionType[0] === 5) {
                decompressor = new zstd.Decompressor(plainBlobReader);
            } else {
                return new Uint8Array(); // unsupported compression type
            }
            return decompressor.readSliceSingleThread(blob * 4, 8, false).then(function (data) {
                var blobOffset = readInt(data, 0, 4);
                var nextBlobOffset = readInt(data, 4, 4);
                return decompressor.readSliceSingleThread(blobOffset, nextBlobOffset - blobOffset, true);
            });
        });
    });
};

/**
 * A Directory Listing object
 * @typedef {Object} DirListing A list of pointers to directory entries (via the URL pointerlist)
 * @property {String} path The path (url) to the directory entry for the Listing
 * @property {String} ptrName The name of the pointer to the Listing's data that will be added to the ZIMFile obect
 * @property {String} countName The name of the key that will contain the number of entries in the Listing, to be added to the ZIMFile object
 */

/**
 * Read the metadata (archive offset pointer, and number of entiries) of one or more ZIM directory Listings.
 * This supports reading a subset of user content that might be ordered differently from the main URL pointerlist.
 * In particular, it supports the v1 article pointerlist, which contains articles sorted by title, superseding the article
 * namespace ('A') in legazy ZIM archives.
 * @param {Array<DirListing>} listings An array of DirListing objects (see zimArchive.js for examples)
 * @returns {Promise} A promise that populates calculated entries in the ZIM file header
 */
ZIMFile.prototype.setListings = function (listings) {
    var that = this;
    // If we are in a legacy ZIM archive, we need to calculate the true article count (of entries in the A namespace)
    // This effectively emulates the v1 article pointerlist
    if (this.minorVersion === 0) {
        // Initiate a binary search for the first or last article
        var getArticleIndexByOrdinal = function (ordinal) {
            return util.binarySearch(0, that.entryCount, function (i) {
                return that.dirEntryByTitleIndex(i).then(function (dirEntry) {
                    var ns = dirEntry.namespace;
                    var url = ns + '/' + dirEntry.getTitleOrUrl();
                    var prefix = ordinal === 'first' ? 'A' : 'B';
                    if (prefix < ns) return -1;
                    else if (prefix > ns) return 1;
                    return prefix < url ? -1 : 1;
                });
            }, true).then(function (index) {
                return index;
            });
        };
        getArticleIndexByOrdinal('first').then(function (idxFirstArticle) {
            return getArticleIndexByOrdinal('last').then(function (idxLastArticle) {
                // Technically idxLastArticle points to the entry after the last article in the 'A' namespace,
                // We subtract the first from the last to get the number of entries in the 'A' namespace
                that.articlePtrPos = that.titlePtrPos + idxFirstArticle * 4;
                that.articleCount = idxLastArticle - idxFirstArticle;
                console.debug('Calculated article count is: ' + that.articleCount);
            });
        });
    }
    var highestListingVersion = 0;
    var listingAccessor = function (listing) {
        if (!listing) {
            // No more listings, so exit
            console.debug('ZIM DirListing version: ' + highestListingVersion + (highestListingVersion ? '' : ' (legacy)'), that);
            console.debug('Article count is: ' + that.articleCount);
            if (that.fullTextIndex) console.debug('ZIM has fullTextIndex with listed size: ' + that.fullTextIndexSize);
            return null;
        }
        // Check if we already have this listing's values, so we don't do redundant binary searches
        if (that[listing.ptrName] && that[listing.countName]) {
            highestListingVersion = Math.max(~~listing.path.replace(/.+(\d)$/, '$1'), highestListingVersion);
            // Get the next listing
            return listingAccessor(listings.pop());
        }
        // Initiate a binary search for the listing URL
        return util.binarySearch(0, that.entryCount, function (i) {
            return that.dirEntryByUrlIndex(i).then(function (dirEntry) {
                var url = dirEntry.namespace + '/' + dirEntry.url;
                if (listing.path < url) {
                    return -1;
                } else if (listing.path > url) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }).then(function (index) {
            if (index === null) return null;
            return that.dirEntryByUrlIndex(index);
        }).then(function (dirEntry) {
            if (!dirEntry) return null;
            // Detect a full text index
            if (/fulltext\//.test(dirEntry.url)) {
                that[listing.ptrName] = dirEntry.namespace + '/' + dirEntry.url;
            }
            // Request the metadata for the blob represented by the dirEntry
            return that.blob(dirEntry.cluster, dirEntry.blob, true);
        }).then(function (metadata) {
            // Note that we do not accept a listing if its size is 0, i.e. if it contains no data
            // (although this should not occur, we have been asked to handle it - see kiwix-js #708)
            if (metadata && metadata.size) {
                that[listing.ptrName] = metadata.ptr;
                that[listing.countName] = metadata.size / 4; // Each entry uses 4 bytes
                highestListingVersion = Math.max(~~listing.path.replace(/.+(\d)$/, '$1'), highestListingVersion);
            }
            // Get the next Listing
            return listingAccessor(listings.pop());
        }).catch(function (err) {
            console.warn('There was an error accessing a Directory Listing', err);
        });
    };
    return listingAccessor(listings.pop());
};

/**
 * Reads the whole MIME type list and returns it as a populated Map
 * The mimeTypeMap is extracted once after the user has picked the ZIM file
 * and is stored as ZIMFile.mimeTypes
 * @param {File} file The ZIM file (or first file in array of files) from which the MIME type list
 *      is to be extracted
 * @param {Integer} mimeListPos The offset in <file> at which the MIME type list is found
 * @param {Integer} urlPtrPos The offset of URL Pointer List in the archive
 * @returns {Promise} A promise for the MIME Type list as a Map
 */
function readMimetypeMap (file, mimeListPos, urlPtrPos) {
    var typeMap = new Map();
    var size = urlPtrPos - mimeListPos;
    // ZIM archives produced since May 2020 relocate the URL Pointer List to the end of the archive
    // so we limit the slice size to max 1024 bytes in order to prevent reading the entire archive into an array buffer
    // See https://github.com/openzim/libzim/issues/353
    size = size > 1024 ? 1024 : size;
    return util.readFileSlice(file, mimeListPos, mimeListPos + size).then(function (data) {
        if (data.subarray) {
            var i = 0;
            var pos = -1;
            var mimeString;
            while (pos < size) {
                pos++;
                mimeString = utf8.parse(data.subarray(pos), true);
                // If the parsed data is an empty string, we have reached the end of the MIME type list, so break
                if (!mimeString) break;
                // Store the parsed string in the Map
                typeMap.set(i, mimeString);
                i++;
                while (data[pos]) {
                    pos++;
                }
            }
        }
        return typeMap;
    }).catch(function (err) {
        console.error('Unable to read MIME type list', err);
        return new Map();
    });
}

return {
    /**
     * @param {Array<File>} fileArray An array of picked archive files
     * @returns {Promise<Object>} A Promise for the ZimFile Object
     */
    fromFileArray: function (fileArray) {
        // Array of blob objects should be sorted by their name property
        fileArray.sort(function (a, b) {
            var nameA = a.name.toUpperCase();
            var nameB = b.name.toUpperCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });
        return util.readFileSlice(fileArray[0], 0, 80).then(function (header) {
            var mimeListPos = readInt(header, 56, 8);
            var urlPtrPos = readInt(header, 32, 8);
            return readMimetypeMap(fileArray[0], mimeListPos, urlPtrPos).then(function (mapData) {
                var zf = new ZIMFile(fileArray);
                // Add an abstract archive name (ignoring split file extensions)
                // Be careful because some file names may contain a path, e.g. when setting remote files as blobs in testing
                zf.name = fileArray[0].name.replace(/^.*?([^/]+\.zim)\w?\w?$/i, '$1');
                // Provide a temporary, per-session numeric ZIM ID used in filecache.js
                zf.id = fileIDs.get(zf.name);
                if (zf.id === undefined) {
                    zf.id = tempFileId++;
                    fileIDs.set(zf.name, zf.id);
                }
                // For a description of these values, see https://wiki.openzim.org/wiki/ZIM_file_format
                zf.majorVersion = readInt(header, 4, 2); // Not currently used by this implementation
                zf.minorVersion = readInt(header, 6, 2); // Used to determine the User Content namespace
                zf.entryCount = readInt(header, 24, 4);
                zf.articleCount = null; // Calculated async by setListings() called from zimArchive.js
                zf.clusterCount = readInt(header, 28, 4);
                zf.urlPtrPos = urlPtrPos;
                zf.titlePtrPos = readInt(header, 40, 8);
                zf.articlePtrPos = null; // Calculated async by setListings()
                zf.fullTextIndex = null; // Calculated async by setListings()
                zf.fullTextIndexSize = null; // Calbulated async by setListings()
                zf.clusterPtrPos = readInt(header, 48, 8);
                zf.mimeListPos = mimeListPos;
                zf.mainPage = readInt(header, 64, 4);
                zf.layoutPage = readInt(header, 68, 4);
                zf.mimeTypes = mapData;
                return zf;
            });
        });
    }
};
});
__def("zimArchive", ['zimfile', 'zimDirEntry', 'util', 'uiUtil', 'utf8', 'translateUI'], function(zimfile, zimDirEntry, util, uiUtil, utf8, translateUI){
/**
 * zimArchive.js: Support for archives in ZIM format.
 *
 * Copyright 2015-2023 Mossroy, Jaifroid and contributors
 * Licence GPL v3:
 *
 * This file is part of Kiwix.
 *
 * Kiwix is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public Licence as published by
 * the Free Software Foundation, either version 3 of the Licence, or
 * (at your option) any later version.
 *
 * Kiwix is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public Licence for more details.
 *
 * You should have received a copy of the GNU General Public Licence
 * along with Kiwix (file LICENSE-GPLv3.txt).  If not, see <http://www.gnu.org/licenses/>
 */

'use strict';

/* global params */







/**
 * ZIM Archive
 *
 * @typedef ZIMArchive
 * @property {ZIMFile} file The ZIM file (instance of ZIMFile, that might physically be split into several actual _files)
 * @property {String} counter Counter of various types of content in the archive
 * @property {String} creator Creator of the content
 * @property {String} date Date of the creation of the archive
 * @property {String} description Description of the content
 * @property {String} language Language of the content
 * @property {String} name Name of the archive
 * @property {String} publisher Publisher of the content
 * @property {String} title Title of the content
 * @property {String} zimType Extended property: currently either 'open' for OpenZIM file type, or 'zimit' for the warc2zim file type used by Zimit
 */

/**
 * @callback callbackZIMArchive
 * @param {ZIMArchive} zimArchive Ready-to-use ZIMArchive
 */

/**
 * @callback callbackMetadata
 * @param {String} data metadata string
 */

/**
 * @param {Worker} LZ A Web Worker to run the libzim Web Assembly binary
 */
var LZ;

/**
 * Creates a ZIM archive object to access the ZIM file at the given path in the given storage.
 * This constructor can also be used with a single File parameter.
 *
 * @param {StorageFirefoxOS|Array<Blob>} storage Storage (in this case, the path must be given) or Array of Files (path parameter must be omitted)
 * @param {String} path The Storage path for an OS that requires this to be specified
 * @param {callbackZIMArchive} callbackReady The function to call when the archive is ready to use
 * @param {callbackZIMArchive} callbackError The function to call when an error occurs
 */
function ZIMArchive (storage, path, callbackReady, callbackError) {
    var that = this;
    that.file = null;
    var whenZimReady = function () {
        // Add time-critical metadata from the M/ namespace that you need early access to here
        // Note that adding metadata here delays the reporting of the ZIM archive as ready
        // Further metadata are added in the background below, and can be accessed later
        return Promise.all([
            that.addMetadataToZIMFile('Creator'),
            that.addMetadataToZIMFile('Publisher'),
            that.addMetadataToZIMFile('Scraper'),
            that.addMetadataToZIMFile('Name'),
            that.addMetadataToZIMFile('Language')
        ]).then(function () {
            console.debug('ZIMArchive ready, metadata will be added in the background');
            // Add non-time-critical metadata to archive in background so as not to delay opening of the archive
            // DEV: Note that it does not make sense to extract illustration (icon) metadata here. Instead, if you implement use of the illustration
            // metadata as icons for the loaded ZIM [kiwix-js #886], you should simply use the ZIMArchive.getMetadata() function when needed
            setTimeout(function () {
                Promise.all([
                    that.addMetadataToZIMFile('Counter'),
                    that.addMetadataToZIMFile('Date'),
                    that.addMetadataToZIMFile('Description'),
                    that.addMetadataToZIMFile('Source'),
                    that.addMetadataToZIMFile('Title')
                ]).then(function () {
                    console.debug('ZIMArchive metadata loaded:', that);
                });
            }, 1000); // DEV: If you need any of the above earlier, you can alter this delay
            // We need to get the landing page of any Zimit archive opened
            // Note that the test below catches both zimit and zimit2 types
            if (/zimit/.test(that.zimType)) {
                return that.setZimitMetadata().then(function () {
                    callbackReady(that);
                });
            } else {
                // All listings should be loaded, so we can now call the callback
                callbackReady(that);
            }
        });
    };
    var createZimfile = function (fileArray) {
        return zimfile.fromFileArray(fileArray).then(function (file) {
            that.file = file;
            // Clear the previous libzimWoker
            LZ = null;
            // Set a global parameter to report the search provider type
            params.searchProvider = 'title';
            // File has been created, but we need to add any Listings which extend the archive metadata
            return that.file.setListings([
                // Provide here any Listings for which we need to extract metadata as key:value obects to be added to the file
                // 'ptrName' and 'countName' contain the key names to be set in the archive file object
                {
                    // This defines the standard v0 (legacy) title index that contains listings for every entry in the ZIM (not just articles)
                    // It represents the same index that is referenced in the ZIM archive header
                    path: 'X/listing/titleOrdered/v0',
                    ptrName: 'titlePtrPos',
                    countName: 'entryCount'
                },
                {
                    // This defines a new version 1 index that is present in no-namespace ZIMs, and contains a title-ordered list of articles
                    path: 'X/listing/titleOrdered/v1',
                    ptrName: 'articlePtrPos',
                    countName: 'articleCount'
                },
                {
                    // This tests for and specifies the existence of any Xapian Full Text Index
                    path: 'X/fulltext/xapian',
                    ptrName: 'fullTextIndex',
                    countName: 'fullTextIndexSize'
                }
            ]).then(function () {
                that.libzimReady = null;
                // There is currently an exception thrown in the libzim wasm if we attempt to load a split ZIM archive, so we work around
                // In case of a split ZIM, It will not be loaded properly by libzim if libzim is enabled
                var isSplitZim = /\.zima.$/i.test(that.file._files[0].name);
                if (that.file.fullTextIndex && (params.debugLibzimASM || !isSplitZim && typeof Atomics !== 'undefined' &&
                    // Note that Android and NWJS currently throw due to problems with Web Worker context
                    !/Android/.test(params.appType) && !(window.nw && that.file._files[0].readMode === 'electron')) || params.useLibzim) {
                    var libzimReaderType = params.libzimMode;
                    if (libzimReaderType === 'default') libzimReaderType = 'WebAssembly' in self ? 'wasm.dev' : 'asm.dev';
                    console.log('[DEBUG] Instantiating libzim ' + libzimReaderType + ' Web Worker...');
                    LZ = new Worker('js/lib/libzim-' + libzimReaderType + '.js');
                    that.callLibzimWorker({ action: 'init', files: that.file._files }).then(function () {
                        that.libzimReady = 'ready';
                        // If user is using libzim for reading the file, we have delayed the callback till now
                        if (params.useLibzim) whenZimReady();
                        params.searchProvider = 'fulltext: ' + libzimReaderType;
                        // Update the API panel
                        uiUtil.reportSearchProviderToAPIStatusPanel(params.searchProvider);
                    }).catch(function (err) {
                        uiUtil.reportSearchProviderToAPIStatusPanel(params.searchProvider + ': ERROR');
                        console.error('The libzim worker could not be instantiated!', err);
                        that.libzimReady = 'error';
                    });
                } else {
                    // var message = 'Full text searching is not available because ';
                    if (!that.file.fullTextIndex) {
                        params.searchProvider += ': no_fulltext'; // message += 'this ZIM does not have a full-text index.';
                    } else if (isSplitZim) {
                        params.searchProvider += ': split_zim'; // message += 'the ZIM archive is split.';
                    } else if (typeof Atomics === 'undefined') {
                        params.searchProvider += ': no_atomics'; // message += 'this browser does not support Atomic operations.';
                    } else if (/Android/.test(params.appType)) {
                        params.searchProvider += ': no_sharedArrayBuffer';
                    } else if (params.debugLibzimASM === 'disable') {
                        params.searchProvider += ': disabled';
                    } else {
                        params.searchProvider += ': unknown';
                    }
                    uiUtil.reportSearchProviderToAPIStatusPanel(params.searchProvider);
                }
                // Set the archive file type ('open', 'zimit' or 'zimit2')
                return that.addMetadataToZIMFile('Scraper').then(function () {
                    params.zimType = that.setZimType();
                    // If user is not using libzim for reading the file, we can call the ready callback now
                    if (!params.useLibzim) whenZimReady();
                });
            }).catch(function (err) {
                console.warn('Error setting archive listings: ', err);
            });
        });
    };
    if (storage && !path) {
        var fileList = storage;
        // We need to convert the FileList into an Array
        var fileArray = [].slice.call(fileList);
        // The constructor has been called with an array of File/Blob parameter
        createZimfile(fileArray);
    } else {
        if (/.*zim..$/.test(path)) {
            // split archive
            that._searchArchiveParts(storage, path.slice(0, -2)).then(function (fileArray) {
                createZimfile(fileArray);
            }).catch(function (error) {
                callbackError((translateUI.t('dialog-readsplitzim-error-message') || 'Error reading files in split archive') + ' ' + path + '&nbsp;: ' + error,
                    translateUI.t('dialog-readzim-error-title') || 'Error reading archive file(s)');
            });
        } else {
            storage.get(path).then(function (file) {
                createZimfile([file]);
            }).catch(function (error) {
                callbackError((translateUI.t('dialog-readzim-error-message') || 'Error reading ZIM file') + ' ' + path + '&nbsp;: ' + error,
                    translateUI.t('dialog-readzim-error-title') || 'Error reading archive file(s)');
            });
        }
    }
}

/**
 * Searches the directory for all parts of a split archive.
 * @param {Storage} storage storage interface
 * @param {String} prefixPath path to the split files, missing the "aa" / "ab" / ... suffix.
 * @returns {Promise} that resolves to the array of file objects found.
 */
ZIMArchive.prototype._searchArchiveParts = function (storage, prefixPath) {
    var fileArray = [];
    var nextFile = function (part) {
        var suffix = String.fromCharCode(0x61 + Math.floor(part / 26)) + String.fromCharCode(0x61 + part % 26);
        return storage.get(prefixPath + suffix)
            .then(function (file) {
                fileArray.push(file);
                return nextFile(part + 1);
            }, function (error) {
                console.error('Error reading split archive file ' + prefixPath + suffix + ': ', error);
                return fileArray;
            });
    };
    return nextFile(0);
};

/**
 *
 * @returns {Boolean}
 */
ZIMArchive.prototype.isReady = function () {
    return this.file !== null;
};

/**
 * Detects whether the supplied archive is a Zimit-style archive or an OpenZIM archive and
 * sets a zimType property accordingly; also returns the detected type. Extends ZIMArchive.
 * @returns {String} 'zimit' for a classic Zimit archive, 'zimit2' for a zimit2 archive, or 'open' for an OpenZIM archive
 */
ZIMArchive.prototype.setZimType = function () {
    var archiveType = null;
    if (this.isReady()) {
        archiveType = 'open';
        this.file.mimeTypes.forEach(function (v) {
            if (/warc-headers/i.test(v)) archiveType = 'zimit';
        });
        if (archiveType !== 'zimit' && this.scraper) {
            // Check if it's a zimit2 type archive by seeing if the scraper contains 'warc2zim'
            archiveType = /warc2zim|zimit/i.test(this.scraper) ? 'zimit2' : archiveType;
        }
        this.zimType = archiveType;
        console.debug('Archive type set to: ' + archiveType);
    } else {
        console.error('ZIMArchive is not ready! Cannot set ZIM type.');
    }
    return archiveType;
};

/**
 * Looks for the DirEntry of the main page
 * @param {callbackDirEntry} callback
 * @returns {Promise} that resolves to the DirEntry
 */
ZIMArchive.prototype.getMainPageDirEntry = function (callback) {
    if (this.isReady()) {
        var mainPageUrlIndex = this.file.mainPage;
        this.file.dirEntryByUrlIndex(mainPageUrlIndex).then(callback);
    }
};

/**
 *
 * @param {String} dirEntryId
 * @returns {DirEntry}
 */
ZIMArchive.prototype.parseDirEntryId = function (dirEntryId) {
    return zimDirEntry.DirEntry.fromStringId(this.file, dirEntryId);
};

/**
 * @callback callbackDirEntryList
 * @param {Array.<DirEntry>} dirEntryArray Array of DirEntries found
 */

/**
 * Look for DirEntries with title starting with the prefix of the current search object.
 * For now, ZIM titles are case sensitive.
 * So, as workaround, we try several variants of the prefix to find more results.
 * This should be enhanced when the ZIM format will be modified to store normalized titles
 * See https://phabricator.wikimedia.org/T108536
 *
 * @param {Object} search The current appstate.search object
 * @param {callbackDirEntryList} callback The function to call with the result
 * @param {Boolean} noInterim A flag to prevent callback until all results are ready (used in testing)
 */
ZIMArchive.prototype.findDirEntriesWithPrefix = function (search, callback, noInterim) {
    var that = this;
    // Establish array of initial values that must be searched first. All of these patterns are generated by the full
    // search type, and some by basic, but we need the most common patterns to be searched first, as it returns search
    // results much more quickly if we do this (and the user can click on a result before the rarer patterns complete)
    // NB duplicates are removed before processing search array
    var startArray = [];
    var dirEntries = [];
    search.scanCount = 0;
    // Launch a full-text search if possible
    if (LZ) {
        that.findDirEntriesFromFullTextSearch(search, dirEntries).then(function (fullTextDirEntries) {
            // If user initiated a new search, cancel this one
            // In particular, do not set the search status back to 'complete'
            // as that would cause outdated results to unexpectedly pop up
            if (search.status === 'cancelled') return callback([], search);
            dirEntries = fullTextDirEntries;
            search.status = 'complete';
            callback(dirEntries, search);
        });
    }
    // Ensure a search is done on the string exactly as typed
    startArray.push(search.prefix);
    // Normalize any spacing and make string all lowercase
    var prefix = search.prefix.replace(/\s+/g, ' ').toLocaleLowerCase();
    // Add lowercase string with initial uppercase (this is a very common pattern)
    startArray.push(prefix.replace(/^./, function (m) {
        return m.toLocaleUpperCase();
    }));
    // Add pure lowercase string (rarer)
    startArray.push(prefix);
    // Get the full array of combinations to check number of combinations
    var fullCombos = util.removeDuplicateStringsInSmallArray(util.allCaseFirstLetters(prefix, 'full'));
    // Put cap on exponential number of combinations (five words = 3^5 = 243 combinations)
    search.type = fullCombos.length < 300 ? 'full' : 'basic';
    // We have to remove duplicate string combinations because util.allCaseFirstLetters() can return some combinations
    // where uppercase and lowercase combinations are exactly the same, e.g. where prefix begins with punctuation
    // or currency signs, for languages without case, or where user-entered case duplicates calculated case
    var prefixVariants = util.removeDuplicateStringsInSmallArray(
        startArray.concat(
            // Get basic combinations first for speed of returning results
            util.allCaseFirstLetters(prefix).concat(
                search.type === 'full' ? fullCombos : []
            )
        )
    );
    function searchNextVariant () {
        // If user has initiated a new search, cancel this one
        if (search.status === 'cancelled') return callback([], search);
        if (prefixVariants.length === 0 || dirEntries.length >= search.size) {
            // We have found all the title-search entries we are going to get, so indicate search type if we're still searching
            if (LZ && search.status !== 'complete') search.type = 'fulltext';
            else search.status = 'complete';
            return callback(dirEntries, search);
        }
        // Dynamically populate list of articles
        search.status = 'interim';
        if (!noInterim) callback(dirEntries, search);
        search.found = dirEntries.length;
        var prefix = prefixVariants[0];
        // console.debug('Searching for: ' + prefixVariants[0]);
        prefixVariants = prefixVariants.slice(1);
        that.findDirEntriesWithPrefixCaseSensitive(prefix, search,
            function (newDirEntries, countReport, interim) {
                search.countReport = countReport;
                if (search.status === 'cancelled') return callback([], search);
                if (!noInterim && countReport === true) return callback(dirEntries, search);
                if (interim) { // Only push interim results (else results will be pushed again at end of variant loop)
                    [].push.apply(dirEntries, newDirEntries);
                    search.found = dirEntries.length;
                    if (!noInterim && newDirEntries.length) return callback(dirEntries, search);
                } else return searchNextVariant();
            }
        );
    }
    searchNextVariant();
};

/**
 * A method to return the namespace in the ZIM file that contains the primary user content. In old-format ZIM files (minor
 * version 0) there are a number of content namespaces, but the primary one in which to search for titles is 'A'. In new-format
 * ZIMs (minor version 1) there is a single content namespace 'C'. See https://openzim.org/wiki/ZIM_file_format. This method
 * throws an error if it cannot determine the namespace or if the ZIM is not ready.
 * @returns {String} The content namespace for the ZIM archive
 */
ZIMArchive.prototype.getContentNamespace = function () {
    if (this.isReady()) {
        var ver = this.file.minorVersion;
        // DEV: There are currently only three defined values for minorVersion in the OpenZIM specification
        // If this changes, adapt the error checking and return values
        if (ver > 3) {
            console.error('Unknown ZIM minor version: ' + ver + '! Assuming content namespace is C.');
        }
        return ver === 0 ? 'A' : 'C';
    } else {
        throw new Error('We could not determine the content namespace because the ZIM file is not ready!');
    }
};

/**
 * Look for dirEntries with title starting with the given prefix (case-sensitive)
 *
 * @param {String} prefix The case-sensitive value against which dirEntry titles (or url) will be compared
 * @param {Object} search The appstate.search object (for comparison, so that we can cancel long binary searches)
 * @param {callbackDirEntryList} callback The function to call with the array of dirEntries with titles that begin with prefix
 */
ZIMArchive.prototype.findDirEntriesWithPrefixCaseSensitive = function (prefix, search, callback) {
    var that = this;
    var cns = this.getContentNamespace();
    // Search v1 article listing if available, otherwise fallback to v0
    var articleCount = this.file.articleCount || this.file.entryCount;
    util.binarySearch(0, articleCount, function (i) {
        return that.file.dirEntryByTitleIndex(i).then(function (dirEntry) {
            if (search.status === 'cancelled') return 0;
            var ns = dirEntry.namespace;
            // DEV: This search is redundant if we managed to populate articlePtrLst and articleCount, but it only takes two instructions and
            // provides maximum compatibility with rare ZIMs where attempts to find first and last article (in zimArchive.js) may have failed
            if (ns < cns) return 1;
            if (ns > cns) return -1;
            // We should now be in namespace A (old format ZIM) or C (new format ZIM)
            return prefix <= dirEntry.getTitleOrUrl() ? -1 : 1;
        });
    }, true).then(function (firstIndex) {
        var vDirEntries = [];
        var addDirEntries = function (index, lastTitle) {
            if (search.status === 'cancelled' || search.found >= search.size || index >= articleCount ||
            lastTitle && !~lastTitle.indexOf(prefix)) {
                // DEV: Diagnostics to be removed before merge
                if (vDirEntries.length) {
                    console.debug('Scanned ' + (index - firstIndex) + ' titles for "' + prefix +
                        '" (found ' + vDirEntries.length + ' match' + (vDirEntries.length === 1 ? ')' : 'es)'));
                }
                return {
                    dirEntries: vDirEntries,
                    nextStart: index
                };
            }
            return that.file.dirEntryByTitleIndex(index).then(function (dirEntry) {
                search.scanCount++;
                var title = dirEntry.getTitleOrUrl();
                // Only return dirEntries with titles that actually begin with prefix
                if (dirEntry.namespace === cns && title.indexOf(prefix) === 0) {
                    vDirEntries.push(dirEntry);
                    // Report interim result
                    callback([dirEntry], false, true);
                }
                return addDirEntries(index + 1, title);
            });
        };
        return addDirEntries(firstIndex);
    }).then(callback);
};

/**
 * Find Directory Entries corresponding to the requested search using Full Text search provided by libzim
 *
 * @param {Object} search The appstate.search object
 * @param {Array} dirEntries The array of already found Directory Entries
 * @returns {Promise<callbackDirEntry>} The augmented array of Directory Entries with titles that correspond to search
 */
ZIMArchive.prototype.findDirEntriesFromFullTextSearch = function (search, dirEntries) {
    var cns = this.getContentNamespace();
    var that = this;
    // We give ourselves an overhead in caclulating the results needed, because full-text search will return some results already found
    // var resultsNeeded = Math.floor(params.maxSearchResultsSize - dirEntries.length / 2);
    var resultsNeeded = params.maxSearchResultsSize;
    var searchType = params.libzimSearchType || 'search';
    return this.callLibzimWorker({ action: searchType, text: search.prefix, numResults: resultsNeeded }).then(function (returned) {
        if (returned) {
            var dirEntryPaths = [];
            var fullTextPaths = [];
            var snippets = [];
            // Collect all the found paths for the dirEntries
            for (var i = 0; i < dirEntries.length; i++) {
                dirEntryPaths.push(dirEntries[i].namespace + '/' + dirEntries[i].url);
            }
            // Collect all the paths for full text search, pruning as we go
            var path;
            var snippet;
            for (var j = 0; j < returned.results.length; j++) {
                search.scanCount++;
                path = returned.results[j].path;
                snippet = returned.results[j].snippet;
                // Full-text search result paths are missing the namespace in Type 1 ZIMs, so we add it back
                path = cns === 'C' ? cns + '/' + path : path;
                // If the path is already in the dirEntries, we do not need to add it again
                if (~dirEntryPaths.indexOf(path)) {
                    // Add the snippet to the existing DirEntry
                    for (var k = 0; k < dirEntries.length; k++) {
                        if (dirEntries[k].namespace + '/' + dirEntries[k].url === path) {
                            dirEntries[k].snippet = snippet;
                            break;
                        }
                    }
                    // We do not need to add it again, so we continue
                    continue;
                }
                fullTextPaths.push(path);
                snippets.push(snippet);
            }
            var promisesForDirEntries = [];
            for (let k = 0; k < fullTextPaths.length; k++) {
                promisesForDirEntries.push(that.getDirEntryByPath(fullTextPaths[k]));
            }
            return Promise.all(promisesForDirEntries).then(function (fullTextDirEntries) {
                for (var l = 0; l < fullTextDirEntries.length; l++) {
                    // Add snippet to the new DirEntry
                    fullTextDirEntries[l].snippet = snippets[l];
                    dirEntries.push(fullTextDirEntries[l]);
                }
                return dirEntries;
            });
        } else {
            return dirEntries;
        }
    });
};

/**
 * Calls the libzim Web Worker with the given parameters, and returns a Promise with its response
 *
 * @param {Object} parameters
 * @returns {Promise}
 */
ZIMArchive.prototype.callLibzimWorker = function (parameters) {
    return new Promise(function (resolve, reject) {
        console.debug('Calling libzim WebWorker with parameters', parameters);
        var tmpMessageChannel = new MessageChannel();
        // var t0 = performance.now();
        tmpMessageChannel.port1.onmessage = function (event) {
            // var t1 = performance.now();
            // var readTime = Math.round(t1 - t0);
            // console.debug("Response given by the WebWorker in " + readTime + " ms", event.data);
            resolve(event.data);
        };
        tmpMessageChannel.port1.onerror = function (event) {
            // var t1 = performance.now();
            // var readTime = Math.round(t1 - t0);
            // console.error("Error sent by the WebWorker in " + readTime + " ms", event.data);
            reject(event.data);
        };
        LZ.postMessage(parameters, [tmpMessageChannel.port2]);
    });
};

/**
 * @callback callbackDirEntry
 * @param {DirEntry} dirEntry The DirEntry found
 */

/**
 *
 * @param {DirEntry} dirEntry
 * @param {callbackDirEntry} callback
 */
ZIMArchive.prototype.resolveRedirect = function (dirEntry, callback) {
    this.file.dirEntryByUrlIndex(dirEntry.redirectTarget).then(callback);
};

/**
 * @callback callbackStringContent
 * @param {String} content String content
 */

/**
 *
 * @param {DirEntry} dirEntry
 * @param {callbackStringContent} callback
 */
ZIMArchive.prototype.readUtf8File = function (dirEntry, callback) {
    if (params.isLandingPage && this.zimType === 'zimit') {
        // Mark the directory entry as a redirect
        dirEntry.zimitRedirect = this.zimitStartPage;
    }
    var that = this;
    return dirEntry.readData().then(function (data) {
        var html = that.getUtf8FromData(data);
        callback(dirEntry, html);
    });
};

/**
 * @callback callbackBinaryContent
 * @param {Uint8Array} content binary content
 */

/**
 * Read a binary file.
 * @param {DirEntry} dirEntry
 * @param {callbackBinaryContent} callback
 */
ZIMArchive.prototype.readBinaryFile = function (dirEntry, callback) {
    if (this.zimType === 'zimit' && params.isLandingPage) {
        // Mark the directory entry as a redirect
        dirEntry.zimitRedirect = this.zimitStartPage;
    }
    return dirEntry.readData().then(function (data) {
        callback(dirEntry, data);
    });
};

/**
 * Gets the UTF-8 string from the binary data
 * @param {Blob} data Binary content
 * @returns {String} UTF-8 string
 */
ZIMArchive.prototype.getUtf8FromData = function (data) {
    var decData;
    if (window.TextDecoder) {
        decData = new TextDecoder('utf-8').decode(data);
    } else {
        // Support for IE11 and Edge Legacy - only support UTF-8 decoding
        decData = utf8.parse(data);
    }
    return decData;
}

/**
 * Searches the URL pointer list of Directory Entries by pathname
 * @param {String} path The pathname of the DirEntry that is required (namespace + filename)
 * @return {Promise<DirEntry>} A Promise that resolves to a Directory Entry, or null if not found.
 */
ZIMArchive.prototype.getDirEntryByPath = function (path) {
    var that = this;
    return util.binarySearch(0, this.file.entryCount, function (i) {
        return that.file.dirEntryByUrlIndex(i).then(function (dirEntry) {
            var url = dirEntry.namespace + '/' + dirEntry.url;
            if (path < url) {
                return -1;
            } else if (path > url) {
                return 1;
            } else {
                return 0;
            }
        });
    }).then(function (index) {
        if (index === null) return null;
        return that.file.dirEntryByUrlIndex(index);
    }).then(function (dirEntry) {
        return dirEntry;
    });
};

/**
 *
 * @param {callbackDirEntry} callback
 */
ZIMArchive.prototype.getRandomDirEntry = function (callback) {
    // Prefer an article-only (v1) title pointer list, if available
    var articleCount = this.file.articleCount || this.file.entryCount;
    var index = Math.floor(Math.random() * articleCount);
    this.file.dirEntryByTitleIndex(index).then(callback);
};

/**
 * Read a Metadata string inside the ZIM file.
 * @param {String} key
 * @param {callbackMetadata} callback
 */
ZIMArchive.prototype.getMetadata = function (key, callback) {
    var that = this;
    this.getDirEntryByPath('M/' + key).then(function (dirEntry) {
        if (dirEntry === null || dirEntry === undefined) {
            console.warn('Title M/' + key + ' not found in the archive');
            callback();
        } else {
            that.readUtf8File(dirEntry, function (dirEntryRead, data) {
                callback(data);
            });
        }
    }).catch(function (e) {
        console.warn('Metadata with key ' + key + ' not found in the archive', e);
        callback();
    });
};

/**
 * Add Metadata to the ZIM file
 * @param {String} key The key of the metadata to add to the ZIM file
 * @returns {Promise<String>} A Promise that resolves with the metadata string, if it exists
 */
ZIMArchive.prototype.addMetadataToZIMFile = function (key) {
    var that = this;
    var lcaseKey = key.toLocaleLowerCase();
    // eslint-disable-next-line no-unused-vars
    return new Promise(function (resolve, _reject) {
        that.getMetadata(key, function (data) {
            data = data || '';
            that[lcaseKey] = data;
            resolve(data);
        });
    });
};

/**
 * Sets the Zimit metadata for the archive
 */
ZIMArchive.prototype.setZimitMetadata = function () {
    var that = this;
    // Get the landing page
    return this.file.dirEntryByUrlIndex(this.file.mainPage).then(function (dirEntry) {
        var findRedirectTarget = dirEntry.redirect ? function (dirEntry) {
            // If the landing page is a redirect, we need to find the target
            return that.file.dirEntryByUrlIndex(dirEntry.redirectTarget).then(function (newEntry) {
                return newEntry;
            });
        } : function (dirEntry) {
            return Promise.resolve(dirEntry);
        };
        return findRedirectTarget(dirEntry).then(function (reEntry) {
            // Note that in the case of zimit classic, the values below will be overwritten in the conditional clause
            that.zimitPseudoContentNamespace = reEntry.namespace + '/';
            that.zimitStartPage = reEntry.namespace + '/' + reEntry.url;
            that.zimitPrefix = reEntry.url.replace(/\/.*$/, '') + '/';
            if (that.zimType === 'zimit') {
                return reEntry.readData().then(function (data) {
                    var html = that.getUtf8FromData(data);
                    var redirect = html.match(/window\.mainUrl\s*=\s*(['"])https?:\/\/([^/]+)(.+?)\1/);
                    if (redirect && redirect[2] && redirect[3]) {
                        // Logic added to distinguish between Type 0 and Type 1 Zimit ZIMs
                        var relativeZimitPrefix = (reEntry.namespace === 'C' ? 'A/' : '') + redirect[2];
                        var zimitStartPage = reEntry.namespace + '/' + relativeZimitPrefix + redirect[3];
                        // Store a full Zimit prefix in the archive object
                        that.zimitPrefix = relativeZimitPrefix + '/';
                        that.zimitStartPage = zimitStartPage;
                        that.zimitPseudoContentNamespace = reEntry.namespace + '/' + (reEntry.namespace === 'C' ? 'A/' : '');
                    }
                });
            }
        });
    }).catch(function (e) {
        console.warn('Zimit metadata not found in this archive!', e);
    });
}

return {
    ZIMArchive: ZIMArchive
};
});
__def("zimArchiveLoader", ['translateUI', 'zimArchive'], function(translateUI, zimArchive){
/**
 * zimArchiveLoader.js: Functions to search and read ZIM archives.
 *
 * Copyright 2015-2024 Mossroy and contributors
 * Licence GPL v3:
 *
 * This file is part of Kiwix.
 *
 * Kiwix is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public Licence as published by
 * the Free Software Foundation, either version 3 of the Licence, or
 * (at your option) any later version.
 *
 * Kiwix is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public Licence for more details.
 *
 * You should have received a copy of the GNU General Public Licence
 * along with Kiwix (file LICENSE-GPLv3.txt).  If not, see <http://www.gnu.org/licenses/>
 */

'use strict';



/**
 * Create a ZIMArchive from DeviceStorage location
 * @param {DeviceStorage} storage
 * @param {String} path
 * @param {callbackZIMArchive} callbackReady
 * @param {callbackZIMArchive} callbackError
 * @returns {ZIMArchive}
 */
function loadArchiveFromDeviceStorage (storage, path, callbackReady, callbackError) {
    return new zimArchive.ZIMArchive(storage, path, callbackReady, callbackError);
}
/**
 * Create a ZIMArchive from Files
 * @param {Array.<File>} files
 * @param {callbackZIMArchive} callbackReady
 * @param {callbackZIMArchive} callbackError
 * @returns {ZIMArchive}
 */
function loadArchiveFromFiles (files, callbackReady, callbackError) {
    if (files.length >= 1) {
        return new zimArchive.ZIMArchive(files, null, callbackReady, callbackError);
    }
}

/**
 * @callback callbackPathList
 * @param {Array.<String>} directoryList List of directories
 */

/**
 *  Scans the DeviceStorage for archives
 *
 * @param {Array.<DeviceStorage>} storages List of DeviceStorage instances
 * @param {callbackPathList} callbackFunction Function to call with the list of directories where archives are found
 * @param {callbackPathList} callbackError Function to call in case of an error
 */
function scanForArchives (storages, callbackFunction, callbackError) {
    var directories = [];
    // NB storage.scanForArchives() already returns a native Promise, so no jQuery is needed here
    var promises = storages.map(function (storage) {
        return storage.scanForArchives()
            .then(function (dirs) {
                // Append in place (as $.merge did), because each storage adds to the same list
                directories.push.apply(directories, dirs);
                return true;
            });
    });
    Promise.all(promises).then(function () {
        callbackFunction(directories);
    }).catch(function (error) {
        callbackError((translateUI.t('dialog-scanstorage-error-message') || 'Error scanning your device storage:') + ' ' + error + '. ' +
        (translateUI.t('dialog-scanstorage-fxos-error-message') || ("If you're using the Firefox OS Simulator, please put the archives in " +
        'a "fake-sdcard" directory inside your Firefox profile ' +
        '(ex : ~/.mozilla/firefox/xxxx.default/extensions/fxos_2_x_simulator@mozilla.org/' +
        'profile/fake-sdcard/wikipedia_en_ray_charles_2015-06.zim)')), translateUI.t('dialog-scanstorage-fxos-error-title') || 'Error scanning Device Storage');
    });
}

return {
    loadArchiveFromDeviceStorage: loadArchiveFromDeviceStorage,
    loadArchiveFromFiles: loadArchiveFromFiles,
    scanForArchives: scanForArchives
};
});
window.KiwixEngine={libUrl:__LIB_URL,zimArchiveLoader:__req("zimArchiveLoader")};
})();