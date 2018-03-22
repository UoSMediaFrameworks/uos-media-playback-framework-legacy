var AppDispatcher = require('../dispatchers/app-dispatcher');
var ActionTypes = require('../constants/scene-constants').ActionTypes;
var _ = require('lodash');

var GraphActions = {
    updateAutocompleteSelection: function (selectionValue) {
        AppDispatcher.handleViewAction({
            type: ActionTypes.AUTOCOMPLETE_SELECTED_UPDATE,
            value: selectionValue
        });
    },
};

module.exports = GraphActions;
