"use strict";

var _ = require('lodash');
var assert = require('chai').assert;
var chance = require('chance').Chance();
var LayoutManager = require('../../../src/js/stores/managers/layout-manager');
var LayoutComponentConstants = require('../../../src/js/constants/layout-constants').ComponentTypes;
var LayoutComponentColumns = require('../../../src/js/constants/layout-constants').ColumnTypes;
var LayoutComponentPresets = require('../../../src/js/constants/layout-constants').PresetLayouts;
var ls = require('mock-local-storage');

describe('LayoutManager', function() {

   describe('constructor', function() {

       before(function() {
           localStorage.clear();
       });

       after(function() {
           localStorage.clear();
       });

       it('should setup the default state', function() {
           var manager = new LayoutManager();

           assert(Array.isArray(manager.layout), "We have an layout array defined");
           assert(manager.cols === 30, "We have a hardcoded fix number of cols")
       });

       // APEP TODO it.should use local storage....

       it('should setup a basic layout', function() {
           var manager = new LayoutManager();

           assert(Array.isArray(manager.layout), "We have an layout array defined");

           var mediaBrowserComponent = _.filter(manager.layout, function(comp){
               return comp.type === LayoutComponentConstants.SceneMediaBrowser;
           });
           assert(Array.isArray(mediaBrowserComponent));
           assert(mediaBrowserComponent.length === 1);
       });

       it('should use the local storage layout if it exists', function() {
           var manager = new LayoutManager();
           manager.addComponent(LayoutComponentConstants.Graph);
           // APEP Hack for now, Infinity breaks it.
           _.forEach(manager.layout, function(component){
               component.y = 0;
           });
           manager.saveLayoutToLocalStorage();

           var newManager = new LayoutManager();

           assert(_.isEqual(newManager.layout, manager.layout));
       });
   });

   describe('local storage tests', function() {

       afterEach(function() {
          localStorage.clear();
       });

       it('should be able to save to local storage', function() {

           assert(localStorage.length === 0, "The local storage is empty ready for the test");

           var manager = new LayoutManager();

           assert(Array.isArray(manager.layout), "We have an layout array defined");

           manager.saveLayoutToLocalStorage();

           assert(localStorage.length === 1);
       });

       it('should be able to load from local storage', function() {
           assert(localStorage.length === 0, "The local storage is empty ready for the test");

           var manager = new LayoutManager();

           assert(Array.isArray(manager.layout), "We have an layout array defined");

           manager.addComponent(LayoutComponentConstants.Graph);

           // APEP Hack for now, Infinity breaks it.
           _.forEach(manager.layout, function(component){
              component.y = 0;
           });

           manager.saveLayoutToLocalStorage();

           assert(localStorage.length === 1);

           var layoutFromLocalStorage = manager.getLayoutFromLocalStorage();

           assert(_.isEqual(layoutFromLocalStorage, manager.layout));
       });
   });

   describe('calculateStartingPositionXForNewComponent', function() {
        it('should estimate the X position using the number of layout items added', function() {
            var manager = new LayoutManager();

            manager.layout = []; // APEP remove default added preview

            assert(manager.calculateStartingPositionXForNewComponent() === 0, "With no preview added we will always get 0");

            manager.layout.push({}); // APEP add a fake object

            assert(manager.calculateStartingPositionXForNewComponent() === 10, "Each time a component is added, we start 10 spaces later");
        });
   });

   describe('addComponent {type: "LayoutComponentConstants.ComponentTypes"}', function() {
        it('should add the component of the correct type with valid defaults', function() {
            var manager = new LayoutManager();

            manager.layout = []; // APEP remove default added preview

            manager.addComponent(LayoutComponentConstants.SceneMediaBrowser);

            assert(manager.layout.length === 1, "The layout array now stores an the newly added component");

            var component = manager.layout[0];

            assert(component.type === LayoutComponentConstants.SceneMediaBrowser, "The preview type is correct");
            assert(component.x === 0, "The preview X is correct");
            assert(component.y === Infinity, "The preview Y is correct");

            assert(component.i.length === 32, "The component has a random ID with length 32");
            assert(component.state === "default", "The preview state is default");

            assert(component.w === manager.defaultComponentWidth);
            assert(component._w === manager.defaultComponentWidth);

            assert(component.h === manager.defaultComponentHeight);
            assert(component._h === manager.defaultComponentHeight);

            assert(component.visible === true);
            assert(component.isResizable === true);
        });

        it('should add the visual gui editor with a calculated h', function() {
            var manager = new LayoutManager();

            manager.layout = []; // APEP remove default added preview

            // APEP setup the DOM size properties so we can calculate screen size specific values
            manager.gridContainerDOMClientWidth = 1280;
            manager.gridContainerDOMClientHeight = 720;
            manager.gridContainerNumberOfRows = 30;

            manager.addComponent(LayoutComponentConstants.SceneEditorGUI);

            assert(manager.layout.length === 1, "The layout array now stores an the newly added component");

            var component = manager.layout[0];

            assert(component.type === LayoutComponentConstants.SceneEditorGUI, "The preview type is correct");
            assert(component.x === 0, "The preview X is correct");
            assert(component.y === Infinity, "The preview Y is correct");

            assert(component.state === "default", "The preview state is default");

            assert(component.w === manager.defaultComponentWidth);
            assert(component._w === manager.defaultComponentWidth);

            assert(component.h !== manager.defaultComponentHeight);
            assert(component._h !== manager.defaultComponentHeight);

            assert(component.visible === true);
            assert(component.isResizable === true);
        });
   });

   describe('findNeighbours searches the layout for any component neighbouring another component', function() {

       beforeEach(function() {
            this.manager = new LayoutManager();
            this.manager.defaultComponentStartingY = 0;
            this.manager.layout = []; // APEP remove default added preview
       });

       it('should find no neighbours when no component is given to the method', function() {
            var neighbours = this.manager.findNeighbours(null, null);
            assert(Array.isArray(neighbours));
            assert(neighbours.length === 0);
       });

       it('should find no neighbours when one a single component is in the layout', function() {
           this.manager.addComponent(LayoutComponentConstants.SceneMediaBrowser);

           var neighbours = this.manager.findNeighbours(this.manager.layout[0], null);

           assert(Array.isArray(neighbours));
           assert(neighbours.length === 0);
       });

       it('should find one neighbour when connected directly LHS', function() {
           this.manager.addComponent(LayoutComponentConstants.SceneMediaBrowser);
           this.manager.addComponent(LayoutComponentConstants.SceneEditor);

           var neighbours = this.manager.findNeighbours(this.manager.layout[0], null);

           assert(Array.isArray(neighbours));
           assert(neighbours.length === 1);
           assert(neighbours[0] === this.manager.layout[1]);
       });

       it('should find one neighbours when they just overlap with second starting y just intersecting', function() {
           this.manager.addComponent(LayoutComponentConstants.SceneMediaBrowser);
           this.manager.addComponent(LayoutComponentConstants.SceneEditor);

           var secondComponent = this.manager.layout[1];
           secondComponent.y=14; //This will place it just away

           var neighbours = this.manager.findNeighbours(this.manager.layout[0], null);

           assert(Array.isArray(neighbours));
           assert(neighbours.length === 1);
           assert(neighbours[0] === this.manager.layout[1]);
       });

       it('should find one neighbours when they just overlap with second ending y just intersecting', function() {
           this.manager.addComponent(LayoutComponentConstants.SceneMediaBrowser);
           this.manager.addComponent(LayoutComponentConstants.SceneEditor);

           var firstComponent = this.manager.layout[0];
           firstComponent.y=14; //This will place it just away

           var neighbours = this.manager.findNeighbours(this.manager.layout[0], null);

           assert(Array.isArray(neighbours));
           assert(neighbours.length === 1);
           assert(neighbours[0] === this.manager.layout[1]);
       });

       it('should fine one neighbour when connected directly on the RHS column', function() {
           this.manager.addComponent(LayoutComponentConstants.SceneMediaBrowser);
           this.manager.addComponent(LayoutComponentConstants.SceneEditor);
           this.manager.addComponent(LayoutComponentConstants.GraphViewer);

           var neighbours = this.manager.findNeighbours(this.manager.layout[2], LayoutComponentColumns.RHS);

           assert(Array.isArray(neighbours));

           assert(neighbours.length === 1);
           assert(neighbours[0] === this.manager.layout[1]);
       });

       it('should find one neighbour when connected directly on RHS after collapse', function() {
           this.manager.addComponent(LayoutComponentConstants.SceneMediaBrowser);
           this.manager.addComponent(LayoutComponentConstants.SceneEditor);
           this.manager.addComponent(LayoutComponentConstants.GraphViewer);

           var rhsColumnCollapsed = this.manager.layout[2];
           var middleComponent = this.manager.layout[1];
           middleComponent.w = 19;

           rhsColumnCollapsed.x = 29;
           rhsColumnCollapsed.w = 1;

           var neighbours = this.manager.findNeighbours(rhsColumnCollapsed, LayoutComponentColumns.RHS);

           assert(neighbours.length === 1);
           assert(neighbours[0] === middleComponent);
       });
   });

   describe('findStackedLayoutItemsForGivenSide searchs the layout for preview on a specific side', function() {
       beforeEach(function() {
           this.manager = new LayoutManager();
           this.manager.defaultComponentStartingY = 0;
           this.manager.layout = []; // APEP remove default added preview
       });

       it('finds none when no items are in the layout', function() {
           assert(Array.isArray(this.manager.layout));
           assert(this.manager.layout.length === 0);

           var stackedLayoutItemsOnGivenSide = this.manager.findStackedLayoutItemsForGivenSide();

           assert(Array.isArray(stackedLayoutItemsOnGivenSide));
           assert(stackedLayoutItemsOnGivenSide.length === 0);
       });

       it('should find two when four items are added with all default values', function() {
           this.manager.addComponent(LayoutComponentConstants.SceneMediaBrowser);
           this.manager.addComponent(LayoutComponentConstants.SceneEditor);
           this.manager.addComponent(LayoutComponentConstants.Graph);
           this.manager.addComponent(LayoutComponentConstants.GraphViewer);

           var stackedLayoutItemsOnGivenSide = this.manager.findStackedLayoutItemsForGivenSide();

           assert(Array.isArray(stackedLayoutItemsOnGivenSide));
           assert(stackedLayoutItemsOnGivenSide.length === 2);
       });
   });

   describe('collapseLeft', function() {

       beforeEach(function() {
           this.manager = new LayoutManager();
           this.manager.defaultComponentStartingY = 0;
           this.manager.layout = []; // APEP remove default added preview
       });

       /*
            Test case taken from browser

            // x 0, y 0, w 7, h 12
            // x 0, y 12, w 7, h 12
            // x 7, y 0, w 10, h 15
        */
        it('should not expand the middle component when the top left hand comp is collapsed and then expand after second LHS comp is collapsed', function() {
            this.manager.addComponent(LayoutComponentConstants.SceneMediaBrowser);
            this.manager.addComponent(LayoutComponentConstants.SceneEditor);
            this.manager.addComponent(LayoutComponentConstants.Graph);

            var lhsTopComp = this.manager.layout[0];
            var lhsBottomComp = this.manager.layout[1];
            var middleComp = this.manager.layout[2];

            lhsTopComp.x = 0;
            lhsTopComp.y = 0;
            lhsTopComp.w = 7;
            lhsTopComp.h = 12;

            lhsBottomComp.x = 0;
            lhsBottomComp.y = 12;
            lhsBottomComp.w = 7;
            lhsBottomComp.h = 12;

            middleComp.x = 7;
            middleComp.y = 0;
            middleComp.w = 10;
            middleComp.h = 15;

            var allNeighboursForExpansionLhsTop = this.manager.findNeighbours(lhsTopComp);
            assert(allNeighboursForExpansionLhsTop.length === 1, "A single neighbour is found for the LHS Top Component");
            assert(allNeighboursForExpansionLhsTop[0].i === middleComp.i);

            var allNeighboursForExpansionLhsBottom = this.manager.findNeighbours(lhsBottomComp);
            assert(allNeighboursForExpansionLhsBottom.length === 1, "A single neighbour is found for the LHS Bottom Component");
            assert(allNeighboursForExpansionLhsBottom[0].i === middleComp.i);

            this.manager.collapseLeft(lhsTopComp);
            assert(middleComp.x === 7, "The middle comp is blocked from expanding because of the lhs bottom component");
            assert(lhsTopComp.x === 0, "The component for collapsing has correct x");
            assert(lhsTopComp.w === 1);

            this.manager.collapseLeft(lhsBottomComp);
            assert(middleComp.x === 1, "The middle comp is has now expanded into the space :" + middleComp.x + ", :" + 6);
            assert(middleComp.w === 16, "The middle comp is has now expanded into the space w: " + middleComp.w);

            assert(lhsBottomComp.w === 1);
            assert(lhsBottomComp.x === 0);
        });
   });

   describe('expandLeft', function() {
        beforeEach(function() {
            this.manager = new LayoutManager();
            this.manager.defaultComponentStartingY = 0;
            this.manager.layout = []; // APEP remove default added preview
        });

        it('should shrink the middle component when expanding a previously collapsed component', function() {
            this.manager.addComponent(LayoutComponentConstants.SceneMediaBrowser);
            this.manager.addComponent(LayoutComponentConstants.SceneEditor);
            this.manager.addComponent(LayoutComponentConstants.Graph);

            var lhsTopComp = this.manager.layout[0];
            var lhsBottomComp = this.manager.layout[1];
            var middleComp = this.manager.layout[2];

            lhsTopComp.x = 0;
            lhsTopComp.y = 0;
            lhsTopComp.w = 7;
            lhsTopComp.h = 12;

            lhsBottomComp.x = 0;
            lhsBottomComp.y = 12;
            lhsBottomComp.w = 7;
            lhsBottomComp.h = 12;

            middleComp.x = 7;
            middleComp.y = 0;
            middleComp.w = 10;
            middleComp.h = 15;


            this.manager.collapseLeft(lhsTopComp);
            this.manager.collapseLeft(lhsBottomComp);

            assert(middleComp.x === 1, "The middle comp is has now expanded into the space :" + middleComp.x + ", :" + 6);
            assert(middleComp.w === 16, "The middle comp is has now expanded into the space w: " + middleComp.w);

            this.manager.expandLeft(lhsTopComp);

            assert(lhsTopComp.x === 0, "LHS top expand successful x: " + middleComp.x);
            assert(lhsTopComp.w === 7, "LHS top expand successful w: " + middleComp.w);

            assert(middleComp.x === 7, "The middle comp is has now expanded to allow the component to be expanded");
            assert(middleComp.w === 10, "The middle comp is has now shrank to allow the component to be expanded");
        });
    });

   describe('collapseRight', function() {
       beforeEach(function() {
           this.manager = new LayoutManager();
           this.manager.defaultComponentStartingY = 0;
           this.manager.layout = []; // APEP remove default added preview
       });

       it('should expand the middle when the RHS comp is collapsed', function() {
           this.manager.addComponent(LayoutComponentConstants.SceneMediaBrowser);
           this.manager.addComponent(LayoutComponentConstants.SceneEditor);
           this.manager.addComponent(LayoutComponentConstants.Graph);

           var rhsComponent = this.manager.layout[2];
           var middleComponent = this.manager.layout[1];

           this.manager.collapseRight(rhsComponent);

           assert(rhsComponent.w === 1);
           assert(rhsComponent.x === 29);

           assert(middleComponent.w === 19);
           assert(middleComponent.x === 10);
       });
   });

   describe('expandRight', function() {
       beforeEach(function() {
           this.manager = new LayoutManager();
           this.manager.defaultComponentStartingY = 0;
           this.manager.layout = []; // APEP remove default added preview
       });

       it('should shrink the middle when the RHS comp is expanded', function() {
           this.manager.addComponent(LayoutComponentConstants.SceneMediaBrowser);
           this.manager.addComponent(LayoutComponentConstants.SceneEditor);
           this.manager.addComponent(LayoutComponentConstants.Graph);

           var rhsComponent = this.manager.layout[2];
           var middleComponent = this.manager.layout[1];

           this.manager.collapseRight(rhsComponent);

           assert(rhsComponent.w === 1);
           assert(rhsComponent.x === 29);

           assert(middleComponent.w === 19);
           assert(middleComponent.x === 10);

           this.manager.expandRight(rhsComponent);
           assert(rhsComponent.w === 10);
           assert(rhsComponent.x === 20);
           assert(middleComponent.x === 10);
           assert(middleComponent.w === 10, "w: "+ middleComponent.w);
       });
   });

   describe('maximise', function() {
       beforeEach(function() {
           this.manager = new LayoutManager();
           this.manager.defaultComponentStartingY = 0;
           this.manager.layout = []; // APEP remove default added preview
       });

       it('should maximise a single component, changing state, w, h and visible', function() {
           this.manager.addComponent(LayoutComponentConstants.SceneMediaBrowser);

           var comp = this.manager.layout[0];

           var expectedMaximisedW = this.manager.cols;
           var expectedMaximisedH = 20;

           this.manager.maximize(0, comp, expectedMaximisedH);

           assert(comp.state === "max");
           assert(comp.visible === true);
           assert(comp.w === expectedMaximisedW);
           assert(comp.h === expectedMaximisedH);
       });

       it('should maximise a single component, and minimise the rest (visible false)', function() {
           this.manager.addComponent(LayoutComponentConstants.SceneMediaBrowser);
           this.manager.addComponent(LayoutComponentConstants.Graph);
           this.manager.addComponent(LayoutComponentConstants.GraphViewer);

           var comp = this.manager.layout[0];
           var otherComp = this.manager.layout[1];
           var otherComp2 = this.manager.layout[1];

           this.manager.maximize(0, comp, 20);

           assert(otherComp.visible === false);
           assert(otherComp2.visible === false);
       });
   });

   describe('removeComponent', function() {
       beforeEach(function() {
           this.manager = new LayoutManager();
           this.manager.defaultComponentStartingY = 0;
           this.manager.layout = []; // APEP remove default added preview
       });

       it('should do nothing if no component is found', function() {
           this.manager.addComponent(LayoutComponentConstants.SceneMediaBrowser);

           assert(this.manager.layout.length === 1, "Setup state is correct");

           this.manager.removeComponent("fakeid");

           assert(this.manager.layout.length === 1, "We still have all items");
       });

       it('should remove a component if found', function() {
           this.manager.addComponent(LayoutComponentConstants.SceneMediaBrowser);

           assert(this.manager.layout.length === 1, "Setup state is correct");

           this.manager.removeComponent(this.manager.layout[0].i);

           assert(this.manager.layout.length === 0, "the item was removed");
       });

       it('should unhide all preview if a maximized item was removed', function() {
           this.manager.addComponent(LayoutComponentConstants.SceneMediaBrowser);
           this.manager.addComponent(LayoutComponentConstants.Graph);

           assert(this.manager.layout.length === 2, "Setup state is correct");

           var comp = this.manager.layout[0];
           var otherComp = this.manager.layout[1];

           this.manager.maximize(0, comp, 10);

           assert(comp.state === "max");
           assert(comp.visible === true);
           assert(otherComp.visible === false);

           this.manager.removeComponent(comp.i);

           assert(otherComp.visible === true);
       });
   });

   function cleanManagerLayoutOfIds(layout) {
       var cleanLayout = _.cloneDeep(layout);
       return _.map(cleanLayout, function(l){
           delete l.i;
           return l;
       });
   }

   describe('setLayoutFromPreset', function() {
       beforeEach(function() {
           this.manager = new LayoutManager();
           this.manager.defaultComponentStartingY = 0;
           this.manager.layout = []; // APEP remove default added preview
       });

       it('should add a fixed layout from the constants file', function() {
           this.manager.setLayoutFromPreset(LayoutComponentPresets.authoring.scene);
           assert(this.manager.layout.length === LayoutComponentPresets.authoring.scene.length);
           assert(_.isEqual(cleanManagerLayoutOfIds(this.manager.layout), LayoutComponentPresets.authoring.scene));
       });

       it('should ensure all the preview in the layout given are valid', function() {
           var layoutWithOldComponent = _.cloneDeep(LayoutComponentPresets.authoring.scene);

           var fakeOldComponent = {"x":15,"y":0,"w":15,"h":17,"_w":15,"_h":17,"type":"Graph-OLD","visible":true,"isResizable":true,"state":"default","moved":false,"static":false};

            layoutWithOldComponent.push(fakeOldComponent);

           this.manager.setLayoutFromPreset(layoutWithOldComponent);
           assert(this.manager.layout.length === LayoutComponentPresets.authoring.scene.length);
           assert(_.isEqual(cleanManagerLayoutOfIds(this.manager.layout), LayoutComponentPresets.authoring.scene));
       });

       it('should cloneDeep and assign new ids for the new preview', function() {

           this.manager.setLayoutFromPreset(LayoutComponentPresets.authoring.scene);

           assert(this.manager.layout.length === LayoutComponentPresets.authoring.scene.length);
           assert(_.isEqual(cleanManagerLayoutOfIds(this.manager.layout), LayoutComponentPresets.authoring.scene));

           _.forEach(this.manager.layout, function(layoutItem) {
               // APEP ensure we have an ID for each layout item
               assert(layoutItem.hasOwnProperty("i"));

               // APEP ensure they are unique (potential collision but the hat library reduces this chance)
               assert(this.manager.layout.filter(function(layoutItemForDuplicateICheck) {
                   return layoutItem.i === layoutItemForDuplicateICheck.i;
               }).length === 1);
           }.bind(this));

           _.forEach(LayoutComponentPresets.authoring.scene, function(layoutItem) {
               // APEP ensure we have not changed the preset constants
               assert(!layoutItem.hasOwnProperty("i"));
           })
       });
   });

});
