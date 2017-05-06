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

    function setup() {

        createCanvas( window.innerWidth, window.innerHeight );
        smooth();
        frameRate( 25 );
        noStroke();
        smooth();
        textAlign( CENTER, CENTER );
        textSize( 20 );
        textFont( "Monospace", 20 );
        root = new QuadTree( 0, 0, width, height, null );
        
        ORANGE = color( 255, 89,0, 255 );
        
        YELLOW = color( 255, 189, 0, 255 );
            
        WHITE = color( 255, 255, 255 );
        
        mouseBox = new Box( width/2, height/2, 10, 10 );
        
        
        for(var i = 0; i < 50; i++) {
            var b = new Boxed(random(width), random(height));
            // boxes[boxes.length] = b;
            root.add(b);
        }

    }




    var displayQuadTree = function(quad) {

        rect(quad.x1(), quad.y1(), quad.width(), quad.height());
    };

    var displayHoverQuads = function(quad) {
        if(quad.intersectsBox(mouseBox)) {
            rect(quad.x1(), quad.y1(), quad.width(), quad.height());
        }
    };

    var displayQuadContent = function(quad) {
        var obj = quad.getValue();

        rect(obj.x1(), obj.y1(), obj.width(), obj.height());
    };
    
    function draw() {
        background(222);
        
        stroke(120);
        fill(0, 20);
        root.traverse(displayQuadTree, true);

        noStroke();
        fill(0,20);
        root.traverse(displayHoverQuads, true);

        fill(ORANGE);
        noStroke();
        root.traverse(displayQuadContent, false);


        stroke(0);
        noFill();
        ellipse(mouseBox.x(), mouseBox.y(), mouseBox.width(), mouseBox.height());


    }

    function mouseMoved() {
        mouseBox.setCenter(mouseX, mouseY);
    }

    function mouseDragged() {
        mouseMoved();
    }

    return {
        setup : setup,
        draw : draw,
        mouseMoved : mouseMoved,
        mouseDragged : mouseDragged
    }


} )(window);

module.exports = Pixeloze;

