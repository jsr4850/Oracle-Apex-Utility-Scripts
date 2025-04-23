/**
 * @fileoverview JavaScript utility functions for Oracle APEX Interactive Grids
 * @version 2.0.0
 * @copyright 2025 Satwik
 * @license MIT
 */

// Prevent namespace collision
if (apex?.custom?.igUtil) {
    throw new Error('Collision detected for apex.custom.igUtil');
}

const apex = apex || {};
apex.custom = apex.custom || {};
apex.custom.igUtil = {};

((igUtil, $) => {
    'use strict';

    /**
     * Gets selected record IDs from an Interactive Grid
     * @param {string} igId - The Interactive Grid region ID
     * @returns {string[]} Array of selected record IDs
     */
    igUtil.getSelectedRecordIdsArray = igId => {
        const ig = apex.region(igId);
        const igWidget = ig.widget();
        const igGrid = igWidget.interactiveGrid('getViews', 'grid');
        const igModel = igGrid.model;
        
        return igGrid.getSelectedRecords()
            .map(record => igModel.getRecordId(record));
    };

    /**
     * Gets selected record IDs as a formatted string
     * @param {string} igId - The Interactive Grid region ID
     * @param {string} [recordSeparator=':'] - Separator between records
     * @param {string} [componentSeparator=';'] - Separator between components
     * @returns {string} Formatted string of record IDs
     */
    igUtil.getSelectedRecordIdsString = (igId, recordSeparator = ':', componentSeparator = ';') => {
        const selectedIds = igUtil.getSelectedRecordIdsArray(igId);
        const firstElement = selectedIds[0];

        if (Array.isArray(firstElement)) {
            return selectedIds
                .map(recId => recId.join(componentSeparator))
                .join(recordSeparator);
        }

        return selectedIds.join(recordSeparator);
    };

    /**
     * Gets all record IDs from the current page of an Interactive Grid
     * @param {string} igId - The Interactive Grid region ID
     * @returns {string[]} Array of record IDs from current page
     */
    igUtil.getCurrentPageRecordIdsArray = igId => {
        const ig = apex.region(igId);
        const igWidget = ig.widget();
        const currentPageRows = igWidget.find('.a-GV-w-scroll tr.a-GV-row[data-id]');
        
        return Array.from(currentPageRows)
            .map(row => $(row).data('id'));
    };

    /**
     * Gets current page record IDs as a formatted string
     * @param {string} igId - The Interactive Grid region ID
     * @param {string} [recordSeparator=':'] - Separator between records
     * @param {string} [componentSeparator=';'] - Separator between components
     * @returns {string} Formatted string of record IDs
     */
    igUtil.getCurrentPageRecordIdsString = (igId, recordSeparator = ':', componentSeparator = ';') => {
        const currentPageIds = igUtil.getCurrentPageRecordIdsArray(igId);
        const firstElement = currentPageIds[0];

        if (Array.isArray(firstElement)) {
            return currentPageIds
                .map(recId => recId.join(componentSeparator))
                .join(recordSeparator);
        }

        return currentPageIds.join(recordSeparator);
    };

    /**
     * Gets all record IDs from an Interactive Grid
     * @param {string} igId - The Interactive Grid region ID
     * @returns {Promise<string[]>} Promise resolving to array of all record IDs
     */
    igUtil.getAllRecordIdsArray = igId => {
        const ig = apex.region(igId);
        const igWidget = ig.widget();
        const igGrid = igWidget.interactiveGrid('getViews', 'grid');
        const igModel = igGrid.model;

        return new Promise((resolve) => {
            igModel.fetchAll(status => {
                if (status.done) {
                    const allRecordIds = [];
                    igModel.forEach((_, __, id) => allRecordIds.push(id));
                    resolve(allRecordIds);
                }
            });
        });
    };

    /**
     * Gets all record IDs as a formatted string
     * @param {string} igId - The Interactive Grid region ID
     * @param {string} [recordSeparator=':'] - Separator between records
     * @param {string} [componentSeparator=';'] - Separator between components
     * @returns {Promise<string>} Promise resolving to formatted string of record IDs
     */
    igUtil.getAllRecordIdsString = (igId, recordSeparator = ':', componentSeparator = ';') => {
        return igUtil.getAllRecordIdsArray(igId)
            .then(allRecordIds => {
                const firstElement = allRecordIds[0];

                if (Array.isArray(firstElement)) {
                    return allRecordIds
                        .map(recId => recId.join(componentSeparator))
                        .join(recordSeparator);
                }

                return allRecordIds.join(recordSeparator);
            });
    };

    /**
     * Checks if any rows are selected in an Interactive Grid
     * @param {string} igId - The Interactive Grid region ID
     * @returns {boolean} True if rows are selected, false otherwise
     */
    igUtil.checkRowsAreSelected = igId => {
        const ig = apex.region(igId);
        const igWidget = ig.widget();
        const igGrid = igWidget.interactiveGrid('getViews', 'grid');
        return igGrid.getSelectedRecords().length > 0;
    };

    /**
     * Refreshes changed records in an Interactive Grid
     * @param {string} igId - The Interactive Grid region ID
     */
    igUtil.refreshChangedRecords = igId => {
        const igModel = apex.region(igId).call('getViews', 'grid').model;
        const changedRecords = igModel.getChanges()
            .map(change => change.record);
        
        igModel.fetchRecords(changedRecords);
    };

    /**
     * Refreshes selected records in an Interactive Grid
     * @param {string} igId - The Interactive Grid region ID
     */
    igUtil.refreshSelectedRecords = igId => {
        const igRegion = apex.region(igId);
        const igModel = igRegion.call('getViews', 'grid').model;
        const selectedRecords = igRegion.call('getSelectedRecords');
        
        igModel.fetchRecords(selectedRecords);
    };

    /**
     * Sets filters on an Interactive Grid
     * @param {string} regionId - The Interactive Grid region ID
     * @param {string[]} columns - Array of column names
     * @param {string[]} values - Array of filter values
     */
    igUtil.setIGFilters = (regionId, columns, values) => {
        const region = apex.region(regionId);
        const inst = region.call("instance");
        const filters = region.call("getFilters");
        const options = { save: false };
        let changed = false;

        const idMap = columns.reduce((map, col) => {
            const column = inst._getColumnByName(col);
            if (column) map[column.id] = col;
            return map;
        }, {});

        const colMap = filters.reduce((map, filter) => {
            if (filter.type === "column" && filter.operator === "EQ" && idMap[filter.columnId]) {
                map[idMap[filter.columnId]] = {
                    id: filter.id,
                    val: filter.value
                };
            }
            return map;
        }, {});

        columns.forEach((col, i) => {
            const val = values[i];
            const existing = colMap[col];
            const id = existing?.id;
            const curVal = existing?.val;

            if (val !== "") {
                const filter = {
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
            } else if (id) {
                region.call("deleteFilter", id, options);
                changed = true;
            }
        });

        if (changed) {
            inst._setReportSettings({});
        }
    };

    /**
     * Changes the heading of a column in an Interactive Grid
     * @param {string} igId - The Interactive Grid region ID
     * @param {string} columnName - The name of the column to change
     * @param {string} newHeading - The new heading text
     */
    igUtil.changeColumnName = (igId, columnName, newHeading) => {
        const igView = apex.region(igId).call("getCurrentView").view$;
        const column = igView.grid("getColumns")
            .find(column => column.property === columnName);
        
        if (column) {
            column.heading = newHeading;
            igView.grid("refreshColumns").grid("refresh");
        }
    };

})(apex.custom.igUtil, apex.jQuery);
