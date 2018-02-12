'use strict';
var React = require('react');
var _ = require('lodash');


var MojsMediaPreviewPlayer = React.createClass({
    render() {
        return (<div ref="burst"></div>);
    },

    shouldComponentUpdate () {
        this.props.isPlay && this._burst.replay();
        return false;
    },

    componentDidMount () {
        // APEP testing this.refs.burst

        console.log("MoJS DID MOUNT");
        console.log("MoJS DID MOUNT");
        console.log("MoJS DID MOUNT");
        console.log("MoJS DID MOUNT");

        try {
            this._burst = new mojs.Burst({
                parent:   this.refs.burst,
                radius:   { 4: 49 },
                angle:    45,
                count:    12,
                isShowEnd: false,
                timeline() {
                    onComplete: ()=> { this.props.onComplete && this.props.onComplete(); }
                },
                children: {
                    radius:       10,
                    fill:         'white',
                    scale:        { 1: 0, easing: 'sin.in' },
                    pathScale:    [ .7, null ],
                    degreeShift:  [ 13, null ],
                    duration:     [ 500, 700 ],
                    isForce3d:    true
                }
            });
        } catch (e) {
            console.log("mojs error");
            console.log("mojs error");
            console.log("mojs error");
            console.log("mojs error");
            console.log("mojs error");
            console.log("mojs error");
            console.log("mojs error");
            console.log(e);
        }

    }
});

var MojsMediaPreviewPlayer2 = React.createClass({
    render() {
        return (<div ref="shape"></div>);
    },

    componentDidMount () {
        try {
            this._shape = new mojs.Shape({
                parent:       this.refs.shape, // parent is set to make it relative
                shape:        'circle',  // shape "circle" is default
                radius:       25,        // shape radius
                fill:         'white',   // same as 'transparent'
                stroke:       '#F64040', // or 'cyan'
                strokeWidth:  5,         // width of the stroke
                isShowStart:  true,      // show before any animation starts
            });
        } catch (e) {
            console.log("mojs error");
            console.log(e);
        }
    }
});

var MojsMediaPreviewPlayer3 = React.createClass({
    render() {
        return (<div ref="animShape"></div>);
    },

    shouldComponentUpdate () {
        return false;
    },

    componentDidMount () {
        try {
            this._shape = new mojs.Shape({
                parent:       this.refs.animShape, // parent is set to make it relative
                shape:        'circle',
                scale:        { 0 : 1, easing: 'cubic.out' },
                fill:         { 'cyan': 'yellow', easing: 'cubic.in' },

                duration:     2000,
                repeat:       999,
            }).play();
        } catch (e) {
            console.log("mojs error");
            console.log(e);
        }
    }
});

var MojsMediaPreviewPlayer4 = React.createClass({
    render() {
        return (<div ref="animShape"></div>);
    },

    shouldComponentUpdate () {
        return false;
    },

    componentDidMount () {
        try {

            const shiftCurve = mojs.easing.path( 'M0,100 C50,100 50,100 50,50 C50,0 50,0 100,0' );
            const scaleCurveBase = mojs.easing.path( 'M0,100 C21.3776817,95.8051376 50,77.3262711 50,-700 C50,80.1708527 76.6222458,93.9449005 100,100' );
            const scaleCurve = (p) => { return 1 + scaleCurveBase(p); };
            const nScaleCurve = (p) => { return 1 - scaleCurveBase(p)/10; };

            this._shape = new mojs.Shape({
                parent:       this.refs.animShape, // parent is set to make it relative
                shape:        'rect',
                fill:         { '#F64040' : '#F64040', curve: scaleCurve },
                radius:       10,
                rx:           3,
                x:            { [-125] : 125, easing: shiftCurve },
                scaleX:       { 1 : 1, curve: scaleCurve },
                scaleY:       { 1 : 1, curve: nScaleCurve },
                origin:       { '0 50%' : '100% 50%', easing: shiftCurve },

                isYoyo:         true,
                delay:        500,
                duration:     800,
                repeat:       999
            }).play();
        } catch (e) {
            console.log("mojs error");
            console.log(e);
        }
    }
});


var MojsMediaPreviewPlayer5 = React.createClass({
    render() {
        return (<div ref="timeline"></div>);
    },

    shouldComponentUpdate () {
        return false;
    },

    componentDidMount () {
        try {
            this._shape = new mojs.Shape({
                parent:       this.refs.timeline, // parent is set to make it relative
                shape:        'circle',  // shape "circle" is default
                radius:       50,        // shape radius
                fill:         'white',   // same as 'transparent'
                stroke:       '#F64040', // or 'cyan'
                strokeWidth:  5,         // width of the stroke
                isShowStart:  true,      // show before any animation starts
            });

            this._shape2 = new mojs.Shape({
                parent:       this.refs.timeline, // parent is set to make it relative
                shape:        'circle',
                scale:        { 0 : 1, easing: 'cubic.out' },
                fill:         { 'cyan': 'yellow', easing: 'cubic.in' },

                duration:     2000,
                repeat:       999,
            });

            const timeline = new mojs.Timeline;
            timeline
                .add( this._shape2 );

            timeline.play();
                // .add( this._shape, this._shape2 );
        } catch (e) {
            console.log("mojs error");
            console.log(e);
        }
    }
});


const App = React.createClass({
    getInitialState() {
        return { isPlay: true }
    },

    render() {
        return ( <div>
            <button onClick={this._play}>Play</button>
            {/*<MojsMediaPreviewPlayer isPlay={this.state.isPlay} onComplete={this._resetPlay}/>*/}
            {/*{<MojsMediaPreviewPlayer2/>}*/}
            {/*{<MojsMediaPreviewPlayer3/>}*/}
            {/*{<MojsMediaPreviewPlayer4/>}*/}
            {<MojsMediaPreviewPlayer5/>}
        </div>);
    },

    _play() { this.setState({ isPlay: true }); },
    _resetPlay() { this.setState({ isPlay: false }); }
});


module.exports = App;
