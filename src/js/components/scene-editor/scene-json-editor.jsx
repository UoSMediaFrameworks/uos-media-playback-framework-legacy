var React = require('react');
var SceneStoreWatchMixin = require('../../mixins/scene-store-watch-mixin');
var SceneStore = require('../../stores/scene-store');
var SceneActions = require('../../actions/scene-actions');


function getScene() {
    return {value: JSON.stringify(SceneStore.getScene(), null, '\t')};
}

var SceneJsonEditor = React.createClass({
    getInitialState:function(){
        return getScene();
    },
    componentWillMount:function(){
        SceneStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
        SceneStore.removeChangeListener(this._onChange);
    },
    _onChange:function(){
        this.setState(getScene());
    },
    handleBlur: function(event) {
        try {
            var newScene = JSON.parse(event.target.value);
            this.setState({error: false});
            SceneActions.update(newScene);
        } catch (e) {
            if (e instanceof SyntaxError) {
                this.setState({error: true});
            } else {
                throw e;
            }
        }
    },

    handleChange: function(event) {
        this.setState({value: event.target.value});
    },

    render: function() {
        var groupClass = 'form-group' + (this.state.error ? ' has-error' : '');
        return (
            <div className={groupClass}>
                <textarea
                 className='form-control' 
                 onBlur={this.handleBlur}
                 onChange={this.handleChange}
                 value={this.state.value}>
                </textarea>
            </div>
        );
    }

});

module.exports = SceneJsonEditor;