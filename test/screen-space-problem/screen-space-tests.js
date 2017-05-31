/**
 * Created by Aaron on 30/05/2017.
 */
"use strict"

var _ = require('lodash');
var fs = require('fs');

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

        if(this.dimX === dimX && this.dimY === dimY) {

            // APEP element we want to add will fill this container
            var fullChildren = this.countUsedChildrenDeep();

            if(fullChildren > 0) {
                console.log("FULL CHILDREN MORE THAN 0")
            }

            return fullChildren === 0;
        }

        if(this.used) {
            return false;
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


var topA = new ScreenSpaceNode(0, 0, 32, 32);
    // topB = new ScreenSpaceNode(32, 0, 32, 32),
    // bottomA = new ScreenSpaceNode(0, 32, 32, 32),
    // bottomB = new ScreenSpaceNode(32, 32, 32, 32);


var result = topA.placeNewElement(16, 16);
console.log("result 1: offsetX: " + result.offsetX + ", offsetY: " + result.offsetY);
// console.log("result: ", result);

result = topA.placeNewElement(4,4);
console.log("result 2: offsetX: " + result.offsetX + ", offsetY: " + result.offsetY);

result = topA.placeNewElement(4,4);
console.log("result 3: offsetX: " + result.offsetX + ", offsetY: " + result.offsetY);

if(topA.canFitNewElement(16, 16)) {
    result = topA.placeNewElement(16,16);
    console.log("result 4: offsetX: " + result.offsetX + ", offsetY: " + result.offsetY);
} else {
    console.log("Cannot fit result 4");
}

if(topA.canFitNewElement(16, 16)) {
    result = topA.placeNewElement(16,16);
    console.log("result 5: offsetX: " + result.offsetX + ", offsetY: " + result.offsetY);
} else {
    console.log("Cannot fit result 5");
}


fs.writeFile('myjsonfile.json', JSON.stringify(topA), 'utf8');

// describe('ScreenSpace Testing', function () {
//
//     describe('Single Node tests', function(){
//         it('should do something', function() {
//
//         });
//     });
// });



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
