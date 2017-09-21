"use strict";

var _ = require('lodash');
var assert = require('chai').assert;
var chance = require('chance').Chance();
var LayoutManager = require('../../../src/js/stores/managers/layout-manager');
var LayoutComponentConstants = require('../../../src/js/constants/layout-constants').ComponentTypes;

describe('LayoutManager', function() {
   describe('constructor', function() {

       it('should setup the default state', function() {
           var manager = new LayoutManager();

           assert(Array.isArray(manager.layout), "We have an empty array");
           assert(manager.cols === 30, "We have a hardcoded fix number of cols")
       });

       // APEP TODO it.should use local storage....
   });

   describe('calculateStartingPositionXForNewComponent', function() {
        it('should estimate the X position using the number of layout items added', function() {
            var manager = new LayoutManager();

            assert(manager.calculateStartingPositionXForNewComponent() === 0, "With no components added we will always get 0");

            manager.layout.push({}); // APEP add a fake object

            assert(manager.calculateStartingPositionXForNewComponent() === 10, "Each time a component is added, we start 10 spaces later");
        });
   });

   describe('addComponent {type: "LayoutComponentConstants.ComponentTypes"}', function() {
        it('should add the component of the correct type with valid defaults', function() {
            var manager = new LayoutManager();

            manager.addComponent(LayoutComponentConstants.SceneMediaBrowser);

            assert(manager.layout.length === 1, "The layout array now stores an the newly added component");

            var component = manager.layout[0];

            assert(component.type === LayoutComponentConstants.SceneMediaBrowser, "The components type is correct");
            assert(component.x === 0, "The components X is correct");
            assert(component.y === Infinity, "The components Y is correct");

            assert(component.i.length === 32, "The component has a random ID with length 32");
            assert(component.state === "default", "The components state is default");

            assert(component.w === manager.defaultComponentWidth);
            assert(component._w === manager.defaultComponentWidth);

            assert(component.h === manager.defaultComponentHeight);
            assert(component._h === manager.defaultComponentHeight);

            assert(component.visible === true);
            assert(component.isResizable === true);
        });
   });

   describe('findNeighbours searches the layout for any component neighbouring another component', function() {

       beforeEach(function() {
            this.manager = new LayoutManager();
            this.manager.defaultComponentStartingY = 0;
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

       it('should find one neighbour when connected directly', function() {
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
   });

   describe('findStackedLayoutItemsForGivenSide searchs the layout for components on a specific side', function() {
       beforeEach(function() {
           this.manager = new LayoutManager();
           this.manager.defaultComponentStartingY = 0;
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
       });

       /*
            Test case taken from browser

            // x 0, y 0, w 7, h 12
            // x 0, y 12, w 7, h 12
            // x 7, y 0, w 10, h 15
        */
        it('should not collapse the middle component when the top left hand comp is collapsed', function() {
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

});
