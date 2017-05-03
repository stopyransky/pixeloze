var Vect2d = require("Vect2d");
var { random }  = require("Utils");

var Box = ( function() {
        
        Box.MINSIZE = 6;
        Box.MAXSIZE = 22;
        
        function Box( _left, _top, _width, _height ) {
            // this.left = _left || 0;
            // this.top = _top || 0;
            var s = random( Box.MINSIZE, Box.MAXSIZE );
            // this.w = _width || s;
            // this.h = _height || s;
            this.pos = new Vect2d( _left + _width * 0.5, _top + _height * 0.5 ) || new Vect2d();
            this.dim = new Vect2d( _width, _height ) ||  new Vect2d( s, s ); 
        }
        
        Box.prototype = {

            constructor : Box,

            // PRIMARY METHODS - work on internal variables
            setCenter : function( x , y ) {
                // this.left = x - this.w * 0.5;
                // this.top = y - this.h * 0.5;
                this.pos.set( x, y );
                return this;
            },
            
            getCenter : function() {
                //return new Vect2d( this.x(), this.y() );
                return this.pos;
            },
            

            getDimension : function() {
                //return new Vect2d( this.w, this.h ); 
                return this.dim;
            },

            setDimension : function( w, h ) {
                this.dim.set(w, h);
                return this;
            },
            
            // LEFT

            x1 : function() {
                //return this.left;
                return this.pos.x - this.dim.x * 0.5;
            },

            // TOP
            y1 : function() {
                //return this.top;
                return this.pos.y - this.dim.y * 0.5;
            },

            // computed CENTER X
            x : function() {
                //return this.left + this.w * 0.5;
                return this.pos.x;
            },

            // computed CENTER Y 
            y : function() { 
                //return this.top + this.h * 0.5;
                return this.pos.y;
            },

            // computed RIGHT edge
            x2 : function() {
                //return this.left + this.w;
                return this.pos.x + this.dim.x * 0.5;
            },

            // computed BOTTOM edge
            y2 : function() { 
                //return this.top + this.h;
                return this.pos.y + this.dim.y * 0.5;
            },
            
            // WIDTH
            width : function() {
                //return this.w;
                return this.dim.x;
            },

            // HEIGHT
            height : function() {
                //return this.h;
                return this.dim.y;
            },

            // SECONDARY METHODS - work on primary methods
            
            left : function() { 
                return this.x1();
            },

            top : function() {
                return this.y1();
            },

            bottom : function() {
                return this.y2();
            },

            right : function() {
                return this.x2();
            },
            
            intersects : function ( x1, y1, x2, y2 ) {
                
                return !( this.x2() < x1 || 
                          x2 < this.x1() || 
                          this.y2() < y1 || 
                          y2 < this.y1() );    
            },
           
            intersectsBox : function ( box ) {
                
                return !( this.x2() < box.x1() || 
                          box.x2() < this.x1() || 
                          this.y2() < box.y1() || 
                          box.y2() < this.y1() );
                  
            },
          
            containsPoint : function ( xx, yy ) {
                
                return xx >= this.x1() && 
                       yy >= this.y1() && 
                       xx <= this.x2() && 
                       yy <= this.y2();
               
            },
            
            contains : function( x1, y1, x2, y2 ) {
                return x1 >= this.x1() && 
                       y1 >= this.y1() && 
                       x2 <= this.x2() && 
                       y2 <= this.y2();
            },
            
            containsBox : function( box ) {
                return box.x1() >= this.x1() && 
                       box.y1() >= this.y1() && 
                       box.x2() <= this.x2() && 
                       box.y2() <= this.y2();
            }
        }

        return Box;    
    } )();

    module.exports = Box;