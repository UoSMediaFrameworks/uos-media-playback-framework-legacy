var React = require("react");
var Selector = require('react-select-plus').default;
var classes = require('classnames');
var _ = require('lodash');
var GraphActions = require('../../actions/graph-actions');

var AutocompleteMenu = React.createClass({
    getInitialState: function () {
        return {type: "scene", selectedOption: ''}
    },
    createList: function () {

        var self = this;
        var sceneListItems = [{value: "none", label: "none"}];
        _.each(self.props.nodeList.nodes, function (node) {
            if (node.type === self.state.type) {
                sceneListItems.push({value: node._id, label: node.name})
            }
        });
        return sceneListItems


    },
    changeHandler: function (selectedItem) {
        GraphActions.updateAutocompleteSelection(selectedItem.value);
        this.setState({selectedOption:selectedItem})
    },
    render: function () {
        console.log(this)
        var autowalkClasses = classes({
            'visible': this.props.autocompleteToggle,
            'hidden': !this.props.autocompleteToggle,
            'autocomplete': true,
            'inline-item': true,
            'sceneSelector-searchBox': true
        });
        var list = this.createList();
        var value = this.state.selectedOption.value;
        return (<Selector className={autowalkClasses}
                          name={"autocompleteRef"}
                          value={value}
                          onCloseResetsInput ={false}
                          onSelectResetsInput={false}
                          clearable={false}
                          onChange={this.changeHandler}
                          options={list}
        />)


    }

});

module.exports = AutocompleteMenu;
