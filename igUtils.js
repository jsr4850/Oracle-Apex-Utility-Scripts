///////////////////////////////////////////////////////////////////////////
//   NAME:       igUtils.js
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

if (apex && apex.custom && apex.custom.igUtil) {
    throw 'Collision detected for apex.custom.igUtil';
}

var apex = apex || {};
apex.custom = apex.custom || {};
apex.custom.igUtil = {};

(function(igUtil, $, customUtils, console, undefined) {

    "use strict";

    ////////////////////////////////////////////////////////////////////////////

    igUtil.getSelectedRecordIdsArray = function getSelectedRecordIdsArray(pIgId) {
        var ig_ = apex.region(pIgId);
        var igWidget = ig_.widget();
        var igGrid = igWidget.interactiveGrid('getViews', 'grid');
        var igModel = igGrid.model;
        var selectedRecords = igGrid.getSelectedRecords();
        var selectedRecordIds = [];

        selectedRecords.forEach(function(rec, idx) {
            selectedRecordIds.push(igModel.getRecordId(rec));
        });

        return selectedRecordIds;
    }; //getSelectedRecordIdsArray
    ////////////////////////////////////////////////////////////////////////////

    igUtil.getSelectedRecordIdsString = function getSelectedRecordIdsString(pIgId, pRecordSeparator, pComponentSeprarator) {
        var componentSeprarator = pComponentSeprarator || ';';
        var recordSeparator = pRecordSeparator || ':';
        var selectedRecordIdsArray = igUtil.getSelectedRecordIdsArray(pIgId);
        var firstElement = selectedRecordIdsArray[0];
        var selectedRecordIdsString;

        if (Array.isArray(firstElement)) {
            selectedRecordIdsArray.forEach(function(recId, idx) {
                selectedRecordIdsArray[idx] = selectedRecordIdsArray[idx].join(componentSeprarator);
            });
        }

        selectedRecordIdsString = selectedRecordIdsArray.join(recordSeparator);

        return selectedRecordIdsString;
    }; //getSelectedRecordIdsString
    ////////////////////////////////////////////////////////////////////////////

    igUtil.getCurrentPageRecordIdsArray = function getCurrentPageRecordIdsArray(pIgId) {
        var ig_ = apex.region(pIgId);
        var igWidget = ig_.widget();
        var igCurrentPageTrs$ = igWidget.find('.a-GV-w-scroll tr.a-GV-row[data-id]');
        var currentPageRecordIds = [];


        igCurrentPageTrs$.each(function(idx, tr) {
            currentPageRecordIds.push($(tr).data('id'));
        });

        return currentPageRecordIds;
    }; //getCurrentPageRecordIdsArray
    ////////////////////////////////////////////////////////////////////////////

    igUtil.getCurrentPageRecordIdsString = function getCurrentPageRecordIdsString(pIgId, pRecordSeparator, pComponentSeprarator) {
        var componentSeprarator = pComponentSeprarator || ';';
        var recordSeparator = pRecordSeparator || ':';
        var currentPageRecordIdsArray = igUtil.getCurrentPageRecordIdsArray(pIgId);
        var firstElement = currentPageRecordIdsArray[0];
        var currentPageRecordIdsString;

        if (Array.isArray(firstElement)) {
            currentPageRecordIdsArray.forEach(function(recId, idx) {
                currentPageRecordIdsArray[idx] = currentPageRecordIdsArray[idx].join(componentSeprarator);
            });
        }

        currentPageRecordIdsString = currentPageRecordIdsArray.join(recordSeparator);

        return currentPageRecordIdsString;
    }; //getCurrentPageRecordIdsString
    ////////////////////////////////////////////////////////////////////////////

    igUtil.getAllRecordIdsArray = function getAllRecordIdsArray(pIgId) {
        var ig_ = apex.region(pIgId);
        var igWidget = ig_.widget();
        var igGrid = igWidget.interactiveGrid('getViews', 'grid');
        var igModel = igGrid.model;
        var allRecordIds = [];

        var deferred$ = $.Deferred(function(defer) {

            igModel.fetchAll(function(pStatus) {
                if (pStatus.done) {
                    igModel.forEach(function(pRec, pIdx, pId) {
                        allRecordIds.push(pId);
                    });

                    defer.resolve(allRecordIds);
                }
            });

        });

        return deferred$.promise();

    }; //getAllRecordIdsArray
    ////////////////////////////////////////////////////////////////////////////

    igUtil.getAllRecordIdsString = function getAllRecordIdsString(pIgId, pRecordSeparator, pComponentSeprarator) {
        var componentSeprarator = pComponentSeprarator || ';';
        var recordSeparator = pRecordSeparator || ':';
        var deferred$ = $.Deferred(function(defer) {

            var recordsPromise = igUtil.getAllRecordIdsArray(pIgId);

            recordsPromise.then(function (allRecordIdsArray) {
                var firstElement = allRecordIdsArray[0];
                var allRecordIdsString;

                if (Array.isArray(firstElement)) {
                    allRecordIdsArray.forEach(function(recId, idx) {
                        allRecordIdsArray[idx] = allRecordIdsArray[idx].join(componentSeprarator);
                    });
                }

                allRecordIdsString = allRecordIdsArray.join(recordSeparator);

                defer.resolve(allRecordIdsString);
            });

        });

        return deferred$.promise();
    }; //getAllRecordIdsString
    ////////////////////////////////////////////////////////////////////////////

    igUtil.checkRowsAreSelected = function checkRowsAreSelected(pIgId) {
        var ig_ = apex.region(pIgId);
        var igWidget = ig_.widget();
        var igGrid = igWidget.interactiveGrid('getViews', 'grid');

        return igGrid.getSelectedRecords().length > 0;
    };

    ////////////////////////////////////////////////////////////////////////////
    igUtil.refreshChangedRecords =  function refreshChangedRecords(pIgId) {
    let changedRecords = []
    let igModel = apex.region(pIgId).call('getViews', 'grid').model;
    let igChanged = igModel.getChanges();

    for (i = 0; i < igChanged.length ; i++) { 
        changedRecords.push (igChanged[i].record);
    }

    igModel.fetchRecords(changedRecords);
    };

    ////////////////////////////////////////////////////////////////////////////
    igUtil.refreshSelectedRecords =  function refreshSelectedRecords(pIgId) {
  
    let igRegion        = apex.region(pIgId);
    let igModel         = igRegion.call('getViews', 'grid').model;
    let selectedRecords = igRegion.call('getSelectedRecords'); // Fetch selected records

    igModel.fetchRecords(selectedRecords); // Refresh Both selected records
    };



    ////////////////////////////////////////////////////////////////////////////
    //Only deals with setting column filters using equal operator, case insensitive
    //An empty string value removes the filter.
    //columns and values are arrays and must have same length
    //eg., - apex.custom.igUtil.setIGFilters("issues", ["APPLICATION_ID", "PAGE_ID", "STATUS"],[ p1_app, p1_page, "Open" ]);
    ////////////////////////////////////////////////////////////////////////////
    igUtil.setIGFilters =  function setIGFilters( regionId, columns, values ) {
        var i, filter, col, val, id, curVal,
        colMap = {},
        idMap = {},
        changed = false,
        region = apex.region(regionId),
        inst = region.call("instance"),
        filters = region.call("getFilters"),
        options = { save: false };

    for (i = 0; i < columns.length; i++) {
        col = columns[i];
        if (inst._getColumnByName(col)) {
            id = inst._getColumnByName(col).id;
            idMap[id] = col;
        }
    }

    for (i = 0; i < filters.length; i++) {
        filter = filters[i];
        if (filter.type === "column" && filter.operator === "EQ" && idMap[filter.columnId]) {
            colMap[idMap[filter.columnId]] = {
                id: filter.id,
                val: filter.value
            };
        }
    }

    for (i = 0; i < columns.length; i++) {
        col = columns[i];
        val = values[i];
        id = curVal = null;
        if (colMap[col]) {
            id = colMap[col].id;
            curVal = colMap[col].val;
        }
        if (val !== "") { 
            filter = {
                   type: "column",
                   columnType: "column",
                   operator: "EQ",
                   value: val,
                   isCaseSensitive: false
            };
            if (id) {
                if (val !== curVal) {
                    region.call("updateFilter", id, filter, options);
                    changed = true;
                }
            } else {
                filter.columnName = col;
                region.call("addFilter", filter, options);
                changed = true;
            }
        } else if ( id ) {
            region.call("deleteFilter", id, options);
            changed = true;
        }
    }
    if (changed) {
        inst._setReportSettings({});
    }
};
////////////////////////////////////////////////////////////////////////////
/// Change Column Names
////////////////////////////////////////////////////////////////////////////

    igUtil.changeColumnName = function changeColumnName(pIgId, columnName, newHeading) {
        var ig_ = apex.region(pIgId);
        var igView = ig_.call("getCurrentView").view$;

        igView.grid("getColumns").filter((column) => column.property == columnName)[0].heading = newHeading;
        igView.grid("refreshColumns").grid("refresh");
    }; 
    //changeColumnName
    
///////////////////////////////////////////////////////////////////////////

})(apex.custom.igUtil, apex.jQuery, window.customUtils, window.console);
