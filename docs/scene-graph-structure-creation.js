/**
 * Created by aaronphillips on 12/07/2016.
 */

//Two hand crafted scenes with a number of scenes
var scenes = [
    {
        'name': name,
        'maximumOnScreen': {
            'image': 3,
            'text': 1,
            'video': 1,
            'audio': 1
        },
        'displayDuration': 10,
        'displayInterval': 3,
        'transitionDuration': 1.4,
        'themes': {
            "ThemeArt": ",,",
            "ThemeGreat": ",,",
            "ThemeBikes": ",,",
            "ThemeDisruption": ",,",
            "ThemeHappy": ",,",
            "ThemeGraduation": ",,"
        },
        'style': {
            'backgroundColor': 'black'
        },
        'scene': []
    },{
        'name': name,
        'maximumOnScreen': {
            'image': 3,
            'text': 1,
            'video': 1,
            'audio': 1
        },
        'displayDuration': 10,
        'displayInterval': 3,
        'transitionDuration': 1.4,
        'themes': {
            "ThemeRainy": ",,",
            "ThemeGreen": ",,",
            "ThemeBusy": ",,",
            "ThemeTrams": ",,",
            "ThemeCars": ",,",
            "ThemeHappy": ",,"
        },
        'style': {
            'backgroundColor': 'black'
        },
        'scene': []
    }
];

//Full union of themes from scenes
var fullThemesFromScenes = [
    "ThemeArt","ThemeGreat","ThemeRainy","ThemeBikes","ThemeGreen","ThemeTrams","ThemeDisruption","ThemeHappy","ThemeBusy","ThemeGraduation","ThemeCars"
];

//Union of themes with excludes (to mimic user excluding a theme) [ ThemeGraduation, ThemeCars ] excluded
var themesFromScenesWithExcludes = [
    "ThemeArt","ThemeGreat","ThemeRainy","ThemeBikes","ThemeGreen","ThemeTrams","ThemeDisruption","ThemeHappy","ThemeBusy"
];


//Basics of structure for the scene graph - in the implementation more state is required such as the scene list that was used to generate the sceneGraph
var sceneGraph = {
    city: {
        chicago: {
            "ThemeArt": {
                "ThemePainting": {

                },
                "ThemePublicAttractions": {
                    "ThemeGallery": {

                    }
                }
            },
            "ThemeGreat": {}
        },
        manchester: {
            "ThemeArt": {},
            "ThemeRainy": {}
        }
    },
    movement: {
        chicago: {
            "ThemeBikes": {

            },
            "ThemeGreen": {
                "ThemeElectricBus": {

                }
            }
        },
        manchester: {
            "ThemeTrams": {

            },
            "ThemeDisruption": {

            }
        }
    },
    people: {
        chicago: {
            "ThemeHappy": {}
        },
        manchester: {
            "ThemeBusy": {}
        }
    }
};

//Purely a place holder for a theme node
var emptyThemeNode = {
    type: "Theme",
    id: "",
    name: "",
    parentRelationshipIds: [],
    childRelationshipIds: []
};

//Purely a place holder for a scene node
var emptySceneNode = {
    type: "Scene",
    id: "",
    name: "",
    parentRelationshipIds: [],
    childRelationshipIds: []
};

//OPTION 1: The output nodes we can give to D3 - Each theme is parented to a city node,
// these city nodes are children of each of the graphThemes - this may hide the connection of the child of the city node to which graph theme they are to be applied too.
// I think OPTION 2 may be more ideal - will discuss
var sceneGraphNodesWithSingleCityNodes = [
    {
        type: "Scene",
        id: "Scene2",
        name: "Scene2",
        parentRelationshipIds: [
            "ThemeRainy",
            "ThemeGreen",
            "ThemeBusy",
            "ThemeTrams",
            "ThemeCars",
            "ThemeHappy"
        ],
        childRelationshipIds: []
    },
    {
        type: "Scene",
        id: "Scene1",
        name: "Scene1",
        parentRelationshipIds: [
            "ThemeArt",
            "ThemeGreat",
            "ThemeBikes",
            "ThemeDisruption",
            "ThemeHappy",
            "ThemeGraduation"
        ],
        childRelationshipIds: []
    },
    {
        type: "Theme",
        id: "ThemeBusy",
        name: "ThemeBusy",
        parentRelationshipIds: [
            "ManchesterCity"
        ],
        childRelationshipIds: []
    },
    {
        type: "Theme",
        id: "ThemeHappy",
        name: "ThemeHappy",
        parentRelationshipIds: [
            "ChicagoCity"
        ],
        childRelationshipIds: []
    },
    {
        type: "Theme",
        id: "ThemeDisruption",
        name: "ThemeDisruption",
        parentRelationshipIds: [
            "ManchesterCity"
        ],
        childRelationshipIds: []
    },
    {
        type: "Theme",
        id: "ThemeTrams",
        name: "ThemeTrams",
        parentRelationshipIds: [
            "ManchesterCity"
        ],
        childRelationshipIds: []
    },
    {
        type: "Theme",
        id: "ThemeElectricBus",
        name: "ThemeElectricBus",
        parentRelationshipIds: [
            "ThemeGreen"
        ],
        childRelationshipIds: []
    },
    {
        type: "Theme",
        id: "ThemeGreen",
        name: "ThemeGreen",
        parentRelationshipIds: [
            "ChicagoCity"
        ],
        childRelationshipIds: [
            "ThemeElectricBus"
        ]
    },
    {
        type: "Theme",
        id: "ThemeBikes",
        name: "ThemeBikes",
        parentRelationshipIds: [
            "ChicagoCity"
        ],
        childRelationshipIds: []
    },
    {
        type: "Theme",
        id: "ThemeRainy",
        name: "ThemeRainy",
        parentRelationshipIds: [
            "ManchesterCity"
        ],
        childRelationshipIds: []
    },
    {
        type: "Theme",
        id: "ThemeGallery",
        name: "ThemeGallery",
        parentRelationshipIds: [
            "ThemePublicAttractions"
        ],
        childRelationshipIds: []
    },
    {
        type: "Theme",
        id: "ThemePublicAttractions",
        name: "ThemePublicAttractions",
        parentRelationshipIds: [
            "ThemeArt"
        ],
        childRelationshipIds: [
            "ThemeGallery"
        ]
    },
    {
        type: "Theme",
        id: "ThemePainting",
        name: "ThemePainting",
        parentRelationshipIds: [
            "ThemeArt"
        ],
        childRelationshipIds: []
    },
    {
        type: "Theme",
        id: "ThemeArt",
        name: "ThemeArt",
        parentRelationshipIds: [
            "ChicagoCity", "ManchesterCity"
        ],
        childRelationshipIds: [
            "ThemePainting", "ThemePublicAttractions"
        ]
    },
    {
        type: "City",
        _id: "ManchesterCity",
        name: "Manchester,",
        parentRelationshipIds: [
            "GraphThemeCity", "GraphThemePeople", "GraphThemeMovement"
        ],
        childRelationshipIds: []
    },
    {
        type: "City",
        _id: "ChicagoCity",
        name: "Chicago,",
        parentRelationshipIds: [
            "GraphThemeCity", "GraphThemePeople", "GraphThemeMovement"
        ],
        childRelationshipIds: []
    },
    {
        type: "root", //could also be called GraphTheme
        _id: "GraphThemeCity",
        name: "City",
        parentRelationshipIds: [],
        childRelationshipIds: []
    },
    {
        type: "root", //could also be called GraphTheme
        _id: "GraphThemePeople",
        name: "People",
        parentRelationshipIds: [],
        childRelationshipIds: []
    },
    {
        type: "root", //could also be called GraphTheme
        _id: "GraphThemeMovement",
        name: "Movement",
        parentRelationshipIds: [],
        childRelationshipIds: []
    }
];


//OPTION 2 - Scene Graph nodes with unique city nodes per graph theme
var sceneGraphNodesWithUniqueCityForEachGraphTheme = [
    {
        type: "Theme",
        id: "ThemeBusy",
        name: "ThemeBusy",
        parentRelationshipIds: [
            "PeopleManchesterCity"
        ],
        childRelationshipIds: []
    },
    {
        type: "Theme",
        id: "ThemeHappy",
        name: "ThemeHappy",
        parentRelationshipIds: [
            "PeopleChicagoCity"
        ],
        childRelationshipIds: []
    },
    {
        type: "Theme",
        id: "ThemeDisruption",
        name: "ThemeDisruption",
        parentRelationshipIds: [
            "MovementManchesterCity"
        ],
        childRelationshipIds: []
    },
    {
        type: "Theme",
        id: "ThemeTrams",
        name: "ThemeTrams",
        parentRelationshipIds: [
            "MovementManchesterCity"
        ],
        childRelationshipIds: []
    },
    {
        type: "Theme",
        id: "ThemeElectricBus",
        name: "ThemeElectricBus",
        parentRelationshipIds: [
            "ThemeGreen"
        ],
        childRelationshipIds: []
    },
    {
        type: "Theme",
        id: "ThemeGreen",
        name: "ThemeGreen",
        parentRelationshipIds: [
            "MovementChicagoCity"
        ],
        childRelationshipIds: [
            "ThemeElectricBus"
        ]
    },
    {
        type: "Theme",
        id: "ThemeBikes",
        name: "ThemeBikes",
        parentRelationshipIds: [
            "MovementChicagoCity"
        ],
        childRelationshipIds: []
    },
    {
        type: "Theme",
        id: "ThemeRainy",
        name: "ThemeRainy",
        parentRelationshipIds: [
            "CityManchesterCity"
        ],
        childRelationshipIds: []
    },
    {
        type: "Theme",
        id: "ThemeGallery",
        name: "ThemeGallery",
        parentRelationshipIds: [
            "ThemePublicAttractions"
        ],
        childRelationshipIds: []
    },
    {
        type: "Theme",
        id: "ThemePublicAttractions",
        name: "ThemePublicAttractions",
        parentRelationshipIds: [
            "ThemeArt"
        ],
        childRelationshipIds: [
            "ThemeGallery"
        ]
    },
    {
        type: "Theme",
        id: "ThemePainting",
        name: "ThemePainting",
        parentRelationshipIds: [
            "ThemeArt"
        ],
        childRelationshipIds: []
    },
    {
        type: "Theme",
        id: "ThemeArt",
        name: "ThemeArt",
        parentRelationshipIds: [
            "CityChicagoCity", "CityManchesterCity"
        ],
        childRelationshipIds: [
            "ThemePainting", "ThemePublicAttractions"
        ]
    },
    //graph theme 1
    {
        type: "City",
        _id: "CityManchesterCity",
        name: "Manchester,",
        parentRelationshipIds: [
            "GraphThemeCity", "GraphThemePeople", "GraphThemeMovement"
        ],
        childRelationshipIds: []
    },
    {
        type: "City",
        _id: "CityChicagoCity",
        name: "Chicago,",
        parentRelationshipIds: [
            "GraphThemeCity", "GraphThemePeople", "GraphThemeMovement"
        ],
        childRelationshipIds: []
    },
    //graph theme 2
    {
        type: "City",
        _id: "PeopleManchesterCity",
        name: "Manchester,",
        parentRelationshipIds: [
            "GraphThemeCity", "GraphThemePeople", "GraphThemeMovement"
        ],
        childRelationshipIds: []
    },
    {
        type: "City",
        _id: "PeopleChicagoCity",
        name: "Chicago,",
        parentRelationshipIds: [
            "GraphThemeCity", "GraphThemePeople", "GraphThemeMovement"
        ],
        childRelationshipIds: []
    },
    //graph theme 3
    {
        type: "City",
        _id: "MovementManchesterCity",
        name: "Manchester,",
        parentRelationshipIds: [
            "GraphThemeCity", "GraphThemePeople", "GraphThemeMovement"
        ],
        childRelationshipIds: []
    },
    {
        type: "City",
        _id: "MovementChicagoCity",
        name: "Chicago,",
        parentRelationshipIds: [
            "GraphThemeCity", "GraphThemePeople", "GraphThemeMovement"
        ],
        childRelationshipIds: []
    },
    {
        type: "root", //could also be called GraphTheme
        _id: "GraphThemeCity",
        name: "City",
        parentRelationshipIds: [],
        childRelationshipIds: []
    },
    {
        type: "root", //could also be called GraphTheme
        _id: "GraphThemePeople",
        name: "People",
        parentRelationshipIds: [],
        childRelationshipIds: []
    },
    {
        type: "root", //could also be called GraphTheme
        _id: "GraphThemeMovement",
        name: "Movement",
        parentRelationshipIds: [],
        childRelationshipIds: []
    }
];



//CREATED FROM SCRIPT

var nodes = [ { _id: 'city',
    name: 'city',
    parentRelationshipIds: [],
    childrenRelationshIds: [] },
    { _id: 'ThemePainting',
        name: 'ThemePainting',
        parentRelationshipIds: [ 'ThemeArt' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeGallery',
        name: 'ThemeGallery',
        parentRelationshipIds: [ 'ThemePublicAttractions' ],
        childrenRelationshIds: [] },
    { _id: 'ThemePublicAttractions',
        name: 'ThemePublicAttractions',
        parentRelationshipIds: [ 'ThemeArt' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeArt',
        name: 'ThemeArt',
        parentRelationshipIds: [ 'chicago' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeGreat',
        name: 'ThemeGreat',
        parentRelationshipIds: [ 'chicago' ],
        childrenRelationshIds: [] },
    { _id: 'chicago',
        name: 'chicago',
        parentRelationshipIds: [ 'city' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeArt',
        name: 'ThemeArt',
        parentRelationshipIds: [ 'manchester' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeRainy',
        name: 'ThemeRainy',
        parentRelationshipIds: [ 'manchester' ],
        childrenRelationshIds: [] },
    { _id: 'manchester',
        name: 'manchester',
        parentRelationshipIds: [ 'city' ],
        childrenRelationshIds: [] },
    { _id: 'movement',
        name: 'movement',
        parentRelationshipIds: [],
        childrenRelationshIds: [] },
    { _id: 'ThemeBikes',
        name: 'ThemeBikes',
        parentRelationshipIds: [ 'chicago' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeElectricBus',
        name: 'ThemeElectricBus',
        parentRelationshipIds: [ 'ThemeGreen' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeGreen',
        name: 'ThemeGreen',
        parentRelationshipIds: [ 'chicago' ],
        childrenRelationshIds: [] },
    { _id: 'chicago',
        name: 'chicago',
        parentRelationshipIds: [ 'movement' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeTrams',
        name: 'ThemeTrams',
        parentRelationshipIds: [ 'manchester' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeDisruption',
        name: 'ThemeDisruption',
        parentRelationshipIds: [ 'manchester' ],
        childrenRelationshIds: [] },
    { _id: 'manchester',
        name: 'manchester',
        parentRelationshipIds: [ 'movement' ],
        childrenRelationshIds: [] },
    { _id: 'people',
        name: 'people',
        parentRelationshipIds: [],
        childrenRelationshIds: [] },
    { _id: 'ThemeHappy',
        name: 'ThemeHappy',
        parentRelationshipIds: [ 'chicago' ],
        childrenRelationshIds: [] },
    { _id: 'chicago',
        name: 'chicago',
        parentRelationshipIds: [ 'people' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeBusy',
        name: 'ThemeBusy',
        parentRelationshipIds: [ 'manchester' ],
        childrenRelationshIds: [] },
    { _id: 'manchester',
        name: 'manchester',
        parentRelationshipIds: [ 'people' ],
        childrenRelationshIds: [] } ]

var deduped =  [ { _id: 'city',
    name: 'city',
    parentRelationshipIds: [],
    childrenRelationshIds: [] },
    { _id: 'ThemePainting',
        name: 'ThemePainting',
        parentRelationshipIds: [ 'ThemeArt' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeGallery',
        name: 'ThemeGallery',
        parentRelationshipIds: [ 'ThemePublicAttractions' ],
        childrenRelationshIds: [] },
    { _id: 'ThemePublicAttractions',
        name: 'ThemePublicAttractions',
        parentRelationshipIds: [ 'ThemeArt' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeArt',
        name: 'ThemeArt',
        parentRelationshipIds: [ 'chicago' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeGreat',
        name: 'ThemeGreat',
        parentRelationshipIds: [ 'chicago' ],
        childrenRelationshIds: [] },
    { _id: 'chicago',
        name: 'chicago',
        parentRelationshipIds: [ 'city' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeArt',
        name: 'ThemeArt',
        parentRelationshipIds: [ 'manchester' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeRainy',
        name: 'ThemeRainy',
        parentRelationshipIds: [ 'manchester' ],
        childrenRelationshIds: [] },
    { _id: 'manchester',
        name: 'manchester',
        parentRelationshipIds: [ 'city' ],
        childrenRelationshIds: [] },
    { _id: 'movement',
        name: 'movement',
        parentRelationshipIds: [],
        childrenRelationshIds: [] },
    { _id: 'ThemeBikes',
        name: 'ThemeBikes',
        parentRelationshipIds: [ 'chicago' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeElectricBus',
        name: 'ThemeElectricBus',
        parentRelationshipIds: [ 'ThemeGreen' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeGreen',
        name: 'ThemeGreen',
        parentRelationshipIds: [ 'chicago' ],
        childrenRelationshIds: [] },
    { _id: 'chicago',
        name: 'chicago',
        parentRelationshipIds: [ 'movement' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeTrams',
        name: 'ThemeTrams',
        parentRelationshipIds: [ 'manchester' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeDisruption',
        name: 'ThemeDisruption',
        parentRelationshipIds: [ 'manchester' ],
        childrenRelationshIds: [] },
    { _id: 'manchester',
        name: 'manchester',
        parentRelationshipIds: [ 'movement' ],
        childrenRelationshIds: [] },
    { _id: 'people',
        name: 'people',
        parentRelationshipIds: [],
        childrenRelationshIds: [] },
    { _id: 'ThemeHappy',
        name: 'ThemeHappy',
        parentRelationshipIds: [ 'chicago' ],
        childrenRelationshIds: [] },
    { _id: 'chicago',
        name: 'chicago',
        parentRelationshipIds: [ 'people' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeBusy',
        name: 'ThemeBusy',
        parentRelationshipIds: [ 'manchester' ],
        childrenRelationshIds: [] },
    { _id: 'manchester',
        name: 'manchester',
        parentRelationshipIds: [ 'people' ],
        childrenRelationshIds: [] } ]


var fullyUnique =  [ { _id: 'city',
    name: 'city',
    parentRelationshipIds: [],
    childrenRelationshIds: [] },
    { _id: 'ThemePainting',
        name: 'ThemePainting',
        parentRelationshipIds: [ 'ThemeArt' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeGallery',
        name: 'ThemeGallery',
        parentRelationshipIds: [ 'ThemePublicAttractions' ],
        childrenRelationshIds: [] },
    { _id: 'ThemePublicAttractions',
        name: 'ThemePublicAttractions',
        parentRelationshipIds: [ 'ThemeArt' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeArt',
        name: 'ThemeArt',
        parentRelationshipIds: [ 'chicago', 'manchester' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeGreat',
        name: 'ThemeGreat',
        parentRelationshipIds: [ 'chicago' ],
        childrenRelationshIds: [] },
    { _id: 'chicago',
        name: 'chicago',
        parentRelationshipIds: [ 'city', 'movement', 'people' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeRainy',
        name: 'ThemeRainy',
        parentRelationshipIds: [ 'manchester' ],
        childrenRelationshIds: [] },
    { _id: 'manchester',
        name: 'manchester',
        parentRelationshipIds: [ 'city', 'movement', 'people' ],
        childrenRelationshIds: [] },
    { _id: 'movement',
        name: 'movement',
        parentRelationshipIds: [],
        childrenRelationshIds: [] },
    { _id: 'ThemeBikes',
        name: 'ThemeBikes',
        parentRelationshipIds: [ 'chicago' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeElectricBus',
        name: 'ThemeElectricBus',
        parentRelationshipIds: [ 'ThemeGreen' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeGreen',
        name: 'ThemeGreen',
        parentRelationshipIds: [ 'chicago' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeTrams',
        name: 'ThemeTrams',
        parentRelationshipIds: [ 'manchester' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeDisruption',
        name: 'ThemeDisruption',
        parentRelationshipIds: [ 'manchester' ],
        childrenRelationshIds: [] },
    { _id: 'people',
        name: 'people',
        parentRelationshipIds: [],
        childrenRelationshIds: [] },
    { _id: 'ThemeHappy',
        name: 'ThemeHappy',
        parentRelationshipIds: [ 'chicago' ],
        childrenRelationshIds: [] },
    { _id: 'ThemeBusy',
        name: 'ThemeBusy',
        parentRelationshipIds: [ 'manchester' ],
        childrenRelationshIds: [] } ]

