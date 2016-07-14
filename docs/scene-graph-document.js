/**
 * Created by aaronphillips on 07/07/2016.
 */

var sceneGraph = {
    graphTheme1: {
        city1: {
            nodes: [
                {
                    _id: "",
                    type: "",
                    parentNodeIds: [

                    ],
                    childNodeIds: [

                    ]
                }, {
                    _id: "",
                    type: "",
                    parentNodeIds: [

                    ],
                    childNodeIds: [

                    ]
                }
            ]
        },
        city2: {
            nodes: [
                {
                    _id: "",
                    type: "",
                    parentNodeIds: [

                    ],
                    childNodeIds: [

                    ]
                }, {
                    _id: "",
                    type: "",
                    parentNodeIds: [

                    ],
                    childNodeIds: [

                    ]
                }
            ]
        },
        city3: {
            nodes: [
                {
                    _id: "",
                    type: "",
                    parentNodeIds: [

                    ],
                    childNodeIds: [

                    ]
                }, {
                    _id: "",
                    type: "",
                    parentNodeIds: [

                    ],
                    childNodeIds: [

                    ]
                }
            ]
        },
        city4: {
            nodes: [
                {
                    _id: "",
                    type: "",
                    parentNodeIds: [

                    ],
                    childNodeIds: [

                    ]
                }, {
                    _id: "",
                    type: "",
                    parentNodeIds: [

                    ],
                    childNodeIds: [

                    ]
                }
            ]
        },
        city5: {
            nodes: [
                {
                    _id: "",
                    type: "",
                    parentNodeIds: [

                    ],
                    childNodeIds: [

                    ]
                }, {
                    _id: "",
                    type: "",
                    parentNodeIds: [

                    ],
                    childNodeIds: [

                    ]
                }
            ]
        },
        city6: {
            nodes: [
                {
                    _id: "",
                    type: "",
                    parentNodeIds: [

                    ],
                    childNodeIds: [

                    ]
                }, {
                    _id: "",
                    type: "",
                    parentNodeIds: [

                    ],
                    childNodeIds: [

                    ]
                }
            ]
        }
    }
};

var sceneGraph = {
    graphTheme1: {
        city1: {
            nodes: [
                {
                    _id: "",
                    type: "",
                    parentNodeIds: [

                    ],
                    childNodeIds: [

                    ]
                }, {
                    _id: "",
                    type: "",
                    parentNodeIds: [

                    ],
                    childNodeIds: [

                    ]
                }
            ]
        },
        city2: {
            nodes: [
                {},{} //detail excluded
            ]
        },
        city3: {
            nodes: [
                {},{} //detail excluded
            ]
        },
        city4: {
            nodes: [
                {},{} //detail excluded
            ]
        },
        city5: {
            nodes: [
                {},{} //detail excluded
            ]
        },
        city6: {
            nodes: [
                {},{} //detail excluded
            ]
        }
    },
    graphTheme2: {
        city1: {}, //detail excluded
        city2: {}, //detail excluded
        city3: {}, //detail excluded
        city4: {}, //detail excluded
        city5: {}, //detail excluded
        city6: {} //detail excluded
    },
    graphTheme3: {
        city1: {}, //detail excluded
        city2: {}, //detail excluded
        city3: {}, //detail excluded
        city4: {}, //detail excluded
        city5: {}, //detail excluded
        city6: {} //detail excluded
    }
};

var sceneGraphNodes = [
    {
        type: "root",
        _id: "graphTheme1",
        parentNodeIds: [

        ],
        childNodeIds: [
            "city1", "city2", "city3", "city4", "city5", "city6"
        ]
    }, {
        type: "city",
        _id: "city1",
        parentNodeIds: [
            "graphTheme1","graphTheme2","graphTheme3"
        ],
        childNodeIds: [
            "theme1", "theme2"
        ]
    }
];
