var express = require('express');

var app = express();

const PORT = process.env.PORT || 3000;

app.use( function( req, res, next ) {
	if( req.headers['x-forwarded-proto'] === "https") {
		res.redirect("http://" + req.hostname + req.url );
	} else {
		next();
		
	}
});

app.use( express.static('public') );

var server = app.listen( PORT, function() {
	// var port = server.address().port;
    console.log("Listening on port %s.", PORT);
} );
