var path = require('path');

process.traceDeprecation = true;

module.exports = {
  entry: [
    './app/App.js'
  ],
  output: {
    path: __dirname,
    filename: './public/bundle.js'
  },
  resolve: {
    alias : {
      App : path.resolve( './app/App.js' ),
      Boxed : path.resolve( './app/components/Boxed.js' ),
      Motion : path.resolve( './app/components/Motion.js' ),
      Box : path.resolve( './app/components/Box.js' ),
      Vect2d : path.resolve( './app/components/Vect2d.js' ),
      QuadTree : path.resolve( './app/components/QuadTree.js' ),
      Pixeloze : path.resolve('./app/components/Pixeloze.js'),
      Pixeloze2 : path.resolve('./app/components/Pixeloze2.js'),
      Utils : path.resolve('./app/components/Utils.js'),
    },
    extensions: [ '.js', '.jsx' ]
  },
};

