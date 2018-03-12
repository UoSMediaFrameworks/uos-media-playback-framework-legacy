var _ = require('lodash');

function transferPastGenerationAliases(pastArray, currentGenArray) {
    var combinedArray = currentGenArray;
    _.each(combinedArray, function (object) {
        var index = _.findIndex(pastArray, function (obj) {
            return obj.name == object.name;
        });
        if (index != -1) {
            object.alias = pastArray[index].alias;
        }

    });
    return combinedArray;
}

function getUniqArrByName(arr) {
    var temp = _.uniqBy(arr, function (i) {
        return i.name
    });
    return temp;
}

module.exports = {
    generateCategoryConfig: function (sceneGraph) {
        try {
            var prevConfig = sceneGraph.categoryConfig;
            var config = null;
            var themes = _.filter(sceneGraph.nodeList, function (child) {
                return child.type === "theme";
            });
            var columnHeaders = [];
            var rowHeaders = [];
            _.each(themes, function (theme, index) {
                var tags = theme.themeTags.split(/\s+(?:,|AND|OR)\s+/);
                // APEP Suspect index should be changed to rowHeaders
                if (index <= prevConfig.dimensionConfig.maxRows) {
                    rowHeaders.push({name: tags[0], alias: null});
                }
                // APEP Suspect index should be columnHeaders
                if (index <= prevConfig.dimensionConfig.maxColumns) {
                    columnHeaders.push({name: tags[1], alias: null});
                }
            });
            if (rowHeaders !== [] && columnHeaders !== []) {
                rowHeaders = getUniqArrByName(rowHeaders);
                columnHeaders = getUniqArrByName(columnHeaders);

                // APEP TODO please add some comments as to why prevConfig is being processed
                if (prevConfig) {
                    var rowGen = transferPastGenerationAliases(prevConfig.rowHeaders, rowHeaders);
                    rowGen = getUniqArrByName(rowGen);
                    var columnGen = transferPastGenerationAliases(prevConfig.columnHeaders, columnHeaders);
                    columnGen = getUniqArrByName(columnGen);
                    // APEP TODO please add some comments, this is very hard to read why we are doing this
                    prevConfig.dimensionConfig.maxRows?_.slice(rowGen,0,prevConfig.dimensionConfig.maxRows+1):null;
                    prevConfig.dimensionConfig.maxColumns?_.slice(columnGen,0,prevConfig.dimensionConfig.maxColumns+1):null;
                    config = {rowHeaders: rowGen, columnHeaders: columnGen, dimensionConfig: prevConfig.dimensionConfig};
                } else {
                    config = {rowHeaders: rowHeaders, columnHeaders: columnHeaders, dimensionConfig: {maxRows:null,maxColumns:null}};
                }
            }
            sceneGraph.categoryConfig = config;
        } catch (e) {
            console.log("generation error", e)
        }
    },
};
