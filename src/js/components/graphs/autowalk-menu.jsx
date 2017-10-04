var React = require("react");
var classes = require('classnames');
var AutowalkStore = require('../../stores/autowalk-store')
var AutowalkMenu = React.createClass({
    getInitialState: function () {
        return AutowalkStore.getTimeoutProps();
    },

    updateInactivitySetting: function () {

        var props= {
            enabled: this.refs.enabled.checked,
            node_switch_duration: parseInt(this.refs.node_switch_duration.value),
            inactivity_wait_duration: parseInt(this.refs.inactivity_wait_duration.value)
        };
        AutowalkStore.updateTimeoutProps(props);
        this.setState(props)
    },
    componentDidMount:function(){
        document.onclick = this.updateInactivitySetting;
    },
    //APt : removing the trigger when inactivity component is not rendered
    componentWillUnmount:function(){
        document.onclick = null;
    },
    changeNSvalue:function(e){
        this.setState({node_switch_duration: e.target.value})
    },
    changeIWvalue:function(e){
        this.setState({inactivity_wait_duration: e.target.value})
    },
    render(){

        var autowalkClasses = classes({
            'visible': this.props.autoWalkToggle,
            'hidden': !this.props.autoWalkToggle,
            'autowalk-menu': true
        });
        return (
            <div className={autowalkClasses}>
                <div>
                    <label>Autowalk enabled</label><input ref="enabled" value={this.state.enabled} type="checkbox"/>
                </div>
                <div>
                    <label>Node Switch time(s)</label><input ref="node_switch_duration"
                                                             onChange={this.changeNSvalue}
                                                             value={this.state.node_switch_duration }
                                                             type="text"/>
                </div>
                <div>
                    <label>Wait Duration(s)</label><input ref="inactivity_wait_duration"
                                                          onChange={this.changeIWvalue}
                                                          value={this.state.inactivity_wait_duration}
                                                          type="text"/>
                </div>
                <div className="autowalk-menu-button">
                    <button type="button" className="btn btn-outline-secondary" onClick={this.updateInactivitySetting}>Set Settings</button>
                </div>
            </div>
        )
    }
});

module.exports = AutowalkMenu;
