var React = require('react');
var SizeMe = require('react-sizeme');

var AspectRatio = React.createClass({

    calculateRect(container, ratio, children, offset) {

        var heightFromWidth = (container.width/ratio);

        if (heightFromWidth >= (container.height-offset)) {
            //height constrained case
            var w = ratio*(container.height-offset);
            return {
                width: w,
                height: container.height-offset,
                top: 0, 
                left: (container.width-w)/2
            }
        } else {
            //width constrained case
            return {
                width: container.width,
                height: heightFromWidth,
                top: 0, //could center vertically if desired
                left: 0
            }
        }
    },
    
    render() {
        var ratioParts = this.props.ratio.split(":");
        var w = ratioParts[0];
        var h = ratioParts[1];
        var ratio = w/h;

        var rect = this.calculateRect(this.props.size, ratio, this.props.children, this.props.offset || 0)

        return (
            <div className="aspect-container" style={{width: "100%", height: "100%"}}>
                <div className="aspect-contained" style={{width: `${rect.width}px`, height: `${rect.height}px`, marginTop: `${rect.top}px`, marginLeft: `${rect.left}px`}}>
                    {this.props.children[0]}
                </div>
                <div className="aspect-after" style={{width: "100%"}}>
                    {this.props.children[1] || <div></div>}
                </div>
            </div>
        ) 
    }

})

//SizeMe wrapper injects size prop
module.exports = SizeMe({monitorHeight: true, monitorWidth: true})(AspectRatio);