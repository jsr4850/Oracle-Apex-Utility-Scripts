///////////////////////////////////////////////////////////////////////////
//   NAME:       apexUtils.js
//   PURPOSE:    Javascript apex utility functions
//   VERSION:    1.0.0
//
//   Copyright (c) 2024 [Satwik]
//
//   Permission is hereby granted, free of charge, to any person obtaining a copy
//   of this software and associated documentation files (the "Software"), to deal
//   in the Software without restriction, including without limitation the rights
//   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//   copies of the Software, and to permit persons to whom the Software is
//   furnished to do so, subject to the following conditions:
//
//   The above copyright notice and this permission notice shall be included in all
//   copies or substantial portions of the Software.
//
//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//   SOFTWARE.
////////////////////////////////////////////////////////////////////////////

if (apex && apex.custom && apex.custom.util) {
  throw "Collision detected for apex.custom.util";
}

var apex = apex || {};
apex.custom = apex.custom || {};
apex.custom.util = {};

(function (apexUtil, $, console, gApexVersion, undefined) {
  "use strict";

  ////////////////////////////////////////////////////////////////////////////
  //
  //  Private variables
  //
  ////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////////
  //
  //  Public variables
  //
  ////////////////////////////////////////////////////////////////////////////
  apexUtil.apexVersion = apexUtil.apexVersion || {};

  ////////////////////////////////////////////////////////////////////////////
  //
  //  Private functions
  //
  ////////////////////////////////////////////////////////////////////////////
  var initApexVersion = function initApexVersion() {
    if (!gApexVersion) {
      console.error(
        "Not able to detect APEX version. " +
        "Please ensure #IMAGE_PREFIX#apex_version.js is loaded."
      );
      return;
    }

    apexUtil.apexVersion = {
      string: gApexVersion,
      array: gApexVersion.split("."),
    };

    apexUtil.apexVersion.major = parseInt(apexUtil.apexVersion.array[0]);
    apexUtil.apexVersion.minor = parseInt(apexUtil.apexVersion.array[1]);
    apexUtil.apexVersion.patchSet = parseInt(apexUtil.apexVersion.array[2]);
    apexUtil.apexVersion.other1 = parseInt(apexUtil.apexVersion.array[3]);
    apexUtil.apexVersion.other2 = parseInt(apexUtil.apexVersion.array[4]);
  };

  ////////////////////////////////////////////////////////////////////////////
  //
  //  Public functions
  //
  ////////////////////////////////////////////////////////////////////////////
  apexUtil.publicFunctions = {
    debug: {
      logLevel: 0,
      info: function () {
        if (publicFunctions.debug.logLevel > 3) {
          console.info.apply(this, arguments);
        }
      },
      debug: function () {
        if (publicFunctions.debug.logLevel > 4) {
          console.debug.apply(this, arguments);
        }
      },
      error: function () {
        console.error.apply(this, arguments);
      },
      warn: function () {
        console.warn.apply(this, arguments);
      },
    },
    utils: {
      showSpinner: function (pObj) {
        /* define loader */
        var faLoader = $("<div></div>");
        faLoader.attr("id", "loader" + $(pObj).attr("id"));
        faLoader.addClass("ct-loader");
        faLoader.css("display", "block");
        faLoader.css("margin", "0 auto");
        faLoader.css("text-align", "center");
        faLoader.css("padding", "10px");
        faLoader.css("position", "absolute");
        faLoader.css("top", "calc(50% - 42px)");
        faLoader.css("left", "calc(50% - 42px)");

        var faLoaderSpan = $("<span></span>");
        faLoaderSpan.css("background", "rgba(121,121,121,0.6)");
        faLoaderSpan.css("border-radius", "100%");
        faLoaderSpan.css("width", "42px");
        faLoaderSpan.css("height", "42px");
        faLoaderSpan.css("display", "inline-block");

        /* define refresh icon with animation */
        var faRefresh = $("<i></i>");
        faRefresh.addClass("fa fa-refresh fa-lg fa-anim-spin");

        faRefresh.css("padding", "5px");
        faRefresh.css("color", "white");
        /* append loader */
        faLoader.append(faLoaderSpan);
        faLoaderSpan.append(faRefresh);
        $(pObj).append(faLoader);
      },
      removeSpinner: function (pObj) {
        /* remove loader */
        $("#loader" + $(pObj).attr("id")).remove();
      },
      escapeHTML: function (str) {
        str = String(str);
        return str
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#x27;")
          .replace(/\//g, "&#x2F;");
      },
      isDefinedAndNotNull: function (pInput) {
        if (typeof pInput !== "undefined" && pInput !== null && pInput !== "") {
          return true;
        } else {
          return false;
        }
      },
      alertMessages: function (pStatus, pMessage) {
        try {
          if (pStatus) {
            apex.message.clearErrors(); // Clear all errors
            if (pStatus === 'E') {
              apex.message.showErrors([
                {
                  type: "error",
                  location: "page",
                  message: pMessage,
                  unsafe: false,
                },
              ]);
            }
            if (pStatus === 'S') {
              apex.message.showPageSuccess(pMessage);
            }
          }
        } catch (e) {
          apex.debug.error({
            module: "apexUtil.js",
            msg: "Error while trying alertMessages function",
            err: e,
          });
        }
      },
      varType: function (pObj) {
        if (typeof pObj === "object") {
          const arrayConstructor = [].constructor;
          const objectConstructor = {}.constructor;
          if (pObj.constructor === arrayConstructor) {
            return "array";
          }
          if (pObj.constructor === objectConstructor) {
            return "json";
          }
        } else {
          return typeof pObj;
        }
      },
      debounce: function (pFunction, pTimeout = 50) {
        let timer;
        return (...args) => {
          clearTimeout(timer);
          timer = setTimeout(function () {
            pFunction.apply(this, args);
          }, pTimeout);
        };
      },
      parseISOTimeString: function (str) {
        try {
          const arr = str.split(/\D+/);
          return new Date(
            Date.UTC(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5], arr[6])
          );
        } catch (e) {
          apex.debug.error({
            module: "apexUtil.js",
            msg: "Error while try to parse ISO Time String",
            err: e,
          });
        }
      },
      groupObjectArray: function (objectArr, jSONKey) {
        if (objectArr && Array.isArray(objectArr)) {
          return objectArr.reduce(function (retVal, x) {
            let key = x[jSONKey];
            if (key) {
              /* workaround for object sort of numbers */
              key = "\u200b" + key;
              (retVal[key] = retVal[key] || []).push(x);
            }
            return retVal;
          }, {});
        } else {
          return [];
        }
      },
      getDecimalSeperator: function () {
        try {
          return apex.locale.getDecimalSeparator();
        } catch (e) {
          apex.debug.error({
            module: "apexUtil.js",
            msg: "Error while try to get decimal seperator",
            err: e,
          });
          return;
        }
      },
      getGroupSeparator: function () {
        try {
          return apex.locale.getGroupSeparator();
        } catch (e) {
          apex.debug.error({
            module: "apexUtil.js",
            msg: "Error while try to get decimal seperator",
            err: e,
          });
          return;
        }
      },
      convertJSON2LowerCase: function (obj) {
        try {
          let output = {};
          for (let i in obj) {
            if (Object.prototype.toString.apply(obj[i]) === "[object Object]") {
              output[i.toLowerCase()] = util.convertJSON2LowerCase(obj[i]);
            } else if (
              Object.prototype.toString.apply(obj[i]) === "[object Array]"
            ) {
              output[i.toLowerCase()] = [];
              output[i.toLowerCase()].push(
                util.convertJSON2LowerCase(obj[i][0])
              );
            } else {
              output[i.toLowerCase()] = obj[i];
            }
          }

          return output;
        } catch (e) {
          apex.debug.error({
            module: "apexUtil.js",
            msg: "Error while to lower json",
            err: e,
          });
          return;
        }
      },
      cutString: function (text, textLength) {
        try {
          if (textLength < 0) {
            return text;
          } else {
            return text.length > textLength
              ? text.substring(0, textLength - 3) + "..."
              : text;
          }
        } catch (e) {
          return text;
        }
      },
      escapeHTML: function (str) {
        if (str === null) {
          return null;
        }
        if (typeof str === "undefined") {
          return;
        }
        if (typeof str === "object") {
          try {
            str = JSON.stringify(str);
          } catch (e) {
            /*do nothing */
          }
        }
        return apex.util.escapeHTML(String(str));
      },
      unEscapeHTML: function (str) {
        if (str === null) {
          return null;
        }
        if (typeof str === "undefined") {
          return;
        }
        if (typeof str === "object") {
          try {
            str = JSON.stringify(str);
          } catch (e) {
            /*do nothing */
          }
        }
        str = String(str);
        return str
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, ">")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/#x27;/g, "'")
          .replace(/&#x2F;/g, "\\");
      },
      replaceUndefinedOrNull: function (str, replaceStr) {
        if (str === null) {
          return replaceStr;
        }
        if (typeof str === "undefined") {
          return replaceStr;
        }
        // if (typeof str === "object") {
        //     try {
        //       str = JSON.stringify(str);
        //     } catch (e) {
        //       apex.debug.message(1, 'Error while replacing undefined value');
        //     }
        // }
      },
      formatMoney: function (n, c, d, t) {
        var c = isNaN((c = Math.abs(c))) ? 2 : c,
          d = d == undefined ? "." : d,
          t = t == undefined ? "," : t,
          s = n < 0 ? "-" : "",
          i = String(parseInt((n = Math.abs(Number(n) || 0).toFixed(c)))),
          j = (j = i.length) > 3 ? j % 3 : 0;

        return (
          s +
          (j ? i.substr(0, j) + t : "") +
          i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
          (c
            ? d +
            Math.abs(n - i)
              .toFixed(c)
              .slice(2)
            : "")
        );
      },
      link: function (pLink, pTarget = "_parent") {
        if (typeof pLink !== "undefined" && pLink !== null && pLink !== "") {
          window.open(pLink, pTarget);
        }
      },
      loader: {
        start: function (id, setMinHeight) {
          if (setMinHeight) {
            $(id).css("min-height", "100px");
          }
          apex.util.showSpinner($(id));
        },
        stop: function (id, removeMinHeight) {
          if (removeMinHeight) {
            $(id).css("min-height", "");
          }
          $(id + " > .u-Processing").remove();
          $(id + " > .ct-loader").remove();
        },
      },
      jsonSaveExtend: function (srcConfig, targetConfig) {
        let finalConfig = {};
        let tmpJSON = {};
        /* try to parse config json when string or just set */
        if (typeof targetConfig === "string") {
          try {
            tmpJSON = JSON.parse(targetConfig);
          } catch (e) {
            apex.debug.error({
              module: "apexUtil.js",
              msg: "Error while try to parse targetConfig. Please check your Config JSON. Standard Config will be used.",
              err: e,
              targetConfig: targetConfig,
            });
          }
        } else {
          tmpJSON = $.extend(true, {}, targetConfig);
        }
        /* try to merge with standard if any attribute is missing */
        try {
          finalConfig = $.extend(true, {}, srcConfig, tmpJSON);
        } catch (e) {
          finalConfig = $.extend(true, {}, srcConfig);
          apex.debug.error({
            module: "apexUtil.js",
            msg: "Error while try to merge 2 JSONs into standard JSON if any attribute is missing. Please check your Config JSON. Standard Config will be used.",
            err: e,
            finalConfig: finalConfig,
          });
        }
        return finalConfig;
      },
      tooltip: {
        show: function (htmlContent, backgroundColor, maxWidth) {
          try {
            if ($("#dynToolTip").length === 0) {
              const tooltip = $("<div></div>")
                .attr("id", "dynToolTip")
                .css("color", "#111")
                .css("max-width", "400px")
                .css("position", "absolute")
                .css("top", "0px")
                .css("left", "0px")
                .css("z-index", "2000")
                .css("background-color", "rgba(240, 240, 240, 1)")
                .css("padding", "10px")
                .css("display", "block")
                .css("top", "0")
                .css("overflow-wrap", "break-word")
                .css("word-wrap", "break-word")
                .css("-ms-hyphens", "auto")
                .css("-moz-hyphens", "auto")
                .css("-webkit-hyphens", "auto")
                .css("hyphens", "auto");
              if (backgroundColor) {
                tooltip.css("background-color", backgroundColor);
              }
              if (maxWidth) {
                tooltip.css("max-width", maxWidth);
              }
              $("body").append(tooltip);
            } else {
              $("#dynToolTip").css("visibility", "visible");
            }

            $("#dynToolTip").html(htmlContent);
            $("#dynToolTip")
              .find("*")
              .css("max-width", "100%")
              .css("overflow-wrap", "break-word")
              .css("word-wrap", "break-word")
              .css("-ms-hyphens", "auto")
              .css("-moz-hyphens", "auto")
              .css("-webkit-hyphens", "auto")
              .css("hyphens", "auto")
              .css("white-space", "normal");
            $("#dynToolTip")
              .find("img")
              .css("object-fit", "contain")
              .css("object-position", "50% 0%");
          } catch (e) {
            apex.debug.error({
              module: "apexUtil.js",
              msg: "Error while try to show tooltip",
              err: e,
            });
          }
        },
        setPosition: function (event) {
          $("#dynToolTip").position({
            my: "left+6 top+6",
            of: event,
            collision: "flipfit",
          });
        },
        hide: function () {
          $("#dynToolTip").css("visibility", "hidden");
        },
        remove: function () {
          $("#dynToolTip").remove();
        },
      },
      server: {
        plugin: function (ajaxID, pItems, pOptions) {
          publicFunctions.debug.debug({
            ajaxID: ajaxID,
            pItems: pItems,
            pOptions: pOptions,
          });
          ajaxSimulation(ajaxID, pItems, pOptions);
        },
        pluginUrl: function (ajaxID, pItems) {
          /* here must the url be returned that make it possible for the plug-in to load images by id that are given by pItems
           ** this feature is used only when use unleash rte plug-in and images should be load by this build feature in other
           ** frameworks then APEX this make IMHO no sense so this will never be called */
          publicFunctions.debug.debug({
            ajaxID: ajaxID,
            pItems: pItems,
          });
        },
        chunk: function (pString) {
          /* apex.server.chunk only avail on APEX 18.2+ */
          var splitSize = 8000;
          var tmpSplit;
          var retArr = [];
          if (pString.length > splitSize) {
            for (retArr = [], tmpSplit = 0; tmpSplit < pString.length;)
              retArr.push(pString.substr(tmpSplit, splitSize)),
                (tmpSplit += splitSize);
            return retArr;
          }
          retArr.push(pString);
          return retArr;
        },
      },
      printDOMMessage: {
        show: function (id, text, icon, color) {
          const div = $("<div>");
          if ($(id).height() >= 150) {
            const subDiv = $("<div></div>");

            const iconSpan = $("<span></span>")
              .addClass("fa")
              .addClass(icon || "fa-info-circle-o")
              .addClass("fa-2x")
              .css("height", "32px")
              .css("width", "32px")
              .css("margin-bottom", "16px")
              .css("color", color || "#D0D0D0");

            subDiv.append(iconSpan);

            const textSpan = $("<span></span>")
              .text(text)
              .css("display", "block")
              .css("color", "#707070")
              .css("text-overflow", "ellipsis")
              .css("overflow", "hidden")
              .css("white-space", "nowrap")
              .css("font-size", "12px");

            div
              .css("margin", "12px")
              .css("text-align", "center")
              .css("padding", "10px 0")
              .addClass("dominfomessagediv")
              .append(subDiv)
              .append(textSpan);
          } else {
            const iconSpan = $("<span></span>")
              .addClass("fa")
              .addClass(icon || "fa-info-circle-o")
              .css("font-size", "22px")
              .css("line-height", "26px")
              .css("margin-right", "5px")
              .css("color", color || "#D0D0D0");

            const textSpan = $("<span></span>")
              .text(text)
              .css("color", "#707070")
              .css("text-overflow", "ellipsis")
              .css("overflow", "hidden")
              .css("white-space", "nowrap")
              .css("font-size", "12px")
              .css("line-height", "20px");

            div
              .css("margin", "10px")
              .css("text-align", "center")
              .addClass("dominfomessagediv")
              .append(iconSpan)
              .append(textSpan);
          }
          $(id).append(div);
        },
        hide: function (id) {
          $(id).children(".dominfomessagediv").remove();
        },
      },
      noDataMessage: {
        show: function (id, text) {
          apexUtil.publicFunctions.utils.printDOMMessage.show(id, text, "fa-search");
        },
        hide: function (id) {
          apexUtil.publicFunctions.utils.printDOMMessage.hide(id);
        },
      },
      errorMessage: {
        show: function (id, text) {
          apexUtil.publicFunctions.utils.printDOMMessage.show(
            id,
            text,
            "fa-exclamation-triangle",
            "#FFCB3D"
          );
        },
        hide: function (id) {
          apexUtil.publicFunctions.utils.printDOMMessage.hide(id);
        },
      },
      copyJSONObject: function (object) {
        try {
          let objectCopy = {};
          let key;

          for (key in object) {
            if (object[key]) {
              objectCopy[key] = object[key];
            }
          }
          return objectCopy;
        } catch (e) {
          apex.debug.error({
            module: "apexUtil.js",
            msg: "Error while try to copy object",
            err: e,
          });
        }
      },
      splitString2Array: function (pString) {
        if (
          typeof pString !== "undefined" &&
          pString !== null &&
          pString !== "" &&
          pString.length > 0
        ) {
          if (apex && apex.server && apex.server.chunk) {
            return apex.server.chunk(pString);
          } else {
            /* apex.server.chunk only avail on APEX 18.2+ */
            const splitSize = 8000;
            let tmpSplit;
            let retArr = [];
            if (pString.length > splitSize) {
              for (retArr = [], tmpSplit = 0; tmpSplit < pString.length;) {
                retArr.push(pString.substr(tmpSplit, splitSize));
                tmpSplit += splitSize;
              }
              return retArr;
            }
            retArr.push(pString);
            return retArr;
          }
        } else {
          return [];
        }
      },
      removeHTML: function (pHTML) {
        if (apex && apex.util && apex.util.stripHTML) {
          return apex.util.stripHTML(pHTML);
        } else {
          return $("<div/>").html(pHTML).text();
        }
      },
      isStringaJSON: function (pString) {
        try {
          JSON.parse(pString);
        } catch (e) {
          return false;
        }
        return true;
      },
      isTouchDevice: function () {
        return "ontouchstart" in window;
      },
      isBetween: function (pValue, pValue2, pRange) {
        const range = pRange || 0,
          min = pValue2 - range,
          max = pValue2 + range;
        return pValue >= min && pValue <= max;
      },
      numPad: function (number) {
        let r = String(number);
        if (r.length === 1) {
          r = "0" + r;
        }
        return r;
      },
      disableRdsTab: function (id) {
        try {
          if (id) {
            $(id).attr("readonly", "readonly");
            $(id).addClass("apex_disabled");
          }
        } catch (e) {
          apex.debug.message(1, "Error while trying to disable Region display selector tab ");
        }
      },
      enableRdsTab: function (id) {
        try {
          if (id) {
            $(id).removeAttr("readonly");
            $(id).removeClass("apex_disabled");
          }
        } catch (e) {
          apex.debug.message(1, "Error while trying to disable Region display selector tab ");
        }
      },
      getNowUTC: function () {
        let now = new Date();
        return (
          now.getUTCFullYear() +
          "-" +
          wm.util.pad(now.getUTCMonth() + 1) +
          "-" +
          wm.util.pad(now.getUTCDate()) +
          "T" +
          wm.util.pad(now.getUTCHours()) +
          ":" +
          wm.util.pad(now.getUTCMinutes()) +
          ":" +
          wm.util.pad(now.getUTCSeconds()) +
          "." +
          String((now.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5) +
          "Z"
        );
      },
      getRandomNumberInRange: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
      },
      copy2Clipboard: function (pElement) {
        const $temp = $("<textarea>");
        $("body").append($temp);
        const str = $(pElement).text() || $(pElement).val();
        $temp.val(str).select();
        document.execCommand("copy");
        $temp.remove();
      },
      removeElementFromArray: function (pArr, pSrcStr) {
        if (pSrcStr) {
          let i = 0;
          while (i < pArr.length) {
            if (pArr[i] === pSrcStr) {
              pArr.splice(i, 1);
            } else {
              i = i + 1;
            }
          }
          return pArr;
        } else {
          apex.debug.error({
            module: "apexUtil.js",
            msg: "Error while try to remove element from array. No element to remove is given.",
          });
        }
      },
      getStrByteLength: function (pStr) {
        if (pStr) {
          const tmp = encodeURIComponent(pStr).match(/%[89ABab]/g);
          return pStr.length + (tmp ? tmp.length : 0);
        }
        return 0;
      },
      localStorage: {
        check: function () {
          if (typeof Storage !== "undefined") {
            return true;
          } else {
            apex.debug.info({
              module: "apexUtil.js",
              msg: "Your browser does not support local storage",
            });
            return false;
          }
        },
        set: function (pKey, pStr, pType) {
          try {
            if (util.localStorage.check) {
              if (pType === "permanent") {
                localStorage.setItem(pKey, pStr);
              } else {
                sessionStorage.setItem(pKey, pStr);
              }
            }
          } catch (e) {
            apex.debug.error({
              module: "apexUtil.js",
              msg: "Error while try to save item to local Storage. Confirm that you not exceed the storage limit of 5MB.",
              err: e,
            });
          }
        },
        get: function (pKey, pType) {
          try {
            if (util.localStorage.check) {
              if (pType === "permanent") {
                return localStorage.getItem(pKey);
              } else {
                return sessionStorage.getItem(pKey);
              }
            }
          } catch (e) {
            apex.debug.error({
              module: "apexUtil.js",
              msg: "Error while try to read item from local Storage",
              err: e,
            });
          }
        },
        remove: function (pKey, pType) {
          try {
            if (util.localStorage.check) {
              if (pType === "permanent") {
                localStorage.removeItem(pKey);
              } else {
                sessionStorage.removeItem(pKey);
              }
            }
          } catch (e) {
            apex.debug.error({
              module: "apexUtil.js",
              msg: "Error while try remove item from local Storage",
              err: e,
            });
          }
        },
      },
      locale: {
        getLanguage: function () {
          return navigator.language || navigator.userLanguage || en;
        },
      },
    },
  };
  ////////////////////////////////////////////////////////////////////////////
  //
  //  Setup
  //
  ////////////////////////////////////////////////////////////////////////////
  initApexVersion();
})(apex.custom.util, apex.jQuery, window.console, window.gApexVersion);
