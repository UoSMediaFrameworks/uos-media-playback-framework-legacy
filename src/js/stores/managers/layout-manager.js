"use strict";

var _ = require('lodash');
var hat = require('hat');
var ReactGridUtils = require('react-grid-layout').utils;
var LayoutComponentColumns = require('../../constants/layout-constants').ColumnTypes;
var LayoutComponentConstants = require('../../constants/layout-constants').ComponentTypes;
var PresetLayouts = require('../../constants/layout-constants').PresetLayouts;

class LayoutManager {
    constructor() {
        // APEP TODO set initial state
        this.layout = [];
        this.cols = 30;

        this.defaultComponentWidth = this.cols/3;
        this.defaultComponentHeight = 15;

        // APEP specified so we can adjust.
        this.defaultComponentStartingY = Infinity;

        // APEP store some DOM state, we dont have an API to retrieve these values and they might change over time so we have to allow the component to update us via the grid store and a view action.
        this.gridContainerDOMClientHeight = 0;
        this.gridContainerDOMClientWidth = 0;
        this.gridContainerNumberOfRows = 0;

        var loadedLayout = this.getLayoutFromLocalStorage();
        //25/09/18 AP: This will make sure first time users get the default layout as the key containing the layouts do not exist in local storage
        if(loadedLayout === undefined){
            //layout not present in localstorage so load default.
            this.layout = this.ensureValidComponents(this.loadPreset(PresetLayouts.default));
        }
        else if (loadedLayout.length < 1) {
            this.layout = [];
        } else {
            this.layout = this.ensureValidComponents(loadedLayout);
        }

    }

    setLayoutFromPreset(layout) {
        // APEP clone and validate so we have a fresh copy of a preset layout
        var newLayout = this.ensureValidComponents(_.cloneDeep(layout));

        // APEP we must assign layout component ids to render (react requirement)
        this.layout = _.map(newLayout, function(layoutComponent) {
            layoutComponent["i"] = hat().toString();
            return layoutComponent;
        });
    }

    ensureValidComponents(unsafeLayout) {
        var safeLayout = [];
        unsafeLayout.forEach(LayoutComponent => {

            //check component type exists in constants and add it to the safe layout
            Object.keys(LayoutComponentConstants).forEach(function(key) {
                if (LayoutComponentConstants[key] == LayoutComponent.type) {
                  safeLayout.push(LayoutComponent);
                }
            });

        });
        return safeLayout;
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
        this.saveLayoutToLocalStorage();
    }

    collapseRight(component) {
        // APEP find all neighbours this is required before we change the size
        var allNeighboursForExpansion = this.findNeighbours(component, LayoutComponentColumns.RHS);

        var item = _.find(this.layout, function (layoutItem) {
            return layoutItem.i === component.i;
        });
        item.state = "collapsed-right";
        item._w = item.w;
        item.w = 1;
        item.x = (this.cols - item.w);
        item.isResizable = false;

        this.expandNeighboursAfterCollapse(item._w - 1, allNeighboursForExpansion, LayoutComponentColumns.RHS);
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
        // APEP find all neighbours this is required before we change the size
        var allNeighboursForShrinkage = this.findNeighbours(component, LayoutComponentColumns.RHS);

        var item = _.find(this.layout, function (layoutItem) {
            return layoutItem.i === component.i;
        });
        item.state = "default";
        item.w = item._w;
        item.x = (this.cols - item._w);
        item.isResizable = true;

        // APEP we must strink or move neighbours before we expand
        this.strinkNeighboursAfterExpandOfCollapsedComponent(item.w - 1, allNeighboursForShrinkage, LayoutComponentColumns.RHS);
    }

    calculateStartingPositionXForNewComponent() {
        // APEP TODO look at the strategy of placing new items added to the screen.  Looks more like a best effort than actually calculated?
        // APEP makes assumption that the default size has been kept per element.

        return this.layout.length * 10 % this.cols;
    }

    // APEP the visual editor whats about 550px + 10px = elementHeightPlusMargin
    calculateMinimumHeightForNewComponent(type, numberOfCols) {
        if(this.gridContainerDOMClientHeight === 0 || this.gridContainerNumberOfRows === 0) {
            return this.defaultComponentHeight;
        }

        if(type === LayoutComponentConstants.SceneEditorGUI) {
            // APEP calculate the approximate width of the component
            var gridItemContainerWidth = numberOfCols * (this.gridContainerDOMClientWidth / this.cols);

            // APEP given how the component is styled, a padding of 56% is used to create the height (1 / 1.8 = 56%)
            var widthToHeightRatio = 1.8;

            // APEP using a fixed aspect ratio, we can devise the elements height using an aspect ratio and the known calculation used for the width of the component.
            var elementHeight = gridItemContainerWidth / widthToHeightRatio;

            var elementHeightPlusMargin = elementHeight + 10;
            var rowHeightPlusMargin = this.gridContainerDOMClientHeight / this.gridContainerNumberOfRows;
            return Math.floor(elementHeightPlusMargin / rowHeightPlusMargin);
        }

        return this.defaultComponentHeight;
    }

    addComponent(type) {
        var componentHeight = this.calculateMinimumHeightForNewComponent(type, this.defaultComponentWidth);

        var newComponent = {
            i: hat().toString(),
            // APEP x, y grid starting position
            x: this.calculateStartingPositionXForNewComponent(),
            y: this.defaultComponentStartingY,

            // APEP size of component
            w: this.defaultComponentWidth,
            h: componentHeight,

            // APEP cached size of component
            _w: this.defaultComponentWidth,
            _h: componentHeight,

            type: type,
            visible: true,
            isResizable: true,
            state: "default"
        };

        // APEP this needs more work, if we wish to set the minH, we need to hook into window events and change this value as it will be needed to be changed.
        /*if(type === LayoutComponentConstants.SceneEditorGUI) {
            newComponent.minH = componentHeight;
        }*/

        this.layout.push(newComponent);
    }

    removeComponent(id) {
        var comp = _.find(this.layout, function(c){return c.i === id;});
        var shouldEnableOtherComponents = comp ? comp.state === "max" : false; // APEP if the component was maximized we should unhide items

        if(comp) {
            this.layout.splice(_.indexOf(this.layout, comp),1);
        }

        if(shouldEnableOtherComponents) {
            _.each(this.layout, function (layoutItem) {
                layoutItem.visible = true;
            });
        }
    };

    // APEP static method
    getLayoutFromLocalStorage() {
        var parsedLayout = JSON.parse(localStorage.getItem('layout'));
        if(parsedLayout === undefined || parsedLayout === null){
            return undefined;
        }
        else if (parsedLayout.length < 1) {
            return [];
        } else {
            // APEP TODO Values of Infinity get converted to nulls in local storage.  Must write test to fix
            return parsedLayout;
        }
    }

    loadPreset(presetLayout) {
        //layouts are saved without id so we need to add one back in when loading presets.
        presetLayout.forEach(item => {
            item.i = hat().toString();
        });
        return presetLayout;
    }

    // APEP TODO Ask why in a save to local storage are we also applying a delta to our state.
    saveLayoutToLocalStorage() {
        _.each(this.layout, function (item) {
            if (item.state === "default") {
                item._w = item.w;
                item._h = item.h;
            }
        });
        localStorage.setItem("layout", JSON.stringify(this.layout))
    }

    findNeighbours(component, leftOrRightColumn) {

        if(component === null) {
            return [];
        }

        var compStartRowScanY = component.y;
        var compEndRowScanY = component.y + component.h;

        // APEP scan for preview that intersect with this row
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

            if (leftOrRightColumn === LayoutComponentColumns.RHS)
                return comp.x + comp.w === component.x;
            else
                return component.x + component.w === comp.x;
        });

    }

    // APEP TODO maybe remove - currently only used in the testing environment
    findStackedLayoutItemsForGivenSide(leftOrRight) {
        return _.filter(this.layout, function(comp) {
            // APEP TODO using leftOrRightColumn adjust this logic
            return comp.x === 0;
        });
    }

    expandNeighboursAfterCollapse(changeInX, allNeighboursForExpansion, leftOrRightColumn) {
        var self = this;

        _.forEach(allNeighboursForExpansion, function(neighbour) {

            // APEP remove the neighbour from the layout so it can't collide with itself
            var layoutMinusNeighbour = _.cloneDeep(self.layout);

            _.remove(layoutMinusNeighbour, function(comp) { return comp.i === neighbour.i});

            var neighbourClone = _.cloneDeep(neighbour);

            if(leftOrRightColumn === LayoutComponentColumns.RHS) {
                neighbourClone.w += changeInX;
            } else {
                neighbourClone.x -= changeInX;
                neighbourClone.w += changeInX;
            }

            // APEP Search for collisions for the new candidate size of the neighbour
            var collisions = _.filter(layoutMinusNeighbour, function(component){
                return ReactGridUtils.collides(component, neighbourClone);
            });

            // APEP with no collision we can expand the neighbour into the newly vacated space
            if(collisions.length === 0) {
                if(leftOrRightColumn === LayoutComponentColumns.RHS) {
                    neighbour.w += changeInX;
                } else {
                    neighbour.x -= changeInX;
                    neighbour.w += changeInX;
                }
            }
        });
    }

    strinkNeighboursAfterExpandOfCollapsedComponent(changeInX, allNeighboursForStrinkage, leftOrRightColumn) {
        var self = this;

        _.forEach(allNeighboursForStrinkage, function(neighbour) {

            // APEP remove the neighbour from the layout so it can't collide with itself
            var layoutMinusNeighbour = _.cloneDeep(self.layout);

            _.remove(layoutMinusNeighbour, function(comp) { return comp.i === neighbour.i});

            var neighbourClone = _.cloneDeep(neighbour);

            if(leftOrRightColumn === LayoutComponentColumns.RHS) {
                neighbourClone.w -= changeInX;
            } else {
                neighbourClone.x += changeInX;
                neighbourClone.w -= changeInX;
            }

            if(neighbourClone.w >= 2) {
                // APEP if we meet minimum requirements we resize
                if(leftOrRightColumn === LayoutComponentColumns.RHS) {
                    neighbour.w -= changeInX;
                } else {
                    neighbour.x += changeInX;
                    neighbour.w -= changeInX;
                }
            }
        });
    }
}

module.exports = LayoutManager;
