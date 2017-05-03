
    var Vect2d = ( function() {
        
        function Vect2d( x, y ) {
            this.x = x || 0.0;
            this.y = y || 0.0;
        }    
        
        Vect2d.subtract = function (v1, v2) {
            return new Vect2d(v1.x - v2.x, v1.y - v2.y);
        };

        Vect2d.dist = function (v1, v2) {
            const dx = v1.x - v2.x;
            const dy = v1.y - v2.y;
            return Math.sqrt(dx * dx + dy * dy);
        };

        Vect2d.distSq = function (v1, v2) {
            const dx = v1.x - v2.x;
            const dy = v1.y - v2.y;
            return dx * dx + dy * dy;
        };

        Vect2d.prototype =  { 
            
            constructor : Vect2d,
            
            set : function( x_, y_ ) {
                this.x = x_;
                this.y = y_;
                return this;
            }, 
            
            add : function( v ) {
                this.x += v.x;
                this.y += v.y;
                return this;                
            },
            
            sub : function (v) {
                this.x -= v.x;
                this.y -= v.y;
                return this;
            },
            
            mult : function (v) {
                this.x *= v.x;
                this.y *= v.y;
                return this;
            },
            
            scale : function (num) {
                this.x *= num;
                this.y *= num;
                return this;
            },
            
            div : function (num) {
                this.x /= num;
                this.y /= num;
                return this;
            },
            
            mag : function () {
                return Math.sqrt(this.x * this.x + this.y * this.y);
            },
            
            magSq : function () {
                return this.x * this.x + this.y * this.y;
            },
            
            theta : function () {
                return Math.atan2( this.y, this.x );
            },

            normalize : function () {
                var m = this.mag();
                if (m > 1)
                    this.div( m );
                return this;
            },
            
            setMag : function ( len ) {
                this.normalize();
                this.scale( len );
                return this;
            },
            
            limit : function (max) {
                return this.magSq() > max * max ? 
                       this.setMag( max ) : this;
            },
            
            isZero : function(){
                return this.magSq() < Number.EPSILON;
            },
            
            clamp : function ( max ) {
                return this.isZero() ? this.scale( 0 ) : this.limit( max );
            },

            equals : function( v ) {
                return  ( ( v.x === 0 || v.x ) ? 
                            ( ( v.y === 0 || v.y ) ? 
                                ( (this.x === 0 || this.x ) ? 
                                    ( (this.y === 0 || this.y ) ? 
                                        Vect2d.subtract( this, v ).isZero() : 
                                    false ) :
                                false ) : 
                            false ) : 
                        false );
            }
        };

        return Vect2d;
    } )();


    module.exports = Vect2d;