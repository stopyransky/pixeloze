// random int between min(inclusive) and max (inclusive)
function randomInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


// random int from 0 to value( exclusive )
// array[random(array.length)] works fine;
function random(val) {
	return Math.floor(Math.random() * val);
}


function pickRandomFrom(array) {

	return array[random(array.length)];
}

module.exports = {
	randomInterval  : randomInterval,
	random : random,
	pickRandomFrom : pickRandomFrom
}