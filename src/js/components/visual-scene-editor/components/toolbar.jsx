var React = require('react');
var FontAwesome = require('react-fontawesome');
var SizeMe = require('react-sizeme');
var Creatable = require('react-select').Creatable;
var Select = require('react-select').Select;
var _ = require('lodash');

var ratioList = [
        {label: "16:9 (standard)", value: "16:9"},
        {label: "4:3 (standard)", value: "4:3"},
        {label: "21:9 (cinematic)", value: "21:9"},
        {label: "1:1 (square)", value: "1:1"}
    ]

var ToolBar = React.createClass({

    handleSelectRatio(selectedRatio) {
        //todo sanitise input!!!
        this.props.context.handleRatioChange(selectedRatio.value)
            console.log(`Option selected:`, selectedRatio.value);
    },

    render() {

        let items = [];

        if (this.props.isRandom === true) {
            return (
                <div className="mf-gui-toolbar">
                    <span>
                        <span className="mf-gui-toolbar-text">Random Position</span>
                        <FontAwesome
                            id="randomPlacement"
                            className='mf-gui-toolbar-icon'
                            onClick={this.props.context.toggleRandomPlacement}
                            name='check-square-o'
                            size='2x'/>
                    </span>
                </div>
            )
        }

        const customStyles = {
            control: (base, state) => (_.merge(base,{
                background: "var(--main-control-bg)",
                border: "#343434",
                color: "var(--main-control-text-colour)",
                marginLeft: "5px",
                // match with the menu
                borderRadius: state.isFocused ? "3px 3px 0 0" : 3,
                // Overwrittes the different states of border
                // Removes weird border around container
                boxShadow: state.isFocused ? null : null,
              })),
            menu: base => (_.merge(base,{
              // override border radius to match the box
              borderRadius: 0,
              // beautify the word cut by adding a dash see https://caniuse.com/#search=hyphens for the compatibility
              hyphens: "auto",
              // kill the gap
              marginTop: 0,
              textAlign: "left",
              color: "black",
              // prevent menu to scroll y
              wordWrap: "break-word"
            })),
            menuList: base => (_.merge(base, {
              // kill the white space on first and last option
              padding: 0
            })),
          };


        console.log("toolbar:", this.props.context.state)
        var lockIcon = this.props.context.state.placement.IsAspectLocked ? "lock" : "unlock";

        return (
        <div className="mf-gui-toolbar">

            <span>
                <FontAwesome
                    id="moveUp"
                    className='mf-gui-toolbar-icon'
                    name='arrow-up'
                    onClick={this.props.context.toolbarButtonClick}
                    size='2x'/>
                <FontAwesome
                    id="moveDown"
                    className='mf-gui-toolbar-icon'
                    name='arrow-down'
                    onClick={this.props.context.toolbarButtonClick}
                    size='2x'/>
                <FontAwesome
                    id="moveLeft"
                    className='mf-gui-toolbar-icon'
                    name='arrow-left'
                    onClick={this.props.context.toolbarButtonClick}
                    size='2x'/>
                <FontAwesome
                    id="moveRight"
                    className='mf-gui-toolbar-icon'
                    name='arrow-right'
                    onClick={this.props.context.toolbarButtonClick}
                    size='2x'/>
            </span>

            <span>
                <FontAwesome
                    id='rotate-left'
                    className='mf-gui-toolbar-icon'
                    name='rotate-left'
                    onClick={this.props.context.toolbarButtonClick}
                    size='2x'/>
                <FontAwesome
                    id='rotate-right'
                    className='mf-gui-toolbar-icon'
                    name='rotate-right'
                    onClick={this.props.context.toolbarButtonClick}
                    size='2x'/>
            </span>

            <span>
                <FontAwesome
                    id="zoomIn"
                    className='mf-gui-toolbar-icon'
                    name='search-plus'
                    size='2x'
                    onClick={this.props.context.toolbarButtonClick}/>
                <FontAwesome
                    id="zoomOut"
                    className='mf-gui-toolbar-icon'
                    name='search-minus'
                    size='2x'
                    onClick={this.props.context.toolbarButtonClick}/>
            </span>

            <span>
                <span className="mf-gui-toolbar-text">Random Position</span>
                <FontAwesome
                    id="randomPlacement"
                    className='mf-gui-toolbar-icon'
                    onClick={this.props.context.toggleRandomPlacement}
                    name='square-o'
                    size='2x'/>
            </span>

            <span>
                <span className="mf-gui-toolbar-text">Image AR</span>
                <FontAwesome
                    id="aspectRatio"
                    className='mf-gui-toolbar-icon'
                    onClick={this.props.context.toolbarButtonClick}
                    name={lockIcon}
                    size='2x'/>
            </span>

            <span>
                <FontAwesome
                    id="refresh"
                    className='mf-gui-toolbar-icon'
                    onClick={this.props.context.getDefaultPlacement}
                    name='refresh'
                    size='2x'/>
            </span>


            <span>
                <span className="mf-gui-toolbar-text">Scene AR</span>
                <div style={{width: "200px", display:"inline-block"}}>
                    <Creatable
                        menuPlacement="top"
                        options={ratioList}
                        styles={customStyles}
                        onChange={this.handleSelectRatio}
                        defaultValue={{label: this.props.ratio, value: this.props.ratio}}
                        formatCreateLabel={(inputValue) => {return `Custom: ${inputValue}`}}
                    />
                </div>
            </span>

            <span className="mf-gui-editor-templateBar">
                <span className="mf-gui-toolbar-text">Templates</span>
                <img id="QuadUL" width='32' height='32' onClick={this.props.context.templateButtonClick} src="images/QuadUL.png"/>
                <img id="QuadUR" onClick={this.props.context.templateButtonClick} src="images/QuadUR.png"/>
                <img id="QuadLL" onClick={this.props.context.templateButtonClick} src="images/QuadLL.png"/>
                <img id="QuadLR" onClick={this.props.context.templateButtonClick} src="images/QuadLR.png"/>
                <img id="Full" onClick={this.props.context.templateButtonClick} src="images/Full.png"/>
                <img id="Center" onClick={this.props.context.templateButtonClick} src="images/Center.png"/>
            </span>

        </div>
        )
    }
})

module.exports = SizeMe({monitorHeight: true})(ToolBar)
