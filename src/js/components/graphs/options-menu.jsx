
var React = require("react");
var classes = require('classnames');
var OptionsMenu = React.createClass({
    getInitialState: function() {
        return {

        }
    },
    render(){

        var menuClasses = classes({
            'options-menu': true,
            'visible': this.props.optionsMenuToggle,
            'hidden': !this.props.optionsMenuToggle
        });

        return (
            <div className={menuClasses}>
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

module.exports = OptionsMenu;
