var React = require("react");
var _ = require("lodash")
var TransitionGroup = require('react-transition-group/TransitionGroup');
var connectionCache = require("../../utils/connection-cache");
var HubClient = require("../../utils/HubClient");

var SoundGui = React.createClass({
    getInitialState: function () {
        return {switch: false, themes: []}
    },
    componentWillMount: function () {
        /*  this.setupNodes(this.props.data,this.props)*/
        /*  this.setState({data:this.props.data})*/
    },
    componentWillReceiveProps: function (nextProps) {
        if (nextProps.shouldUpdateId != this.props.shouldUpdateId) {
            /*  this.setupNodes(nextProps.data,nextProps)*/
            this.setState({switch: false, themes: []})
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

        var list = [];
        list = this._nodes(item.children, list);
        list = this.dedupeNodeList(list);
        var scoreList = {
            "play": {
                "themes": [],
                "scenes": []
            }
        };

        scoreList.play.themes = this.state.themes;
        if (event.target.checked) {
            scoreList.play.themes.push(item.name);
        } else {
            var i = _.indexOf(scoreList.play.themes, item.name);
            scoreList.play.themes.splice(i, 1);
        }

        _.each(list, function (scene) {
            scoreList.play.scenes.push(scene.toString());
        });
        if (scoreList.play.themes.length == 0) {
            scoreList.play.scenes = [];
        }
        HubClient.publishScoreCommand(scoreList, connectionCache.getSocketID());
        console.log("score", scoreList);
        this.setState({themes: scoreList.play.themes});
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
        var value = "00000".substring(0, 6 - c.length) + c;
        console.log("angel", value)
        return "00000".substring(0, 6 - c.length) + c;
    },
    handleSwitch: function (event) {
        this.setState({switch: !this.state.switch});
    },
    render() {
        if (!this.props.data) {
            return null;
        }
        try {

            var self = this;
            var rowHeaders, columnHeaders = [];
            var ls = JSON.parse(localStorage.getItem(this.props.data._id));

            if (ls) {
                if(!this.state.switch){
                    rowHeaders = ls.rowHeaders;
                    columnHeaders = ls.columnHeaders;
                }else{
                    rowHeaders = ls.columnHeaders;
                    columnHeaders = ls.rowHeaders;
                }

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
                                style={{"backgroundColor": "#" + self.intRGB(self.hashCode(columnHeaders[idx - 1].alias || columnHeaders[idx-1].name))}}
                                width={self.props.innerWidth / (columnHeaders.length + 1)} key={cellID}
                                scope="col">{columnHeaders[idx - 1].alias || columnHeaders[idx - 1].name }</th>)
                        }
                    } else {
                        if (idx == 0) {
                            cell.push(<th
                                style={{"backgroundColor": "#" + self.intRGB(self.hashCode(rowHeaders[i - 1].alias || rowHeaders[i-1].name))}}
                                key={cellID} scope="row">{rowHeaders[i - 1].alias || rowHeaders[i - 1].name}</th>)
                        } else {
                            var obj = _.find(ls.themes, function (theme) {
                                if (!self.state.switch) {
                                    return theme.name === rowHeaders[i - 1].name + columnHeaders[idx - 1].name;
                                } else {
                                    return theme.name === columnHeaders[idx - 1].name + rowHeaders[i - 1].name;
                                }
                            });
                            cell.push(<td key={cellID}>
                                <label className="switch" style={{
                                    height: self.props.innerHeight / (rowHeaders.length + 1),
                                    width: self.props.innerWidth / (columnHeaders.length + 1)
                                }}>
                                    <input type="checkbox" onClick={self.handleCheckboxChange.bind(this, obj)}/>
                                    <div className="slider round">
                                        <span className="on">{JSON.stringify(obj.name)}</span>
                                        <span className="off">{JSON.stringify(obj.name)}</span>
                                    </div>
                                </label>
                            </td>)
                        }
                    }
                }
                rows.push(<tr key={rowID} width={this.props.innerWidth}
                              height={this.props.innerHeight / (rowHeaders.length + 1)} >{cell}</tr>)
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
