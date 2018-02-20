var React = require("react");
var _ = require("lodash")
var TransitionGroup = require('react-transition-group/TransitionGroup');
var connectionCache = require("../../utils/connection-cache");
var HubClient = require("../../utils/HubClient");

var SoundGui = React.createClass({
    getInitialState: function () {
        return {switch: false, themes: [], scenes: []}
    },
    componentWillMount: function () {

    },
    componentWillReceiveProps: function (nextProps) {
        if (this.props.sceneList._id !== nextProps.sceneList._id) {
            this.setState({switch: false, themes: [], scenes: []})
        }
    },
    _nodes: function (list, sceneList) {
        var self = this;
        for (var listIndex in list) {
            var thisItem = list[listIndex];

            if (thisItem.type !== 'scene') {
                self._nodes(thisItem.children, sceneList);
            } else {
                sceneList.push(thisItem._id);
            }
        }

        return sceneList;
    },
//Removes duplicates from the list of nodes.
    dedupeNodeList: function (list) {
        var dedupeList = [];

        for (var listIndex in list) {
            var item = list[listIndex];

            if (dedupeList.indexOf(item) === -1) {
                dedupeList.push(item);
            }
        }
        return dedupeList;
    },
    handleCheckboxChange: function (item, event) {
        var self = this;
        var list = [];

        // APEP If a theme is clicked, the only children are scenes or media objects
        list = this._nodes(item.children, list);

        list = this.dedupeNodeList(list);
        var scoreCommand = {
            "play": {
                "themes": this.state.themes, // APEP this is tracking the state as of last update
                "scenes": [],
                "tour": false // APEP we never want to tour from the soundboard graph
            }
        };
        scoreCommand.play.scenes = self.state.scenes;
        // APEP using the state themes which tracks what has been clicked and what has not been clicked
        if (event.target.checked) {
            // APEP if we have just selected a new item, we should append as the state is missing this new update
            scoreCommand.play.themes.push(item.name);
            _.each(list, function (scene) {
                    scoreCommand.play.scenes.push(scene.toString());
            });
        } else {
            // APEP if we are deselecting, we should remove
            var i = _.indexOf(scoreCommand.play.themes, item.name);
            _.each(list, function (scene) {
                var idx = _.indexOf(self.state.scenes, scene.toString());
                if (idx != -1) {
                    self.state.scenes.splice(idx, 1);
                }
            });
            scoreCommand.play.scenes = self.state.scenes;
            scoreCommand.play.themes.splice(i, 1);
        }


        console.log("score command", scoreCommand);
       //.Temp Solution AP: when no scenes are send it clears the active scene and active scene ID.
        HubClient.publishScoreCommand(scoreCommand, connectionCache.getSocketID());
        // APEP update state so we know what has been clicked and what has not been clicked
        this.setState({themes: scoreCommand.play.themes, scenes: scoreCommand.play.scenes});
    },

    hashCode: function (str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    },
    intRGB: function (i) {
        var c = (i & 0x00FFFFFF)
            .toString(16)
            .toUpperCase();
        return "00000".substring(0, 6 - c.length) + c;
    },

    handleSwitch: function (event) {
        this.setState({switch: !this.state.switch});
    },
    render() {
        if (!this.props.sceneList) {
            return null;
        }
        if (!this.props.sceneList.categoryConfig) {
            return (<div>Categories are not generated error</div>);
        }
        try {
            var self = this;
            var rowHeaders, columnHeaders = [];
            var ls = self.props.sceneList.categoryConfig;
            if (!this.state.switch) {
                rowHeaders = ls.rowHeaders;
                columnHeaders = ls.columnHeaders;
            } else {
                rowHeaders = ls.columnHeaders;
                columnHeaders = ls.rowHeaders;
            }

            var rows = [];
            for (var i = 0; i < rowHeaders.length + 1; i++) {

                let rowID = `row${i}`;
                let cell = [];
                for (var idx = 0; idx < columnHeaders.length + 1; idx++) {
                    let cellID = `cell${i}-${idx}`;
                    if (i == 0) {
                        if (idx == 0) {
                            cell.push(<td key={cellID} width={self.props.innerWidth / (columnHeaders.length + 1)}>
                                <label className="switch" style={{
                                    height: self.props.innerHeight / (rowHeaders.length + 1),
                                    width: self.props.innerWidth / (columnHeaders.length + 1)
                                }}>
                                    <input type="checkbox" onClick={self.handleSwitch}/>
                                    <div className="slider round">
                                        <span className="on">Switch categories</span>
                                        <span className="off">Switch categories</span>
                                    </div>
                                </label></td>);
                        } else {
                            cell.push(<th
                                style={{"backgroundColor": "#" + self.intRGB(self.hashCode(columnHeaders[idx - 1].alias || columnHeaders[idx - 1].name))}}
                                width={self.props.innerWidth / (columnHeaders.length + 1)} key={cellID}
                                scope="col">{columnHeaders[idx - 1].alias || columnHeaders[idx - 1].name}</th>)
                        }
                    } else {
                        if (idx == 0) {
                            cell.push(<th
                                style={{"backgroundColor": "#" + self.intRGB(self.hashCode(rowHeaders[i - 1].alias || rowHeaders[i - 1].name))}}
                                key={cellID} scope="row">{rowHeaders[i - 1].alias || rowHeaders[i - 1].name}</th>)
                        } else {
                            //TODO: AP - this needs to be checked against a specific value rather than this random combination of string
                            var themes = _.filter(self.props.data.nodes, function (t) {
                                return t.type === 'theme';
                            });
                            var obj = _.find(themes, function (theme) {
                                var tags = theme.themeTags.split(/\s+(?:,|AND|OR)\s+/);
                                if (!self.state.switch) {
                                    return tags[0] === rowHeaders[i - 1].name && tags[1] === columnHeaders[idx - 1].name;
                                } else {
                                    return tags[0] === columnHeaders[idx - 1].name && tags[1] === rowHeaders[i - 1].name;
                                }
                            });
                            var cellValue;
                            var cellChecked;
                            if (obj) {
                                cellValue = -1 !== _.indexOf(self.state.themes, obj.name) ? 'on' : 'off';
                                cellChecked = -1 !== _.indexOf(self.state.themes, obj.name) ? true : false;
                            } else {
                                cellValue = 'off';
                                cellChecked = false;
                            }

                            cell.push(<td key={cellID} className={obj ? '' : "disabled-cell"}>
                                <label className="switch" style={{
                                    height: self.props.innerHeight / (rowHeaders.length + 1),
                                    width: self.props.innerWidth / (columnHeaders.length + 1)
                                }}>
                                    <input type="checkbox" value={cellValue} checked={cellChecked}
                                           onClick={self.handleCheckboxChange.bind(this, obj)}/>
                                    <div className="slider round">
                                        <span className="on">{obj ? obj.name : "No Item"}</span>
                                        <span className="off">{obj ? obj.name : "No Item"}</span>
                                    </div>
                                </label>
                            </td>)
                        }
                    }
                }
                rows.push(<tr key={rowID} width={this.props.innerWidth}
                              height={this.props.innerHeight / (rowHeaders.length + 1)}>{cell}</tr>)
            }
        } catch (ex) {
            console.log("error Angel", ex)
        }


        return (
            <TransitionGroup ref="backgroundContainer" id="backgroundContainer" component="div">
                <div className="board">
                    <table id="simple-board">
                        <tbody>
                        {rows}
                        </tbody>
                    </table>
                </div>
            </TransitionGroup>
        )
    }
});


module.exports = SoundGui;
