var _ = require('lodash');

function transferPastGenerationAliases(pastArray, currentGenArray) {
    var combinedArray = currentGenArray;
    _.each(combinedArray, function (object) {
        var index = _.findIndex(pastArray, function (obj) {
            return obj.name == object.name;
        });
        if (index != -1) {
            object.alias = pastArray[index].alias;
        }else{
            console.log("trGen","no match")
        }

    });
    return combinedArray;
}
function getUniqArrByName(arr){
    var temp = _.uniqBy(arr,function (i) {
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
                var tags = theme.themeTags.split(/\s+(?:,|AND|OR)\s+/);
                rowHeaders.push({name: tags[0], alias: null});
                columnHeaders.push({name: tags[1], alias: null});
            });
            var rowHeaders = getUniqArrByName(rowHeaders);
            var columnHeaders = getUniqArrByName(columnHeaders);
            if (prevConfig) {
                var rowGen = transferPastGenerationAliases(prevConfig.rowHeaders, rowHeaders);
                rowGen= getUniqArrByName(rowGen);
                var columnGen = transferPastGenerationAliases(prevConfig.columnHeaders, columnHeaders);
                columnGen= getUniqArrByName(columnGen);
                config = {rowHeaders: rowGen, columnHeaders: columnGen, themes: themes};
            } else {
                config = {rowHeaders: rowHeaders, columnHeaders: columnHeaders, themes: themes};
            }

            return config;
        } catch (e) {
            console.log("generation error", e)
        }
    },
};
