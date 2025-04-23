///////////////////////////////////////////////////////////////////////////
//   NAME:       apexUtils.js
//   PURPOSE:    Javascript apex utility functions
//   VERSION:    2.0.0
//
//   Copyright (c) 2024 [Satwik]
//
//   Permission is hereby granted, free of charge, to any person obtaining a copy
//   of this software and associated documentation files (the "Software"), to deal
//   in the Software without restriction, including without limitation the rights
//   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//   copies of the Software, and to permit persons to whom the Software is
//   furnished to do so, subject to the following conditions:
//
//   The above copyright notice and this permission notice shall be included in all
//   copies or substantial portions of the Software.
//
//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//   SOFTWARE.
////////////////////////////////////////////////////////////////////////////

if (apex?.custom?.util) {
  throw new Error("Collision detected for apex.custom.util");
}

// Initialize apex namespace using optional chaining
const apex = globalThis.apex ?? {};
apex.custom = apex.custom ?? {};
apex.custom.util = {};

((apexUtil, $, console, gApexVersion) => {
  "use strict";

  // Initialize version object
  apexUtil.apexVersion = {};

  const initApexVersion = () => {
    if (!gApexVersion) {
      console.error(
        "Not able to detect APEX version. Please ensure #IMAGE_PREFIX#apex_version.js is loaded."
      );
      return;
    }

    const versionArray = gApexVersion.split(".");
    apexUtil.apexVersion = {
      string: gApexVersion,
      array: versionArray,
      major: parseInt(versionArray[0]),
      minor: parseInt(versionArray[1]),
      patchSet: parseInt(versionArray[2]),
      other1: parseInt(versionArray[3]),
      other2: parseInt(versionArray[4])
    };
  };

  // Debug utilities with configurable log levels
  const debug = {
    logLevel: 0,
    info: (...args) => {
      if (debug.logLevel > 3) {
        console.info(...args);
      }
    },
    debug: (...args) => {
      if (debug.logLevel > 4) {
        console.debug(...args);
      }
    },
    error: console.error.bind(console),
    warn: console.warn.bind(console)
  };

  // Utility functions
  const utils = {
    showSpinner: (obj) => {
      const $obj = $(obj);
      const loaderId = `loader${$obj.attr("id")}`;
      
      const $loader = $("<div>", {
        id: loaderId,
        class: "ct-loader",
        css: {
          display: "block",
          margin: "0 auto",
          textAlign: "center",
          padding: "10px",
          position: "absolute",
          top: "calc(50% - 42px)",
          left: "calc(50% - 42px)"
        }
      });

      const $loaderSpan = $("<span>", {
        css: {
          background: "rgba(121,121,121,0.6)",
          borderRadius: "100%",
          width: "42px",
          height: "42px",
          display: "inline-block"
        }
      });

      const $refresh = $("<i>", {
        class: "fa fa-refresh fa-lg fa-anim-spin",
        css: {
          padding: "5px",
          color: "white"
        }
      });

      $loader.append($loaderSpan.append($refresh));
      $obj.append($loader);
    },

    removeSpinner: (obj) => {
      $(`#loader${$(obj).attr("id")}`).remove();
    },

    escapeHTML: (str) => {
      if (str === null || str === undefined) return str;
      
      const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
      };
      
      return String(str).replace(/[&<>"'/]/g, char => escapeMap[char]);
    },

    isDefinedAndNotNull: (input) => {
      return input !== undefined && input !== null && input !== "";
    },

    alertMessages: (status, message) => {
      try {
        if (!status) return;
        
        apex.message.clearErrors();
        
        if (status === 'E') {
          apex.message.showErrors([{
            type: "error",
            location: "page",
            message,
            unsafe: false
          }]);
        } else if (status === 'S') {
          apex.message.showPageSuccess(message);
        }
      } catch (err) {
        apex.debug.error({
          module: "apexUtil.js",
          msg: "Error in alertMessages function",
          err
        });
      }
    },

    varType: (obj) => {
      if (typeof obj !== "object") return typeof obj;
      if (Array.isArray(obj)) return "array";
      return "json";
    },

    debounce: (fn, timeout = 50) => {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), timeout);
      };
    },

    parseISOTimeString: (str) => {
      try {
        const [year, month, day, hour, minute, second, ms] = str.split(/\D+/);
        return new Date(Date.UTC(year, month - 1, day, hour, minute, second, ms));
      } catch (err) {
        apex.debug.error({
          module: "apexUtil.js",
          msg: "Error parsing ISO Time String",
          err
        });
        return null;
      }
    },

    groupObjectArray: (objectArr, jsonKey) => {
      if (!Array.isArray(objectArr)) return [];
      
      return objectArr.reduce((acc, item) => {
        const key = item[jsonKey];
        if (key) {
          const sortKey = `\u200b${key}`;
          (acc[sortKey] = acc[sortKey] ?? []).push(item);
        }
        return acc;
      }, {});
    },

    getDecimalSeparator: () => {
      try {
        return apex.locale.getDecimalSeparator();
      } catch (err) {
        apex.debug.error({
          module: "apexUtil.js",
          msg: "Error getting decimal separator",
          err
        });
      }
    },

    getGroupSeparator: () => {
      try {
        return apex.locale.getGroupSeparator();
      } catch (err) {
        apex.debug.error({
          module: "apexUtil.js",
          msg: "Error getting group separator",
          err
        });
      }
    },

    convertJSON2LowerCase: (obj) => {
      try {
        if (!obj || typeof obj !== 'object') return obj;
        
        return Object.entries(obj).reduce((acc, [key, value]) => {
          const lowKey = key.toLowerCase();
          
          if (Array.isArray(value)) {
            acc[lowKey] = value.map(item => utils.convertJSON2LowerCase(item));
          } else if (typeof value === 'object') {
            acc[lowKey] = utils.convertJSON2LowerCase(value);
          } else {
            acc[lowKey] = value;
          }
          
          return acc;
        }, {});
      } catch (err) {
        apex.debug.error({
          module: "apexUtil.js",
          msg: "Error converting JSON to lowercase",
          err
        });
        return obj;
      }
    },

    cutString: (text, textLength) => {
      if (!text || textLength < 0) return text;
      return text.length > textLength ? `${text.slice(0, textLength - 3)}...` : text;
    },

    unEscapeHTML: (str) => {
      if (str === null || str === undefined) return str;
      
      const unescapeMap = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#x27;': "'",
        '&#x2F;': '/'
      };
      
      return String(str).replace(/&(?:amp|lt|gt|quot|#x27|#x2F);/g, entity => unescapeMap[entity]);
    },

    replaceUndefinedOrNull: (str, replaceStr) => {
      return str === undefined || str === null ? replaceStr : str;
    },

    formatMoney: (n, c = 2, d = ".", t = ",") => {
      const sign = n < 0 ? "-" : "";
      const num = Math.abs(Number(n) || 0).toFixed(c);
      const [intPart, decPart] = num.split(".");
      
      const formattedInt = intPart
        .split("")
        .reverse()
        .reduce((acc, digit, i) => {
          const shouldAddSeparator = i > 0 && i % 3 === 0;
          return shouldAddSeparator ? `${digit}${t}${acc}` : `${digit}${acc}`;
        }, "");

      return `${sign}${formattedInt}${c ? `${d}${decPart}` : ""}`;
    },

    link: (link, target = "_parent") => {
      if (utils.isDefinedAndNotNull(link)) {
        window.open(link, target);
      }
    },

    loader: {
      start: (id, setMinHeight) => {
        const $elem = $(id);
        if (setMinHeight) {
          $elem.css("min-height", "100px");
        }
        apex.util.showSpinner($elem);
      },
      stop: (id, removeMinHeight) => {
        const $elem = $(id);
        if (removeMinHeight) {
          $elem.css("min-height", "");
        }
        $(`${id} > .u-Processing, ${id} > .ct-loader`).remove();
      }
    },

    jsonSafeExtend: (srcConfig, targetConfig) => {
      try {
        const parsedTarget = typeof targetConfig === "string" 
          ? JSON.parse(targetConfig)
          : targetConfig;
          
        return $.extend(true, {}, srcConfig, parsedTarget);
      } catch (err) {
        apex.debug.error({
          module: "apexUtil.js",
          msg: "Error in JSON safe extend, using source config",
          err
        });
        return $.extend(true, {}, srcConfig);
      }
    },

    tooltip: {
      show: (htmlContent, backgroundColor = "rgba(240, 240, 240, 1)", maxWidth = "400px") => {
        try {
          const tooltipStyles = {
            color: "#111",
            maxWidth,
            position: "absolute",
            top: "0",
            left: "0",
            zIndex: "2000",
            backgroundColor,
            padding: "10px",
            display: "block",
            overflowWrap: "break-word",
            wordWrap: "break-word",
            hyphens: "auto"
          };

          if (!$("#dynToolTip").length) {
            $("<div>", {
              id: "dynToolTip",
              css: tooltipStyles
            }).appendTo("body");
          } else {
            $("#dynToolTip").css("visibility", "visible");
          }

          const $tooltip = $("#dynToolTip")
            .html(htmlContent)
            .find("*")
            .css({
              maxWidth: "100%",
              overflowWrap: "break-word",
              wordWrap: "break-word",
              hyphens: "auto",
              whiteSpace: "normal"
            })
            .end()
            .find("img")
            .css({
              objectFit: "contain",
              objectPosition: "50% 0%"
            });

        } catch (err) {
          apex.debug.error({
            module: "apexUtil.js",
            msg: "Error showing tooltip",
            err
          });
        }
      },
      
      setPosition: (event) => {
        $("#dynToolTip").position({
          my: "left+6 top+6",
          of: event,
          collision: "flipfit"
        });
      },
      
      hide: () => $("#dynToolTip").css("visibility", "hidden"),
      remove: () => $("#dynToolTip").remove()
    },

    server: {
      plugin: (ajaxID, items, options) => {
        debug.debug({ ajaxID, items, options });
        ajaxSimulation(ajaxID, items, options);
      },

      pluginUrl: (ajaxID, items) => {
        debug.debug({ ajaxID, items });
      },

      chunk: (str, size = 8000) => {
        if (!str) return [];
        return str.match(new RegExp(`.{1,${size}}`, 'g')) || [str];
      }
    },

    printDOMMessage: {
      show: (id, text, icon = "fa-info-circle-o", color = "#D0D0D0") => {
        const $container = $(id);
        const isLarge = $container.height() >= 150;

        const $message = $("<div>", {
          css: {
            margin: isLarge ? "12px" : "10px",
            textAlign: "center",
            padding: isLarge ? "10px 0" : undefined
          },
          class: "dominfomessagediv"
        });

        if (isLarge) {
          const $iconWrapper = $("<div>");
          
          $("<span>", {
            class: `fa ${icon} fa-2x`,
            css: {
              height: "32px",
              width: "32px",
              marginBottom: "16px",
              color
            }
          }).appendTo($iconWrapper);

          $message.append($iconWrapper);
        } else {
          $("<span>", {
            class: `fa ${icon}`,
            css: {
              fontSize: "22px",
              lineHeight: "26px",
              marginRight: "5px",
              color
            }
          }).appendTo($message);
        }

        $("<span>", {
          text,
          css: {
            color: "#707070",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            fontSize: "12px",
            lineHeight: isLarge ? undefined : "20px",
            display: isLarge ? "block" : undefined
          }
        }).appendTo($message);

        $container.append($message);
      },

      hide: (id) => $(`${id} .dominfomessagediv`).remove()
    },

    noDataMessage: {
      show: (id, text) => utils.printDOMMessage.show(id, text, "fa-search"),
      hide: (id) => utils.printDOMMessage.hide(id)
    },

    errorMessage: {
      show: (id, text) => utils.printDOMMessage.show(id, text, "fa-exclamation-triangle", "#FFCB3D"),
      hide: (id) => utils.printDOMMessage.hide(id)
    },

    copyJSONObject: (obj) => {
      try {
        return Object.fromEntries(
          Object.entries(obj).filter(([_, value]) => value !== undefined)
        );
      } catch (err) {
        apex.debug.error({
          module: "apexUtil.js",
          msg: "Error copying JSON object",
          err
        });
        return {};
      }
    },

    splitString2Array: (str) => {
      if (!utils.isDefinedAndNotNull(str)) return [];
      return apex?.server?.chunk?.(str) ?? utils.server.chunk(str);
    },

    removeHTML: (html) => {
      return apex?.util?.stripHTML?.(html) ?? $("<div>").html(html).text();
    },

    isStringJSON: (str) => {
      try {
        JSON.parse(str);
        return true;
      } catch {
        return false;
      }
    },

    isTouchDevice: () => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    isBetween: (value, target, range = 0) => {
      const [min, max] = [target - range, target + range];
      return value >= min && value <= max;
    },

    numPad: (num) => String(num).padStart(2, '0'),

    disableRdsTab: (id) => {
      try {
        if (id) {
          $(id)
            .attr("readonly", "readonly")
            .addClass("apex_disabled");
        }
      } catch (err) {
        apex.debug.message(1, "Error disabling Region display selector tab");
      }
    },

    enableRdsTab: (id) => {
      try {
        if (id) {
          $(id)
            .removeAttr("readonly")
            .removeClass("apex_disabled");
        }
      } catch (err) {
        apex.debug.message(1, "Error enabling Region display selector tab");
      }
    },

    getNowUTC: () => {
      const now = new Date();
      return now.toISOString();
    },

    getRandomNumberInRange: (min, max) => 
      Math.floor(Math.random() * (max - min + 1) + min),

    copy2Clipboard: async (element) => {
      const text = $(element).text() || $(element).val();
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Fallback for older browsers
        const $temp = $("<textarea>")
          .val(text)
          .appendTo("body")
          .select();
        document.execCommand("copy");
        $temp.remove();
      }
    },

    removeElementFromArray: (arr, str) => {
      if (!str) {
        apex.debug.error({
          module: "apexUtil.js",
          msg: "No element to remove from array"
        });
        return arr;
      }
      return arr.filter(item => item !== str);
    },

    getStrByteLength: (str) => {
      if (!str) return 0;
      return new Blob([str]).size;
    },

    localStorage: {
      check: () => {
        const hasStorage = typeof Storage !== "undefined";
        if (!hasStorage) {
          apex.debug.info({
            module: "apexUtil.js",
            msg: "Browser does not support local storage"
          });
        }
        return hasStorage;
      },

      set: (key, str, type = "session") => {
        try {
          if (!utils.localStorage.check()) return;
          const storage = type === "permanent" ? localStorage : sessionStorage;
          storage.setItem(key, str);
        } catch (err) {
          apex.debug.error({
            module: "apexUtil.js",
            msg: "Error saving to storage (5MB limit may be exceeded)",
            err
          });
        }
      },

      get: (key, type = "session") => {
        try {
          if (!utils.localStorage.check()) return;
          const storage = type === "permanent" ? localStorage : sessionStorage;
          return storage.getItem(key);
        } catch (err) {
          apex.debug.error({
            module: "apexUtil.js",
            msg: "Error reading from storage",
            err
          });
        }
      },

      remove: (key, type = "session") => {
        try {
          if (!utils.localStorage.check()) return;
          const storage = type === "permanent" ? localStorage : sessionStorage;
          storage.removeItem(key);
        } catch (err) {
          apex.debug.error({
            module: "apexUtil.js",
            msg: "Error removing from storage",
            err
          });
        }
      }
    },

    locale: {
      getLanguage: () => navigator.language || navigator.userLanguage || "en"
    }
  };

  // Initialize and expose public interface
  initApexVersion();
  apexUtil.publicFunctions = { debug, utils };
  
})(apex.custom.util, apex.jQuery, window.console, window.gApexVersion);
