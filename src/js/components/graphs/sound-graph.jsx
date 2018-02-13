var React = require("react");
var _ = require("lodash")
var TransitionGroup = require('react-transition-group/TransitionGroup');
var connectionCache = require("../../utils/connection-cache");
var HubClient = require("../../utils/HubClient");

var SoundGui = React.createClass({
    getInitialState: function () {
        return {switch: false,themes:[]}
    },
    componentWillMount: function () {
      /*  this.setupNodes(this.props.data,this.props)*/
        /*  this.setState({data:this.props.data})*/
    },
    componentWillReceiveProps: function (nextProps) {
        if(nextProps.shouldUpdateId != this.props.shouldUpdateId){
          /*  this.setupNodes(nextProps.data,nextProps)*/
          this.setState({switch:false,themes:[]})
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
    handleCheckboxChange: function(item,event) {

        var list = [];

        // APEP If a theme is clicked, the only children are scenes or media objects
        list = this._nodes(item.children, list);

        list = this.dedupeNodeList(list);
        var scoreCommand = {
            "play": {
                "themes": this.state.themes, // APEP this is tracking the state as of last update
                "scenes": []
            }
        };


        // APEP using the state themes which tracks what has been clicked and what has not been clicked
        if(event.target.checked) {
            // APEP if we have just selected a new item, we should append as the state is missing this new update
            scoreCommand.play.themes.push(item.name);
        } else {
            // APEP if we are deselecting, we should remove
            var i= _.indexOf(scoreCommand.play.themes, item.name);
            scoreCommand.play.themes.splice(i,1);
        }

        list = list.filter(function(nodeItems) {
            return nodeItems.type === "scene";
        });

        _.each(list, function (scene) {
            scoreCommand.play.scenes.push(scene.toString());
        });

        // APEP only publish a command if have at least a scene to send
        if(scoreCommand.play.scenes.length !== 0) {
            console.log("Sending score command from sound graph: ", scoreCommand);
            HubClient.publishScoreCommand(scoreCommand, connectionCache.getSocketID());
        }

        // APEP update state so we know what has been clicked and what has not been clicked
        this.setState({themes:scoreCommand.play.themes});
    },

    hashCode:function(str){
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    },
    intRGB:function(i){
        var c = (i & 0x00FFFFFF)
            .toString(16)
            .toUpperCase();
        var value =  "00000".substring(0, 6 - c.length) + c;
        console.log("angel",value)
        return "00000".substring(0, 6 - c.length) + c;
    },
    handleSwitch:function (event) {
        this.setState({switch:!this.state.switch});
    },
    render(){
        try{


            var self =this;
        var themes = _.filter(this.props.data.nodeList, function (child) {
            return child.type === "theme";
        });
        var columnHeaders = [];
        var rowHeaders = [];
        _.each(themes,function(theme){
               var test = theme.themeTags.split(/\s+(?:,|AND|OR)\s+/);
            if(!self.state.switch){
                columnHeaders.push(test[1]);
                rowHeaders.push(test[0]);
            }else{
                columnHeaders.push(test[0]);
                rowHeaders.push(test[1]);
            }

        });
        columnHeaders =_.uniq(columnHeaders);
        rowHeaders =_.uniq(rowHeaders);

        var rows = [];
        for (var i = 0; i < rowHeaders.length+1; i++){

            let rowID = `row${i}`;
            let cell = [];
            for (var idx = 0; idx < columnHeaders.length+1; idx++){
                let cellID = `cell${i}-${idx}`;
                if(i == 0){
                    if(idx==0){
                        cell.push( <td width={self.props.innerWidth/(columnHeaders.length+1)}>
                            <label className="switch" style={{height:self.props.innerHeight/(rowHeaders.length +1),
                                width:self.props.innerWidth/(columnHeaders.length+1)}}>
                                <input type="checkbox" onClick={self.handleSwitch}  />
                                <div className="slider round">
                                    <span className="on">Switch categories</span>
                                    <span className="off">Switch categories</span>
                                </div>
                            </label></td>);
                    }else{
                        cell.push(<th style={{"backgroundColor":"#" +self.intRGB(self.hashCode(columnHeaders[idx -1]))}} width={self.props.innerWidth/(columnHeaders.length+1)}key={cellID} scope="col">{columnHeaders[idx -1]}</th>)
                    }
                }else{
                    if(idx == 0){
                        cell.push(<th style={{"backgroundColor":"#" +self.intRGB(self.hashCode(rowHeaders[i - 1]))}}  key={cellID} scope="row">{rowHeaders[i-1]}</th>)
                    }else{
                        var obj = _.find(themes,function(theme){
                            if(!self.state.switch) {
                                return theme.name === rowHeaders[i - 1] + columnHeaders[idx - 1];
                            }else{
                                return theme.name === columnHeaders[idx - 1] +  rowHeaders[i - 1];
                            }
                        });
                        console.log("angel",obj)
                        cell.push(<td key={cellID} id={cellID}>
                            <label className="switch" style={{height:self.props.innerHeight/(rowHeaders.length +1),
                                width:self.props.innerWidth/(columnHeaders.length+1)}}>
                                <input type="checkbox" onClick={self.handleCheckboxChange.bind(this,obj)}  />
                                <div className="slider round">
                                     <span className="on">{rowHeaders[i-1] + columnHeaders[idx -1]}</span>
                                    <span className="off">{rowHeaders[i-1] + columnHeaders[idx -1]}</span>
                                </div>
                            </label>
                           </td>)
                    }
                }
            }
            rows.push(<tr key={i} width={this.props.innerWidth} height={this.props.innerHeight/(rowHeaders.length +1)} id={rowID}>{cell}</tr>)
        }
        }catch(ex){
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
    )}
});


module.exports = SoundGui;
