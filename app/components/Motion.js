    var Vect2d = require("Vect2d");
    var Box = require("Box");

    var Motion = ( function() { 


        //Motion.IDLE = 1; // able to move but not affected by any forces (velocity = 0)
        //Motion.MOVING = 2; // is moving currently
        Motion.MAXSPEED = 20;
        Motion.MAXFORCE = 0.95;
        Motion.FRICTION = 0.998; // environmental setting should be set somewhere else
        
        function Motion( _cx, _cy, _dim, _mass ) {

            Box.call( this, _cx - _dim.x * 0.5, _cy - _dim.x * 0.5, _dim.x, _dim.y );
            
            //this.position = _pos || new Vect2d();
            this.vel = new Vect2d();
            this.acc = new Vect2d();
            this.mass = _mass || 1;
            //this.state = Motion.IDLE;
            this.movable = true;

            Object.defineProperty( this, "isMoving", {
                get : function() { 
                    return !this.vel.isZero();
                }
            });

        }

        
        Motion.prototype = Object.assign( Box.prototype, {
            
            constructor : Motion,
            
            update : function() {
                if( this.movable ) {
                    this.vel.add( this.acc );
                    this.acc.scale( 0 );
                    this.vel.scale( Motion.FRICTION );
                    this.vel.clamp( Motion.MAXSPEED ); // makes vel to be 0 to MAXSPEED, small numbers are clamped to 0.
                    if( this.isMoving ) { // if magnitudesq of velocity is larger than very small EPSILON number
                        //this.state = Motion.MOVING;
                        this.pos.add( this.vel );
                    } 
                    //else {
                        //this.state = Motion.IDLE; 
                    //}
                }
                
                
            },

            setMovable : function( flag ) {
                this.movable = flag;
                if( !this.movable ) {
                    this.acc.scale( 0 );
                    this.vel.scale( 0 );
                    this.state = Motion.IDLE;
                }
            },
            
            applyForce : function( force ) {
                if( this.movable ) { 
                    force.div( this.mass );
                    this.acc.add( force );
                    this.acc.clamp( Motion.MAXFORCE );
                }
            }
        } );

        return Motion;
    } )();


    module.exports = Motion;