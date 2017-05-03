
var settings = {
  initialPixCount : 20,
  framerate : 30,
  pixColor : "#FF5900",
  pixColorHover : "#FFBD00",
  backgroundColor: "#eee",
  quadShade : 12,
  
}

    var SingleQuad = function(x_, y_, w_, h_, opt_parent) {
        
        // static variables
        SingleQuad.EMPTY = 0;
        SingleQuad.LEAF = 1;
        SingleQuad.POINTER = 2;
        
        // public variables
        this.x = x_ || 0;
        this.y = y_ || 0;
        this.w = w_ ;
        this.h = h_ ;
        this.parent = opt_parent || null;
        this.nw = {};
        this.ne = {};
        this.sw = {};
        this.se = {};
        this.value = null;
        this.type = SingleQuad.EMPTY;

        SingleQuad.prototype.size = function () {
            switch (this.type) {
                case SingleQuad.EMPTY:
                case SingleQuad.LEAF:
                    return 1;
                case SingleQuad.POINTER :
                    var v = 0;
                    v += this.nw.size();
                    v += this.ne.size();
                    v += this.sw.size();
                    v += this.se.size();
                    return v;
            }
        };
        
        SingleQuad.prototype.add = function (b) {

            if (!this.contains(b.x(), b.y())) {
                   return false;
            }
            switch (this.type) {
                case SingleQuad.EMPTY:
                    this.put(b);
                    return true;

                case SingleQuad.LEAF:
                    this.subdivide();
                case SingleQuad.POINTER:
                    if (this.nw.contains(b.x(), b.y()))
                        return this.nw.add(b);
                    else if (this.ne.contains(b.x(), b.y()))
                        return this.ne.add(b);
                    else if (this.sw.contains(b.x(), b.y()))
                        return this.sw.add(b);
                    else if (this.se.contains(b.x(), b.y()))
                        return this.se.add(b);
            }
        };

        SingleQuad.prototype.put = function (boxed) {
            this.value = boxed;
            this.type = SingleQuad.LEAF;
        };

        SingleQuad.prototype.subdivide = function () {
            var halfw = this.w * 0.5,
                    halfh = this.h * 0.5,
                    x = this.x,
                    y = this.y;

            this.nw = new SingleQuad(x, y, halfw, halfh, this);

            this.ne = new SingleQuad(x + halfw, y, halfw, halfh, this);

            this.sw = new SingleQuad(x, y + halfh, halfw, halfh, this);

            this.se = new SingleQuad(x + halfw, y + halfh, halfw, halfh, this);

            var b = this.value;
            this.value = null;
            this.type = SingleQuad.POINTER;

            if (this.nw.contains(b.x(), b.y())) {
                this.nw.put(b);
            } else if (this.ne.contains(b.x(), b.y())) {
                this.ne.put(b);
            } else if (this.sw.contains(b.x(), b.y())) {
                this.sw.put(b);
            } else if (this.se.contains(b.x(), b.y())) {
                this.se.put(b);
            }
        };

        SingleQuad.prototype.remove = function (boxed) {
            // not used (quad redone each frame)
        };

        SingleQuad.prototype.balance = function () {
            // not used (quad redone each frame)
        };

        SingleQuad.prototype.resizeQuad = function (w_, h_) {
            this.w = w_;
            this.h = h_;
        };

        SingleQuad.prototype.clear = function () {
            this.value = null;
            this.nw = null;
            this.ne = null;
            this.sw = null;
            this.se = null;
            this.type = SingleQuad.EMPTY;
            this.parent = null;
        };



        SingleQuad.prototype.traverse = function (f, all ) {
            // if( all ) f(this);
            if (this.type === SingleQuad.POINTER) {
                if (this.nw !== null)
                    this.nw.traverse(f);
                if (this.ne !== null)
                    this.ne.traverse(f);
                if (this.sw !== null)
                    this.sw.traverse(f);
                if (this.se !== null)
                    this.se.traverse(f);
            } else {
                f(this);
            }
        };

        SingleQuad.prototype.getObjectAt = function (xx, yy) {
            //        return this.getQuadAt(xx,yy).getValue(); // wrong
            switch (type) {
                case SingleQuad.EMPTY : { return null; }
                
                case SingleQuad.POINTER:
                {
                    if (this.nw.getObjectAt(x_, y_) !== null)
                        return nw.getObjectAt(x_, y_);
                    if (this.ne.getObjectAt(x_, y_) !== null)
                        return ne.getObjectAt(x_, y_);
                    if (this.sw.getObjectAt(x_, y_) !== null)
                        return sw.getObjectAt(x_, y_);
                    if (this.se.getObjectAt(x_, y_) !== null)
                        return se.getObjectAt(x_, y_);
                }
                
                case SingleQuad.LEAF:
                {
                    if (this.value !== null && this.value.getBox().contains(x_, y_)) {
                        return this.value;
                    }

                    return null;
                }

                default:
                    return null;

            }
        };

        SingleQuad.prototype.getQuadAt = function (xx, yy) {
            if (this.contains(xx, yy)) {
                if (this.type === SingleQuad.LEAF) {
                    return this;
                } else if (this.type === SingleQuad.POINTER) {
                    if (this.nw.contains(xx, yy))
                        return this.nw.getQuadAt(xx, yy);
                    if (this.ne.contains(xx, yy))
                        return this.ne.getQuadAt(xx, yy);
                    if (this.sw.contains(xx, yy))
                        return this.sw.getQuadAt(xx, yy);
                    if (this.se.contains(xx, yy))
                        return this.se.getQuadAt(xx, yy);
                }
            }
        };

        SingleQuad.prototype.getObjectsUnder = function (box) {
            var toUse = [];
            return this.getObjectsUnderInternal(toUse, box);
        };

        SingleQuad.prototype.getObjectsUnderInternal = function (toUse, box) {
            if (this.intersectsBoxed(box)) {
                if (this.type === SingleQuad.LEAF) {
                    toUse[toUse.length] = this.value;
                } else if (this.type === SingleQuad.POINTER) {
                    this.nw.getObjectsUnderInternal(toUse, box);
                    this.ne.getObjectsUnderInternal(toUse, box);
                    this.sw.getObjectsUnderInternal(toUse, box);
                    this.se.getObjectsUnderInternal(toUse, box);
                }
            }
            return toUse;
        };

        SingleQuad.prototype.getQuadsUnder = function (box) {
            var toUse = [];
            return this.getQuadsUnderInternal(toUse, box);
        };

        SingleQuad.prototype.getQuadsUnderInternal = function (toUse, box) {
            if (this.intersectsBoxed(box)) {
                if (this.type === SingleQuad.LEAF) {
                    toUse[toUse.length] = this;
                } else if (this.type === SingleQuad.POINTER) {
                    this.nw.getQuadsUnderInternal(toUse, box);
                    this.ne.getQuadsUnderInternal(toUse, box);
                    this.sw.getQuadsUnderInternal(toUse, box);
                    this.se.getQuadsUnderInternal(toUse, box);
                }
            }
            return toUse;
        };

        SingleQuad.prototype.getRoot = function () {
            return this.parent === null ? this : this.parent.getRoot();
        };

        SingleQuad.prototype.getValue = function () {
            return this.value;
        };

        SingleQuad.prototype.getType = function () {
            return this.type;
        };

        SingleQuad.prototype.getParent = function () {
            return this.parent;
        };

        SingleQuad.prototype.xcenter = function () {
            return this.x + this.w * 0.5;
        };

        SingleQuad.prototype.ycenter = function () {
            return this.y + this.h * 0.5;
        };

        SingleQuad.prototype.width = function () {
            return this.w;
        };

        SingleQuad.prototype.height = function () {
            return this.h;
        };

        SingleQuad.prototype.getDimension = function() {
            return new Vect2d( this.w, this.h );
        }

        SingleQuad.prototype.x1 = function () {
            return this.x;
        };

        SingleQuad.prototype.y1 = function () {
            return this.y;
        };

        SingleQuad.prototype.x2 = function () {
            return this.x + this.w;
        };

        SingleQuad.prototype.y2 = function () {
            return this.y + this.h;
        };

        SingleQuad.prototype.contains = function (xx, yy) {
            return xx >= this.x1() && yy >= this.y1() && xx <= this.x2() && yy <= this.y2();
        };

        SingleQuad.prototype.containsBoxed = function (boxed) {
            return boxed.x1() >= this.x1() && boxed.y1() >= this.y1() && boxed.x2() <= this.x2() && boxed.y2() <= this.y2();
        };

        SingleQuad.prototype.intersects = function (x1, y1, x2, y2) {
            return !(this.x2() < x1 || x2 < this.x1() || this.y2() < y1 || y2 < this.y1());
        };

        SingleQuad.prototype.intersectsBoxed = function (boxed) {
            return !(this.x2() < boxed.x1() || boxed.x2() < this.x1() || this.y2() < boxed.y1() || boxed.y2() < this.y1());
        };
    };


module.exports = SingleQuad;