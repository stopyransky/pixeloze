   var Box = require("Box");

    var QuadTree = ( function () { 
        /* to fix 
        *  - when update() POINTER returns error (null) when checking its sub-quads
        *  - subdivide() might omit some objects to be readded to quad 
        *  - balance() pointer with zero size is 
        */
        // static variables
        QuadTree.EMPTY = 0;
        QuadTree.LEAF = 1;
        QuadTree.POINTER = 2;
        QuadTree.OFFSET = Box.MAXSIZE * 2; // to help looking objects on border of quads
         
        var lookupBox = new Box( 0, 0, QuadTree.OFFSET, QuadTree.OFFSET );
        //var toReset = [];

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
       
        // should be private 
        function clear( quad ) {
            quad.value = null;
            quad.nw = null;
            quad.ne = null;
            quad.sw = null;
            quad.se = null;
            quad.type = QuadTree.EMPTY;
            //quad.parent = null;
        }

        function put( quad, box ) {
            quad.value = box;
            quad.type = QuadTree.LEAF;
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
            
            // var readded = quad.nw.add( b ) || 
            //               quad.ne.add( b ) || 
            //               quad.sw.add( b ) || 
            //               quad.se.add( b );

            //if( !readded ) {
            //    console.log( "QuadTree.subdivide(): Failed to re-add object on subdivide. Makes quad.pointer size === 0!");
            //    //clear( quad );
            //}
            // can be due to adding to quad object with the same coordinates
            //    throw new Error("QuadTree.subdivide(): Failed to re-add object on subdivide: " + b.toSource());
            
            return true ;

            // if ( quad.nw.containsPoint( cx, cy ) ) {
            //     quad.nw.add( b );
            //     //put(quad.nw, b );
            // } else if ( quad.ne.containsPoint( cx, cy ) ) {
            //     quad.ne.add( b );
            //     //put(quad.ne, b );
            // } else if ( quad.sw.containsPoint( cx, cy ) ) {
            //     quad.sw.add( b );
            //     //put( quad.sw, b );
            // } else if ( quad.se.containsPoint( cx, cy ) ) {
            //     quad.se.add( b );
            //     //put( quad.se, b );
            // }
        }
        
        function balance( pointer ) {
            if(pointer.getSize() === 0 ) {
                // clearly error, so to fix it:
                pointer.nw = null;
                pointer.ne = null;
                pointer.sw = null;
                pointer.se = null;
                pointer.value = null;
                pointer.type = QuadTree.EMPTY;
                if (pointer.parent) {
                    return balance( pointer.parent );
                }
                return true;    
            }

            var nwType = pointer.nw.getType(),
                neType = pointer.ne.getType(),
                swType = pointer.sw.getType(),
                seType = pointer.se.getType();
            

            
            if( nwType == QuadTree.POINTER || 
                neType == QuadTree.POINTER || 
                swType == QuadTree.POINTER || 
                seType == QuadTree.POINTER ) {
                return false;
            }


            //console.log( pointer.getSize() );
            if( pointer.getSize() === 1 ) {
                
                //var b = pointer.getObjectsUnder( pointer )[ 0 ]; // wrong
                
                var b = nwType == QuadTree.LEAF ? pointer.nw.value :
                        neType == QuadTree.LEAF ? pointer.ne.value :
                        swType == QuadTree.LEAF ? pointer.sw.value :
                        seType == QuadTree.LEAF ? pointer.se.value :
                        null;

                if( b == null ) {
                    throw new Error("QuadTree.balance(): size is 1 but value is null - should not happen" );
                    // pointer it's a pointer without LEAF nodes (only EMPTY ones) - fix.
                }
                
                pointer.nw = null;
                pointer.ne = null;
                pointer.sw = null;
                pointer.se = null;
                pointer.value = b;
                pointer.type = QuadTree.LEAF;
                if (pointer.parent) {
                    return balance( pointer.parent );
                }
                return true;
            }
            if( pointer.getSize() === 0 ) {
                console.log("BUG ! pointer has zero size! " + pointer.getSize());  

            }

            return false;
        }
        

        
        function resetOnUpdate( leaf ) {
            var val = leaf.getValue();
            toReset.push( val );
            var p = leaf.parent;
            leaf.parent = null;
            clear( leaf );
            //leaf.getRoot().add( val );
            if( p ) balance( p );
            // if ( leaf.getRoot().add( val ) ) {
            //     //console.log( 're-added to root' );
            //     clear( leaf );
            //     balance( p );
            // } else {

            //     // can happen if val is out of the root borders -> how to handle?
            //     console.log( 'failed to re-add to root');
            // }

        }
         
        QuadTree.prototype = Object.assign( { 
            
            constructor : QuadTree,

            getRoot : function () {
                return this.parent == null ? this : this.parent.getRoot();
            },
            
            getValue : function() {
                return this.value;
            },

            getType : function() { 
                return this.type;
            },

            // consider add = function( x, y, obj ) {}
            add : function ( box ) {
                
                const x = box.x();
                const y = box.y();
                
                if ( !this.containsPoint( x, y ) ) {
                       return false; // object is not within this quad borders
                }
                //if( this.getObjectAtPosition( x, y ) ) {
                    // overload value = [] and push new object to the array along with existing one
                    // on update of quadtree check if position of objects are stil the same
                    // if yes keep them in array
                    // if no remove them  from array and put in proper quad
                //    return false; // object with the same coordinates already there;
                //}
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

            getSize : function() {
               
                switch( this.type ) {

                    case QuadTree.POINTER: {
                        let count = 0;
                        count += this.nw.getSize();
                        count += this.ne.getSize();
                        count += this.sw.getSize();
                        count += this.se.getSize();
                        return count;
                    };
                    case QuadTree.LEAF:
                        return 1;
                    default : 
                        return 0;
                }
            },
            
            remove : function( x, y ) {
                
                lookupBox.setCenter( x, y );
                
                var quads = this.getQuadsUnder( lookupBox ); // leafs only
                
                var quad = null;
                
                for ( var i = 0; i  < quads.length; i++ ) {
                    if( quads[i].value.containsPoint( x, y ) ) {
                        quad = quads[i];
                        break;
                    }
                }

                if( quad == null ) return false; 

                if( quad.type == QuadTree.EMPTY ) {
                    return false;
                } else {
                    //it is a leaf
                    var val = quad.value;
                    if( val.containsPoint( x, y ) ) {
                        quad.value = null;
                        quad.type = QuadTree.EMPTY;
                        if( quad.parent ) balance( quad.parent );
                        //return removed object;
                        return val;
                    }

                    return false;
                }
            },

                    // in case of moving objects
            update : function () {
                
                var toUpdate = [];
                
                var that = this;
                
                function doUpdate( q, toUpdate ) {

                    switch( q.type ) {
                        case QuadTree.POINTER: // ifs should not be needed here, but now if not checked throw error xx is null
                            if( q.nw ) 
                                doUpdate(q.nw, toUpdate );
                                //this.nw.update();
                            if( q.ne) 
                                //this.ne.update();
                                doUpdate(q.ne, toUpdate );
                            if( q.sw) 
                                //this.sw.update();
                                doUpdate(q.sw, toUpdate );
                            if( q.se) 
                                //this.se.update();
                                doUpdate(q.se, toUpdate );
                            break;
                        
                        case QuadTree.LEAF : 
                            if( !q.containsPoint( q.value.x(), q.value.y() ) )  {
                                // not within my borders! throw it up to parent
                                //resetOnUpdate( this );

                                var val = q.getValue();
                                toUpdate.push( val );
                                var p = q.parent;
                                //that.parent = null;
                                clear( q );
                                if( p ) balance( p );
                            }
                        break;
                        case QuadTree.EMPTY : 

                    }

                }

                doUpdate( that, toUpdate );

                //  re-add the ones that are not within their quads anymore
                if( toUpdate.length > 0 ) {
                    for( var i = 0; i < toUpdate.length; i++ ) {
                        var val = toUpdate[i];
                        this.add( val );
                    }
                }

            },

            /**
             *   Traverses from root quadtree to its leaves and executes fn function:
             *   - if includeAll flag is true - executes fn on every quad
             *   - if includeAll flag is false - executes fn only on LEAF quads.  
             *
             *   @param   {Function}   fn           function to execute on traversed quad
             *   @param   {[type]}     includeAll   whether or not to execute fn on all quads or only leafs.
             *
             */
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
        
        }, Box.prototype );
 

        return QuadTree;
    } )();


    module.exports = QuadTree;