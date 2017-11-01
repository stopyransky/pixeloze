var Box = require("Box");

var QuadTree = ( function () { 

    var journal = [];
    
    // static variables
    QuadTree.EMPTY = 0;
    QuadTree.LEAF = 1;
    QuadTree.POINTER = 2;
    QuadTree.OFFSET = Box.MAXSIZE * 2; // to help looking objects on border of quads
     
    var lookupBox = new Box( 0, 0, QuadTree.OFFSET, QuadTree.OFFSET );
    var needsUpdate = true;
    
    function journalAdd(box) {
        journal.push(box);
    }

    function journalRemove(box) {
        var index = journal.indexOf(box);
        if( index > -1 ) {
            journal.splice(index,1);
            return box;
        } else {
            return false;
        }
    }
    function put( quad, box ) {
        quad.value = box;
        quad.type = QuadTree.LEAF;
        journalAdd(box);
    }
    
    function clear( quad ) {
        quad.value = null;
        quad.nw = null;
        quad.ne = null;
        quad.sw = null;
        quad.se = null;
        quad.type = QuadTree.EMPTY;
        quad.parent = null;
    }    
    
    function subdivide( quad ) {
        
        var halfw = quad.width() * 0.5,
            halfh = quad.height() * 0.5,
                x = quad.x1(),
                y = quad.y1();

        quad.nw = new QuadTree( x        , y        , halfw, halfh, quad );
        quad.ne = new QuadTree( x + halfw, y        , halfw, halfh, quad );
        quad.sw = new QuadTree( x        , y + halfh, halfw, halfh, quad );
        quad.se = new QuadTree( x + halfw, y + halfh, halfw, halfh, quad );

        var b = quad.value;
        quad.value = null;
        quad.type = QuadTree.POINTER;
        var cx = b.x();
        var cy = b.y();
        
        if ( quad.nw.containsPoint( cx, cy ) ) {
            //quad.nw.add( b );
            put(quad.nw, b );
        } else if ( quad.ne.containsPoint( cx, cy ) ) {
            //quad.ne.add( b );
            put(quad.ne, b );
        } else if ( quad.sw.containsPoint( cx, cy ) ) {
            //quad.sw.add( b );
            put( quad.sw, b );
        } else if ( quad.se.containsPoint( cx, cy ) ) {
            //quad.se.add( b );
            put( quad.se, b );
        } else {
            console.log( "QuadTree.subdivide(): Failed to re-add object on subdivide. Makes quad.pointer size === 0!");
        }
        
        return true ;

    }


    function QuadTree( left_, top_, width_, height_, opt_parent ) {
        
        Box.call( this, left_, top_, width_, height_ );

        this.parent = opt_parent || null;

        this.nw = null;
        this.ne = null;
        this.sw = null;
        this.se = null;
        
        this.value = null;
        
        this.type = QuadTree.EMPTY;
    }

    QuadTree.prototype = Object.assign( Box.prototype, {
        
        getRoot : function () {
                return this.parent ? this.parent.getRoot() : this;
        },

        getValue : function() {
                return this.value;
        },

        getType : function() { 
            return this.type;
        },
        add : function(box) {
            const x = box.x();
            const y = box.y();
            
            if ( !this.containsPoint( x, y ) ) {
                   return false; // object is not within this quad borders
            }

            switch ( this.type ) {
                case QuadTree.EMPTY:
                    // console.log("adding " + box.toSource()); 
                    //this.put( box );
                    put( this, box );
                    return true;
                case QuadTree.LEAF:
                    //console.log ( "readded in subdivide: " + subdivide( this ) ) ;
                    subdivide( this );
                    //return true; //don't return here -> let case pointer to work after subdivide!
                case QuadTree.POINTER:
                    if ( this.nw.containsPoint( x, y ) )
                        return this.nw.add( box );
                    else if ( this.ne.containsPoint( x, y ) )
                        return this.ne.add( box );
                    else if (this.sw.containsPoint( x, y ) )
                        return this.sw.add( box );
                    else if (this.se.containsPoint( x, y ) )
                        return this.se.add( box );
                default : 
                    throw new Error("QuadTree.add(): not recognized quad type" + this.type);
            }
        },

        remove : function(box) {
            return journalRemove(box);
        },

        traverse : function ( fn, includeAll ) {

            switch( this.type ) {
                case QuadTree.EMPTY : 
                    if( includeAll ) fn( this );
                    break;
                case QuadTree.POINTER :
                    if( includeAll ) fn( this );
                    this.nw.traverse( fn, includeAll );
                    this.ne.traverse( fn, includeAll );
                    this.sw.traverse( fn, includeAll );
                    this.se.traverse( fn, includeAll );
                    break;
                case QuadTree.LEAF : 
                    fn( this );
                    break;
            }
        },

        reset : function () {
            var root = this.getRoot();

            clear( root );
            
            for(var i = 0; i < journal.length ; i++) {
                root.add(journal[i]);
            }
        },

        getObjectAtPosition : function( x, y ) {
                var obj = this.getQuadAt(x,y).getValue();
                if( obj ) {
                    if( obj.x() == x && obj.y() == y ) { // expects x() and y() functions to be defined in object
                        return obj;
                    }
                } else {
                    return null;
                }
     
            },
            
            getObjectAt : function ( x, y ) {
                lookupBox.setCenter( x, y );
                
                var objects = this.getObjectsUnder( lookupBox ); // leafs only
                
                for ( var i = 0; i  < objects.length; i++ ) { // need to loop returned array to see if objects there contain x y
                    var obj = objects[i]; 
                    if( obj.containsPoint( x, y ) ) {
                        return obj;
                    }
                }

                return false;


            },

            /** gets Quad at given point
                q.getQuadAt(x,y).getValue -> gives object in quad, but not necessary under x, y point.
                to get object under point(x,y ) use QuadTree.getObjectAt(x,y)
                1) var obj = getQuadAt(x,y).getValue(); obj.containsPoint(x,y) -> obj ==
                2) getObjectAt(x,y); 
             */
            getQuadAt : function( x, y ) {
                
                if( !this.containsPoint( x, y ) ) return null;
                
                switch (this.type) {
                    case QuadTree.EMPTY : 
                        return this;
                    case QuadTree.LEAF : 
                        return this;
                    case QuadTree.POINTER : {
                        if (this.nw.containsPoint(x, y))
                            return this.nw.getQuadAt(x, y);
                        if (this.ne.containsPoint(x, y))
                            return this.ne.getQuadAt(x, y);
                        if (this.sw.containsPoint(x, y))
                            return this.sw.getQuadAt(x, y);
                        if (this.se.containsPoint(x, y))
                            return this.se.getQuadAt(x, y);
                        }
                    
                    default: 
                        return null;
                }
            },

            // its actually getObjectsInsideQuadsThatAreUnderBox
            getObjectsUnder : function ( box ) {

                var toUse = [];
                
                var that = this; 
                
                function helper(that, toUse, box ) {
                    
                    if ( that.intersectsBox( box ) ) {
                        
                        switch( that.type ) {
                            
                            case QuadTree.POINTER :
                                helper(that.nw, toUse, box );
                                helper(that.ne, toUse, box );
                                helper(that.sw, toUse, box );
                                helper(that.se, toUse, box );
                                break;
                            
                            case QuadTree.LEAF: 
                                toUse[ toUse.length ] = that.value;
                                break;
                        }
                    }
                    return toUse;
                };

                return helper(that, toUse, box);
            },

            getAllObjects : function() {
                return this.getObjectsUnder( this );
            },
            
            getQuadsUnder : function ( box ) {
                
                var toUse = [];

                var that = this;

                function helper( that, toUse, box ) {
                    
                    if ( that.intersectsBox( box ) ) {
                        
                        if ( that.type === QuadTree.LEAF ) {
                            toUse[ toUse.length ] = that;
                        
                        } else if ( that.type === QuadTree.POINTER ) {

                            helper(that.nw, toUse, box);
                            helper(that.ne, toUse, box);
                            helper(that.sw, toUse, box);
                            helper(that.se, toUse, box);
                        }
                    }
                    
                    return toUse;
                };
                
                return helper(that, toUse, box );
            }
    });
    return QuadTree;

} )();


module.exports = QuadTree;