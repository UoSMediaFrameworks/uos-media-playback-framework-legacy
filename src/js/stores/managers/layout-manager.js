"use strict";

var _ = require('lodash');
var hat = require('hat');
var ReactGridUtils = require('react-grid-layout').utils;

class LayoutManager {
    constructor() {
        // APEP TODO set initial state
        this.layout = [];
        this.cols = 30;

        this.defaultComponentWidth = this.cols/3;
        this.defaultComponentHeight = 15;

        // APEP specified so we can adjust.
        this.defaultComponentStartingY = Infinity;
    }

    minimize(index, component) {
        var item = _.find(this.layout, function (layoutItem) {
            return layoutItem.i == component.i;
        });
        item.w = 1;
        item.h = 1;
        item.visible = false;

        var newItemId = hat().toString();

        var newItem = {
            i: newItemId,
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            _w: item._w,
            _h: item._h,
            type: item.type,
            visible: false
        };
        var lay = this.layout;
        lay[index] = newItem;
        this.layout = lay;
    }

    maximize(index, component, maxHeight) {
        _.each(this.layout, function (layoutItem) {
            layoutItem.visible = false;
        });
        var item = _.find(this.layout, function (layoutItem) {
            return layoutItem.i === component.i;
        });
        item.w = this.cols;
        item.h = maxHeight;
        item.state = "max";
        item.visible = true;
    }

    restore(index, component) {
        _.each(this.layout, function (layoutItem) {
            layoutItem.visible = true;
        });
        var item = _.find(this.layout, function (layoutItem) {
            return layoutItem.i === component.i;
        });
        item.w = item._w;
        item.h = item._h;
        item.state = "default";
    }

    collapseLeft(component) {

        // APEP find all neighbours this is required before we change the size
        var allNeighboursForExpansion = this.findNeighbours(component);

        var item = _.find(this.layout, function (layoutItem) {
            return layoutItem.i === component.i;
        });
        item.state = "collapsed-left";
        item._w = item.w;
        item.w = 1;
        item.isResizable = false;

        this.expandNeighboursAfterCollapse(item._w - 1, allNeighboursForExpansion);
    }

    setLayout(layout) {
        this.layout = layout;
    }

    collapseRight(component) {
        var item = _.find(this.layout, function (layoutItem) {
            return layoutItem.i === component.i;
        });
        item.state = "collapsed-right";
        item._w = item.w;
        item.w = 1;
        item.x = (this.cols - item.w);
        item.isResizable = false;
    }

    expandLeft(component) {

        // APEP find all neighbours this is required before we change the size
        var allNeighboursForShrinkage = this.findNeighbours(component);

        var item = _.find(this.layout, function (layoutItem) {
            return layoutItem.i === component.i;
        });
        item.state = "default";
        item.w = item._w;
        item.isResizable = true;

        // APEP we must strink or move neighbours before we expand
        this.strinkNeighboursAfterExpandOfCollapsedComponent(item.w - 1, allNeighboursForShrinkage);
    }

    expandRight(component) {
        var item = _.find(this.layout, function (layoutItem) {
            return layoutItem.i === component.i;
        });
        item.state = "default";
        item.w = item._w;
        item.x = (this.cols - item._w);
        item.isResizable = true;
    }

    calculateStartingPositionXForNewComponent() {
        // APEP TODO look at the strategy of placing new items added to the screen.  Looks more like a best effort than actually calculated?
        // APEP makes assumption that the default size has been kept per element.

        return this.layout.length * 10 % this.cols;
    }

    addComponent(type) {
        this.layout.push({
            i: hat().toString(),
            // APEP x, y grid starting position
            x: this.calculateStartingPositionXForNewComponent(),
            y: this.defaultComponentStartingY,

            // APEP size of component
            w: this.defaultComponentWidth,
            h: this.defaultComponentHeight,

            // APEP cached size of component
            _w: this.defaultComponentWidth,
            _h: this.defaultComponentHeight,

            type: type,
            visible: true,
            isResizable: true,
            state: "default"
        });
    }

    removeComponent(id) {
        var self = this;
        self.layout.splice(
            _.indexOf(self.layout,
                _.findWhere(self.layout,
                    {i: id})),
            1);
    };

    getLayoutFromLocalStorage() {
        var parsedLayout = JSON.parse(localStorage.getItem('layout')) || [];
        if (parsedLayout.length < 1) {
            return [];
        } else {
            return parsedLayout;
        }
    }

    saveLayoutToLocalStorage(newLayout) {
        // APEP TODO Ask why in a save to local storage are we also applying a delta to our state.
        _.each(newLayout, function (item) {
            if (item.state === "default") {
                item._w = item.w;
                item._h = item.h;
            }
        });
        this.layout = newLayout;
        localStorage.setItem("layout", JSON.stringify(newLayout))
    }

    findNeighbours(component, leftOrRightColumn) {

        if(component === null) {
            return [];
        }

        var compStartRowScanY = component.y;
        var compEndRowScanY = component.y + component.h;

        // APEP scan for components that intersect with this row
        var componentsIntersectingWithRowScan = _.filter(this.layout, function(comp){

            var compTopCollision = comp.y === compStartRowScanY || ((comp.y > compStartRowScanY) && (comp.y < compEndRowScanY));

            var compBottomCollision = (comp.y + comp.h) === compEndRowScanY || (((comp.y + comp.h) > compStartRowScanY) && ((comp.y + comp.h) < compEndRowScanY));

            var compCompleteMatch = (comp.y === compStartRowScanY) && ((comp.y + comp.h) === compEndRowScanY);

            // APEP if the comp is a complete match y,h wise, it's a match
            // APEP else we look if the top or bottom of a comp is causing a y,h collision
            return compCompleteMatch || (compTopCollision || compBottomCollision);
        });

        // Then confirm if the x is correct and we have a match
        return _.filter(componentsIntersectingWithRowScan, function(comp) {

            // APEP TODO using leftOrRightColumn adjust this logic
            return component.x + component.w === comp.x;
        });

    }

    // APEP TODO maybe remove
    findStackedLayoutItemsForGivenSide(leftOrRight) {
        return _.filter(this.layout, function(comp) {
            // APEP TODO using leftOrRightColumn adjust this logic
            return comp.x === 0;
        });
    }

    expandNeighboursAfterCollapse(changeInX, allNeighboursForExpansion) {
        var self = this;

        _.forEach(allNeighboursForExpansion, function(neighbour) {

            // APEP remove the neighbour from the layout so it can't collide with itself
            var layoutMinusNeighbour = _.cloneDeep(self.layout);

            _.remove(layoutMinusNeighbour, function(comp) { return comp.i === neighbour.i});

            var neighbourClone = _.cloneDeep(neighbour);
            neighbourClone.x -= changeInX;
            neighbourClone.w += changeInX;

            // APEP Search for collisions for the new candidate size of the neighbour
            var collisions = _.filter(layoutMinusNeighbour, function(component){
                return ReactGridUtils.collides(component, neighbourClone);
            });

            // APEP with no collision we can expand the neighbour into the newly vacated space
            if(collisions.length === 0) {
                neighbour.x -= changeInX;
                neighbour.w += changeInX;
            }
        });
    }

    strinkNeighboursAfterExpandOfCollapsedComponent(changeInX, allNeighboursForStrinkage) {
        var self = this;

        _.forEach(allNeighboursForStrinkage, function(neighbour) {

            // APEP remove the neighbour from the layout so it can't collide with itself
            var layoutMinusNeighbour = _.cloneDeep(self.layout);

            _.remove(layoutMinusNeighbour, function(comp) { return comp.i === neighbour.i});

            var neighbourClone = _.cloneDeep(neighbour);
            neighbourClone.x += changeInX;
            neighbourClone.w -= changeInX;

            if(neighbourClone.w >= 2) {
                // APEP if we meet minimum requirements we resize
                neighbour.x += changeInX;
                neighbour.w -= changeInX;
            } else {
                // APEP else we must move it to a free space
            }
        });
    }
}

module.exports = LayoutManager;
