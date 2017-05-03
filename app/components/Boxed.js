var Vect2d = require("Vect2d");
var Box = require("Box");
var Motion = require("Motion");


    var Boxed = ( function() {
        
        function Boxed( _cx, _cy, opt_size, opt_data ) {

            this.size = opt_size || random( Box.MINSIZE, Box.MAXSIZE );
            
            var d = new Vect2d( this.size, this.size );
            
            Motion.call( this, _cx, _cy, d ); 

            // Boxed implementation (related to motion)
            this.immortal = false;     
            this.mutable = true;

            //this.data = new DataObject( opt_data || {} );
            // data container functionality vars 
            this.value = null;
            this.name = "";
            this.icon = null;
            this.link = "";

            // interactivity functionality vars
            this.mouseover = false;
            this.pressed = false;
            this.dragged = false;
    
        }

        Boxed.prototype = Object.assign( {
            
            constructor : Boxed,


            // INTERACTIVE implementation
            isMouseOver : function () {
                
                return this.mouseover;
                
            },

            isPressed : function () {
                
                return this.pressed;
                
            },

            isDragged : function () {
                
                return this.dragged;
                
            },

            setPressed : function ( flag ) {
                
                this.pressed = flag;
                
            },

            setDragged : function ( flag ) {
                
                this.dragged = flag;
                
            },

            // DATA CONTAINER object implementation
            setLink : function ( link ) {
                
                this.link = link;
                return this;
                
            },

            setIcon : function ( icon ) {
                
                this.icon = icon;
                return this;
                
            },

            getValue : function () {
                
                return this.value;
                
            },

            setValue : function ( val ) {
                
                this.value = val;
                if (this.value !== null)
                    this.mutable =  false ;
                else
                    this.mutable = true;
                return this;
                
            },

            getName : function () {
                return this.name;
            },

            setName : function (n) {
                
                this.name = n;
                return this;
                
            },

            // BOX implementation 
            getSize : function () {
                return this.size;
            
            },

            setSize : function ( s ) {
                this.size = s;
                this.dim.set( s, s);
                return this;
                
            },

            getPos : function () {
                return this.pos;
            },
            

            // MOTION IMPLEMENTATION
            seek : function ( vector ) {
                
                this.applyForce( Vect2d.subtract( vector, this.pos )
                        .setMag( Motion.MAXSPEED )
                        .sub( this.vel )
                        .limit( Motion.MAXFORCE )
                        );
                
            },

            avoid : function ( vector ) {
                
                this.applyForce(
                        Vect2d.subtract( this.pos, vector )
                        .setMag( Motion.MAXSPEED )
                        .sub( this.vel )
                        .limit( Motion.MAXFORCE ));
                
            },

            separate : function ( movers, rootQuad ) {
                var steer = new Vect2d();
                var count = 0;

                for (var i = 0; i < movers.length; i++) {
                    var other = movers[i];
                    var d = Vect2d.dist( this.pos, other.pos );
                    var desiredsep = ( this.size + other.size ) * 0.5;
                        //  if (d === 0) {
                        //  steer.add(Vect2d.prototype.subtract(this.pos, movers[i].pos).setMag(desiredsep));
                        //  count++;
                        //  }
                    if (d > 0 && d < desiredsep) {
                        this.immortal = true;
                        if (!other.immortal)
                            other.onImpact( rootQuad );

                        steer.add( Vect2d.subtract( this.pos, other.pos ).setMag( 1 / d ) );
                        count++;
                    }


                }
                if (count > 0) {
                    //if(!other.immortal) other.onImpact();
                    this.applyForce(steer.div(count).setMag( Motion.MAXSPEED)
                            .sub(this.vel).limit( Motion.MAXSPEED * this.size));
                } else {
                    this.immortal = false;
                    // else -> it goes away using vel set already! hence it moves !
                }


            },

            onImpact : function ( rootQuad ) {
                //console.log("onImpact()");
                if ( this.isMutable ) {
                    var n = this.size;

                    if (n > Box.MINSIZE) {
                        //console.log("this.size > 4");
                        //var p = random(1);

                        for (var i = 0; i < random(2, n * 0.5); i++) {
                            //console.log("forloop impact");
                            var bx = new Boxed(this.x() + random(1, -1), this.y() + random(1, -1), random(n * 0.5, n * 0.8));
                            bx.immortal = true;
                            rootQuad.add( bx );
                            //addons[addons.length] = bx;
                        }
                    }
                    //console.log("added");
                    //removals[removals.length]= other;
                    //removals[removals.length] = this;
                    rootQuad.remove(this.x(). this.y());
                    //boxes.remove(this);
                }
            },


            stayWithin : function ( border ) {
                var vel = this.vel;
                if (this.x1() <= border.x1()) {

                    this.vel.set(-vel.x ,vel.y).scale(0.9);;
                    //this.applyForce(new Vect2d(Boxed.MAXSPEED, vel.y)
                    //        .sub(vel).limit(Boxed.MAXFORCE));

                } else if (this.x2() >= border.x2()) {
                    this.vel.set(-vel.x,vel.y).scale(0.9);
                    // this.applyForce(new Vect2d(-Boxed.MAXSPEED, vel.y)
                    //         .sub(vel).limit(Boxed.MAXFORCE));

                } else if (this.y1() <= border.y1()) {
                    this.vel.set(vel.x,-vel.y).scale(0.9);
                    // this.applyForce(new Vect2d(vel.x, Boxed.MAXSPEED)
                    //         .sub(vel).limit(Boxed.MAXFORCE));

                } else if (this.y2() >= border.y2()) {
                    this.vel.set(vel.x,-vel.y).scale(0.9);;
                    // this.applyForce(new Vect2d(vel.x, -Boxed.MAXSPEED)
                    //         .sub(vel).limit(Boxed.MAXFORCE));

                }
            }

        }, Motion.prototype );

        return Boxed;
    } )();
    
module.exports = Boxed;