/**
 * Created by Aaron on 30/05/2017.
 */
"use strict"

var _ = require('lodash');
var fs = require('fs');
var assert = require('assert');

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class ScreenSpaceNode {

    /**
     * @param offsetX - total x offset from position in space
     * @param offsetY - total y offset from position in space
     * @param dimX - size of node x
     * @param dimY - size of node y
     */
    constructor(offsetX, offsetY, dimX, dimY) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.dimX = dimX;
        this.dimY = dimY;
        this.children = [];
        this.used = false;

        var childDimX = dimX / 2;
        var childDimY = dimY / 2;

        if(childDimX >= 4 && childDimY >= 4) {
            this.children.push(new ScreenSpaceNode(offsetX, offsetY, childDimX, childDimY));
            this.children.push(new ScreenSpaceNode(offsetX + childDimX, offsetY, childDimX, childDimY));
            this.children.push(new ScreenSpaceNode(offsetX, offsetY + childDimY, childDimX, childDimY));
            this.children.push(new ScreenSpaceNode(offsetX + childDimY, offsetY + childDimY, childDimX, childDimY));
        }
    }

    simpleData() {
        return "offsetX: " + this.offsetX + ", offsetY: " + this.offsetY + ", dim: " + this.dimX;
    }

    printClean() {
        console.log(this.simpleData());
    }

    getDeepChildren() {
        var childs = [];
        _.forEach(this.children, function(child){
            childs.push(child);

            if(child.children.length > 0) {
                childs = childs.concat(child.getDeepChildren());
            }
        });

        return childs;
    }

    countUsedChildrenDeep() {
        var deepChildren = this.getDeepChildren();
        var counts = _.filter(deepChildren, function(child) {
            return child.used;
        });
        return counts.length;
    }

    /**
     * Simple bool to allow the node to know if new element can fit in
     * @param dimX
     * @param dimY
     */
    canFitNewElement(dimX, dimY) {

        if(this.used) {
            return false;
        }

        if(this.dimX === dimX && this.dimY === dimY) {

            // APEP element we want to add will fill this container
            var fullChildren = this.countUsedChildrenDeep();

            if(fullChildren > 0) {
                console.log("FULL CHILDREN MORE THAN 0")
            }

            return fullChildren === 0;
        }

        // APEP OK so the dim of new element is too small lets try the children and allow recursion to fix
        // APEP while in development I'm going to count the number of children that can fit the element.
        var childrenAnswers =_.filter(this.children, function(child){
             return child.canFitNewElement(dimX, dimY) ? 1 : 0
        });

        return childrenAnswers.length > 0;
    }

    placeNewElement(dimX, dimY) {

        var found = false;
        var answer = undefined;

        function recurse(node) {

            if( (node.dimX === dimX && node.dimY === dimY) && !node.used) {
                console.log("this square is being used");

                // APEP we can take this space
                node.used = true;

                found = true;

                answer = node;
            }

            for(var i = 0; i < node.children.length; i++) {
                var child = node.children[i];
                if(child.canFitNewElement(dimX, dimY)) {
                    recurse(child);
                    if(found) {
                        break;
                    }
                }
            }

        }

        recurse(this);

        return answer
    }
}

describe('ScreenSpace Testing', function () {

    describe('Single Node tests', function(){
        it('An empty 32x32 node can place a single 32x32 element and no others', function() {
            var ssNode = new ScreenSpaceNode(0, 0, 32, 32);
            assert.equal(ssNode.canFitNewElement(32,32), true, "For an empty 32 by 32 node, we can fit one");
            var nodeResult = ssNode.placeNewElement(32, 32);
            assert.equal(ssNode.used, true);
            assert.equal(ssNode.canFitNewElement(32,32), false, "For a full node, the same dim node cannot be fit");
            assert.equal(ssNode.canFitNewElement(16,16), false, "For a node used by a full size element, a child size cannot be fit");
            assert.equal(ssNode.canFitNewElement(8,8), false, "For a node used by a full size element, a child size cannot be fit");
            assert.equal(ssNode.canFitNewElement(4,4), false, "For a node used by a full size element, a child size cannot be fit");
        });

        it("An empty 32x32 node can contain 4 16x16 nodes and no others", function() {
            var ssNode = new ScreenSpaceNode(0, 0, 32, 32);

            assert.equal(ssNode.canFitNewElement(16,16), true, "");
            ssNode.placeNewElement(16, 16);

            assert.equal(ssNode.canFitNewElement(16,16), true, "");
            ssNode.placeNewElement(16, 16);

            assert.equal(ssNode.canFitNewElement(16,16), true, "");
            ssNode.placeNewElement(16, 16);

            assert.equal(ssNode.canFitNewElement(16,16), true, "");
            ssNode.placeNewElement(16, 16);

            assert.equal(ssNode.canFitNewElement(16,16), false, "");
        });

        it("An empty 32x32 node can contain 64 4x4 nodes and no others", function() {
            var ssNode = new ScreenSpaceNode(0, 0, 32, 32);

            for(var i = 0; i < 64; i++) {
                assert.equal(ssNode.canFitNewElement(4,4), true, "");
                ssNode.placeNewElement(4,4);
            }

            assert.equal(ssNode.canFitNewElement(32,32), false, "");
            assert.equal(ssNode.canFitNewElement(16,16), false, "");
            assert.equal(ssNode.canFitNewElement(8,8), false, "");
            assert.equal(ssNode.canFitNewElement(4,4), false, "");
        });

        // APEP TODO write some tests for randomness and implement
    });
});

// APEP BELOW WORKS BEFORE RANDOMISATION - IE PICKS FIRST AVAILABLE
//
// placeNewElement(dimX, dimY) {
//
//     var found = false;
//     var answer = undefined;
//
//     function recurse(node) {
//
//         if( (node.dimX === dimX && node.dimY === dimY) && !node.used) {
//             console.log("this square is being used");
//
//             // APEP we can take this space
//             node.used = true;
//
//             found = true;
//
//             answer = node;
//         }
//
//         for(var i = 0; i < node.children.length; i++) {
//             var child = node.children[i];
//             if(child.canFitNewElement(dimX, dimY)) {
//                 recurse(child);
//                 if(found) {
//                     break;
//                 }
//             }
//         }
//
//     }
//
//     recurse(this);
//
//     return answer
// }

class Vector2 {

    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    static identity() {
        return new Vector2(0, 0);
    }

    print() {
        console.log("Vector2 x: " + this.x + ", y: " + this.y);
    }
}

describe("Vector2", function() {
    describe("Constructor Tests", function() {
        it("A vector2 can be defined with the x,y values can be retrieved", function() {
            var vecTest = new Vector2(5,10);
            assert.equal(vecTest.x, 5);
            assert.equal(vecTest.y, 10);
        });

        it("A vector2 can be defined with no params leading to Vector2.identity", function() {
            var vecTest = new Vector2();
            assert.equal(vecTest.x, 0);
            assert.equal(vecTest.y, 0);
        });

        it("static .identity provides a new instance with 0, 0", function() {
            var vecTest = Vector2.identity();
            assert.equal(vecTest.x, 0);
            assert.equal(vecTest.y, 0);
        });

    });
});

class ScreenSpaceManager {


    constructor(vecScreenDim) {
        this._screenSpaceNodeDim = new Vector2(32, 32);
        this.vecScreenDim = vecScreenDim;
        // APEP a list if a pretty poor data structure choice for this problem, however, I'll keep it for now
        this.nodes = [];
        this._growScreenSpaceNodesTopLeftRowsThenColumns();
    }

    // APEP We could make optional the ability to grow the space nodes around the centre point or top,bottom,left,right
    _growScreenSpaceNodesTopLeftRowsThenColumns() {
        var xCols = this.vecScreenDim.x / this._screenSpaceNodeDim.x;
        var yCols = Math.floor(this.vecScreenDim.y / this._screenSpaceNodeDim.y);

        this._screenSpaceNodeDim.print();
        this.vecScreenDim.print();

        for(var y = 0; y < yCols; y++) {
            for(var x = 0; x < xCols; x++) {
                this.nodes.push(new ScreenSpaceNode(x * this._screenSpaceNodeDim.x, y * this._screenSpaceNodeDim.y, this._screenSpaceNodeDim.x, this._screenSpaceNodeDim.y));
            }
        }
    }

    // proportion of X, Y
    getStaticPosition(globalOffsetX, globalOffsetY) {

        // APEP allow static positions to be used or searched

    }

    searchRegionNearNode(node, regionScope) {

        // APEP given node, use regionScope (int or vector) to grow out a region in which we search through out data structure for nodes

        return [];
    }

    // APEP helper function to find nodes that
    getNodesNeighbours(node) {

        return [];
    }

    // APEP helper function for finding nodes
    getNode(offsetX, offsetY) {
        return _.find(this.nodes, function(node){
           return node.offsetX === offsetX && node.offsetY;
        });
    }

}

describe("ScreenSpaceManager", function() {
    describe("Constructor tests", function() {
        it("Given a screen dimension, the space will be divided into a matrix style data structure full of screen space nodes", function() {
            var ssManager = new ScreenSpaceManager(new Vector2(64,32));
            assert.equal(ssManager.nodes.length, 2, "2 32x32 nodes should be placeble");
        });

        it("Given a screen dimension, 2 rows of 2 columns should be created", function() {
            var ssManager = new ScreenSpaceManager(new Vector2(64,64));
            assert.equal(ssManager.nodes.length, 4, "4 32x32 nodes should be placeble");
        });

        it("Given a 1080p screen size, the space will result in 1980 32x32 nodes", function() {
            var ssManager = new ScreenSpaceManager(new Vector2(1920, 1080));
            assert.equal(ssManager.nodes.length, 1980);
        });
    });

    describe("searchRegionNearNode tests", function() {
        it("Given a manager with a 10x10 grid setup, we can search for the 9 top left nodes, given the node for test is correctly picked", function() {
            var ssManager = new ScreenSpaceManager(new Vector2(320, 320));
            var knownNodeForSearch = ssManager.getNode(32, 32);
            assert.equal(ssManager.searchRegionNearNode(knownNodeForSearch, 1).length, 9);
        });
    });

    describe("getNodesNeighbours tests", function() {
        it("Given a manager with a 10x10 grid setup, we can search the neighbours (4) of a node, given the node is not an outer node", function() {
            var ssManager = new ScreenSpaceManager(new Vector2(320, 320));
            var knownNodeForSearch = ssManager.getNode(32, 32);
            assert.equal(ssManager.getNodesNeighbours(knownNodeForSearch).length, 4);
        });
    });
});
