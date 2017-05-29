
var React = require("react");
var classes = require('classnames');
var AutowalkMenu = React.createClass({
    getInitialState: function() {
        return {

        }
    },
    render(){
        console.log(this.props)

        var autowalkClasses = classes({
            'visible': this.state.autoWalkToggle,
            'hidden': !this.state.autoWalkToggle
        });
        return (
            <div className={autowalkClasses}>
                <p>Extra options menu React 1 </p>
                <ul>
                    <li onClick={this.props.autocompleteHandler}>Scene search toggle</li>
                    <li onClick={this.props.sceneViewerHandler}>Scene Viewer</li>
                    <li onClick={this.props.qrHandler}>QR code toggle</li>
                    <li onClick={this.props.breadcrumbsHandler}>Breadcrumbs menu toggle</li>
                    <li onClick={this.props.autowalkHandler}>Autowalk menu toggle</li>
                </ul>
            </div>
        )
    }
});

module.exports = AutowalkMenu;
