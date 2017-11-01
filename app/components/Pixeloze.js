 /** 
 * @author Karol Stopyra stopyransky(at)gmail.com
 * @author www.stopyransky.com
 * @since May 5, 2015
 */ 
var Vect2d = require("Vect2d");
var Box = require("Box");
var Boxed = require("Boxed");
var QuadTree = require("QuadTree");

var Pixeloze = ( function( window ) {
    
    // var boxes = [];
    var root = {};
    var mouseBox; 

    var ORANGE, YELLOW, WHITE;
    var container;
    var updates = [];

    function setup() {

        createCanvas( window.innerWidth, window.innerHeight );
        smooth();
        frameRate( 25 );
        noStroke();
        smooth();
        textAlign( CENTER, CENTER );
        textSize( 20 );
        textFont( "Monospace", 20 );

        container = document.getElementById("defaultCanvas0");
        container.addEventListener("mouseout", mouseExited);
        container.addEventListener("mouseover", mouseEntered);

        root = new QuadTree( 0, 0, width, height, null );
        
        ORANGE = color( 255, 89,0, 255 );
        
        YELLOW = color( 255, 189, 0, 255 );
            
        WHITE = color( 255, 255, 255 );
        
        mouseBox = new Box( -100, -100, 1, 1 );
        
        
        for(var i = 0; i < 50; i++) {
            var b = new Boxed(random(width), random(height));
            // boxes[boxes.length] = b;
            root.add(b);
        }

    }

    function displayQuadTree() {
        var displayQuadTree = function(quad) {
            rect(quad.x1(), quad.y1(), quad.width(), quad.height());
        };

        stroke(120);
        fill(0, 20);
        root.traverse(displayQuadTree, true);
    }

    function displayHoverQuads () {
        var displayHoverQuads = function(quad) {
            if(quad.intersectsBox(mouseBox)) {
                rect(quad.x1(), quad.y1(), quad.width(), quad.height());
            }
        }; 
        noStroke();
        fill(0,20);
        root.traverse(displayHoverQuads, true);  
    }

    function displayQuadContent() {
        
        var displayQuadContent = function(quad) {
            var obj = quad.getValue();
            rect(obj.x1(), obj.y1(), obj.width(), obj.height());
        };

        fill(ORANGE);
        stroke(255);
        root.traverse(displayQuadContent, false);
    }

    var updateMotion = function(quad) {
        var b = quad.getValue();
        if( b ) {
            b.update();
        }
        if(quad.containsPoint(b.x(), b.y())) {

        } else {
            
            root.remove(b.x(), b.y());
            updates.push(b);
        }
    };

    function update() {

        root.traverse( applyBehaviors, false );    
        root.traverse( updateMotion, false );
        root.reset();
    }

    var applyBehaviors = function(quad) {
        var b = quad.getValue();
        if( b ) {
            b.stayWithin(root);
            var neighbours = root.getObjectsUnder(b);
            b.separate( neighbours );
        }
    };

    function draw() {
        
        update();

        background(222);
        
        displayQuadTree();

        displayHoverQuads();

        displayQuadContent();

        //show mouse position
        // stroke(0);
        // noFill();
        // ellipse(mouseBox.x(), mouseBox.y(), mouseBox.width(), mouseBox.height());
    }

    function mouseMoved() {
        mouseBox.setCenter(mouseX, mouseY);
    }

    function mouseDragged() {
        mouseMoved();
    }


    function mouseExited() {
        // console.log("exit");
        mouseBox.setCenter(-100,-100);
    }

    function mouseEntered() {
        // console.log("enter");
        mouseMoved();
    }

    return {
        setup : setup,
        draw : draw,
        mouseMoved : mouseMoved,
        mouseDragged : mouseDragged,
        // mouseEntered : mouseEntered,
        // mouseExited : mouseExited

    }


} )(window);

module.exports = Pixeloze;

