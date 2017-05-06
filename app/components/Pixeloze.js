 /** 
 * @author Karol Stopyra stopyransky(at)gmail.com
 * @author www.stopyransky.com
 * @since May 5, 2015
 */ 
var Vect2d = require("Vect2d");
var Boxed = require("Boxed");
var QuadTree = require("QuadTree");

var Pixeloze = ( function(window) {
    
    var root = {},
    boxes = [],
    addons = [],
    removals = [],
    mouseBox = {},
    active = null,
    mouseDragging = false,
    mouseoverboxed = null,
    txtSize = 11,
    w, h, br,
    assetCount = 0,
    markAssetsToReset = false,
    
    var ORANGE, YELLOW, WHITE;


function setup() {
    
    createCanvas( window.innerWidth, window.innerHeight );
    smooth();
    frameRate( 25 );
    noStroke();
    smooth();
    textAlign( CENTER, CENTER );
    textSize(txtSize);
    textFont( "Monospace", txtSize );
    
    root = new QuadTree( 0, 0, width, height, null );
    
    mouseBox = new Box( width/2, height/2 );
    
    mouseBox.setDimension( 10, 10 );
    
    for(var i = 0; i < 50; i++) {
        
        var b = new Boxed(random(width), random(height));
        
        boxes[boxes.length] = b;
    }
    
    ORANGE = color( 255, 89,0, 255 );
        
    YELLOW = color( 255, 189, 0, 255 );
        
    WHITE = color( 255, 255, 255 );
}


var passMousePress = function(quad) {
    var b = quad.getValue();
    if(b !== null && b.isMouseOver()) {
        b.setPressed(true);  
        active = b;
    }
};

var passMouseRelease = function(quad) {
    var b = quad.getValue();
    
    if(b !== null) {
        if(b.isPressed()) {
            if(!mouseDragging && b.link !== "") {
                window.open(b.link, "_blank");
            }
            b.setPressed(false);
        }
        if(b.isDragged()) {
            b.setDragged(false);
            if(b.mutable) {
                var f = Vect2d.subtract( b.getPos(), mouseBox.getPos());
                b.applyForce(f);
            }
        }
        active = null;
    }
};
var displayQuads = function(quad) {
    // if(quad.intersectsBox(mouseBox)) {
        fill(0,20);
        rect(quad.x1(), quad.y1(), quad.width(), quad.height());
    // }
};
var displayHoverQuads = function(quad) {
    if(quad.intersectsBox(mouseBox)) {
        fill(0,20);
        rect(quad.x1(), quad.y1(), quad.width(), quad.height());
    }
};

var displayContent = function(quad) {
    var v = quad.getValue();
    rect(v.x1(), v.y1(), v.width(), v.height());
};

var updateMotion = function(quad) {
    var b = quad.getValue();
    if(b !== null) {
        if(!b.mutable) return;
            b.update();
    }
};

var applyBehaviors = function(quad) {
    var val = quad.getValue();
    if(val !== null) {
            if(!val.mutable) val.stayWithin(root);
            val.separate(root.getObjectsUnder(val), addons, removals);
    }
};

function update() {
    
    //reset();
    root.traverse( applyBehaviors, false );
    root.traverse( updateMotion, false );
    
}

function draw() {
    
    update();
    
    background(255);

    noStroke();
    
    root.traverse(displayQuads, true);

    noFill();
    
    root.traverse(displayHoverQuads, false);
    
    fill(ORANGE);
    root.traverse(displayContent, false );
    
    var str = "";
    
    if(mouseoverboxed !== null) {
        if(mouseoverboxed.name === "") {
            if(!mouseDragging) {
                str = "drag to aim";
            }
        } else {
            str = "click to visit " + mouseoverboxed.name;
        }
    } else {
        if(active !== null && active.name === "") {
            str = " release to shoot";
        } else if(active === null) {
            str = "click to create new pix";
        }
    }
    
    fill(ORANGE);
    text(str, width * 0.5, height - 12);
    
    if(mouseDragging && active !== null && active.mutable) {
        stroke(255, 89,0,155);
        var m = new Vect2d(active.x(), active.y()).sub(new Vect2d(mouseX, mouseY));
        line(active.x(), active.y(), active.x() + m.x, active.y() + m.y);
        stroke(255);
        line(active.x(), active.y(), mouseX, mouseY);
        strokeWeight(5);
        point(active.x(), active.y());
        point(mouseX, mouseY);
        strokeWeight(1);
        noStroke();

    }
}

function mouseMoved() {

    mouseBox.setCenter(mouseX, mouseY);

}

function mousePressed() {

    root.traverse(passMousePress, false);
    
    if(active === null) {
        var boxed = new Boxed(mouseX+random(-1,1), 
                              mouseY+random(-1,1),
                              random(Boxed.MINSIZE, Boxed.MAXSIZE));
        boxes[boxes.length] = boxed;
        active = boxed;
    }
}

function mouseReleased() {
    root.traverse( passMouseRelease, false );
    mouseDragging = false;

}

function mouseDragged() {
    mouseMoved();
    
    if(active !== null && active.mutable) active.setDragged(true);
    
    mouseDragging = true;
}

function mouseEntered() {
    //console.log("mouseEntered");
    mouseMoved();

}

function mouseExited() {
    //console.log("mouseExited");
    mouseMoved();

}

function mouseWheel(e) {
    var scrollamt = e.detail ? e.detail * (-120) : e.wheelDelta;
    var delta = scrollamt > 0 ? 1 : scrollamt < 0 ? -1 : 0;
    if(active !== null) {
        //console.log("active is not null");
        var s = active.getSize() + delta;
        s = s > 36 ? 36 : s < 4 ? 4 : s;
        active.setSize(s);
    }
   //console.log("wheeling mouse " + delta);
    
}

function resetAssets() { // on resize
    var ct = 0;
    for( var i = 0; i < boxes.length; i++ ) {
        var b = boxes[ i ];
        if( b.getValue() !== null ) {
            ct++;
            var ww = w + br * ct;
            b.setCenter( ww, h );
            
        }
    }
    markAssetsToReset = false;
}

function reset() {
    
    root.clear();
    mouseoverboxed = null;
    
    // removing objects that had impact
    for(var i = 0; i < removals.length; i++) {
        var b = removals[i];
        var index = boxes.indexOf(b);
        boxes.splice(index, 1);
    }
    removals = [];
    
    // adding the objects created on impact
    var temp = boxes.concat(addons);
    addons = [];
    boxes = temp;
    
    for(var i = 0; i < boxes.length ; i++) {
    
        var ab = boxes[i];
        if(root.add(ab)) {
            
        } else {
            if(ab.value !== null) {
                markAssetsToReset = true;
            } else {
                removals[removals.length] = ab;
            }
        }     
    }
    
    if(markAssetsToReset) resetAssets();
}

function windowResized() {
    
    resizeCanvas(window.innerWidth, window.innerHeight);
    var oldSize = root.getDimension();
    root.resizeQuad(window.innerWidth-1, window.innerHeight-1);
    var newSize = root.getDimension();
    root.clear();
    for(var i = 0; i < boxes.length ; i++) {
        var b = boxes[i];
        var oldpos = b.getPos();
        var newposx = map(oldpos.x, 0, oldSize.x, 0, newSize.x );
        var newposy = map(oldpos.y, 0, oldSize.y, 0, newSize.y );
        b.setCenter(newposx, newposy);
        root.add(b);
    }
    textAlign( CENTER, CENTER );
    textSize(txtSize);
    textFont( "Monospace", txtSize );
}


    return {
        setup : setup,
        draw : draw,
        mouseMoved : mouseMoved,
        mouseEntered : mouseEntered,
        mouseExited : mouseExited,
        mousePressed: mousePressed,
        mouseReleased: mouseReleased,
        mouseDragged : mouseDragged,
        mouseWheel : mouseWheel,
        windowResized : windowResized,
    };

} )(window);

module.exports = Pixeloze;

