var React = require('react');
var SceneStoreWatchMixin = require('../mixins/scene-store-watch-mixin');
var SceneStore = require('../stores/scene-store');
var SceneActions = require('../actions/scene-actions');


function getScene () {
    return {scene: SceneStore.getScene()};
}

function $c(staticClassName, conditionalClassNames) {
  var classNames = [];
  if (typeof conditionalClassNames == 'undefined') {
    conditionalClassNames = staticClassName;
  }
  else {
    classNames.push(staticClassName);
  }
  for (var className in conditionalClassNames) {
    if (!!conditionalClassNames[className]) {
      classNames.push(className);
    }
  }
  return classNames.join(' ');
}

var SceneJsonEditor = React.createClass({
    mixins: [SceneStoreWatchMixin(getScene)],
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


    render: function() {
        var groupClass = 'form-group' + (this.state.error ? ' has-error' : '');

        return (
            <div className={groupClass}>
                <textarea
                 className='form-control' 
                 onBlur={this.handleBlur}
                 defaultValue={JSON.stringify(this.state.scene, null, '\t')}>
                </textarea>
            </div>
        );
    }

});

module.exports = SceneJsonEditor;