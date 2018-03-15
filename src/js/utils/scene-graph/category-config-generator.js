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
            _.each(themes, function (theme) {
                if (!theme.themeTags) {
                    return false;
                }
                var tags = theme.themeTags.split(/\s+(?:,|AND|OR)\s+/);
                // APEP Suspect index should be changed to rowHeaders
                // APEP Suspect index should be columnHeaders
                // AP: In actuality the step was not needed as this is not the correct step to check against the dimensions config
                // this step created the row and column headers arrays before they are stripped of duplication
                rowHeaders.push({name: tags[0], alias: null});
                columnHeaders.push({name: tags[1], alias: null});

            });
            if (rowHeaders !== [] && columnHeaders !== []) {
                //AP: We strip away dublication of strings in rows and columns individually
                rowHeaders = getUniqArrByName(rowHeaders);
                columnHeaders = getUniqArrByName(columnHeaders);

                // APEP TODO please add some comments as to why prevConfig is being processed
                // AP: Answer to the above question
                // -> the prev config is being processed in order to transfer alias values upon any change in the available headers
                if (prevConfig) {
                    var rowGen = transferPastGenerationAliases(prevConfig.rowHeaders, rowHeaders);
                    rowGen = getUniqArrByName(rowGen);
                    var columnGen = transferPastGenerationAliases(prevConfig.columnHeaders, columnHeaders);
                    columnGen = getUniqArrByName(columnGen);
                    // APEP TODO please add some comments, this is very hard to read why we are doing this
                    //AP: pseudo code of the code
                    // If max [Rows/Columns] setting exist in the dimension config slice of a section from the Array coresponding to the setting
                    // This feature will not cut out a section based on the range [0 to maxRows + 1], or it will do nothing.
                    prevConfig.dimensionConfig.maxRows ? rowGen = _.slice(rowGen, 0, prevConfig.dimensionConfig.maxRows - 1) : null;
                    prevConfig.dimensionConfig.maxColumns ? columnGen = _.slice(columnGen, 0, prevConfig.dimensionConfig.maxColumns - 1) : null;

                    config = {
                        rowHeaders: rowGen,
                        columnHeaders: columnGen,
                        dimensionConfig: prevConfig.dimensionConfig
                    };
                } else {
                    config = {
                        rowHeaders: rowHeaders,
                        columnHeaders: columnHeaders,
                        dimensionConfig: {maxRows: null, maxColumns: null}
                    };
                }
            }
            sceneGraph.categoryConfig = config;
        } catch (e) {
            console.log("generation error", e)
        }
    },
};
