// Jan 1st 1970 00:00:00 AM (UTC) (or the unix epic)
// a timestamp of 0 represent the above
// positive timestamps are later than the unix epic. negative timestamps are earlier than the unix epic

// e.g. -1000 would represent Dec 31st 1969 11:59:59 PM (aka 1 second in the past)

// recap, we generate timestamps like this
// new Date().getTime();

// var date = new Date();
// console.log(date.getMonth()); // 0 - 11 (jan - dec)
// there is no built in way to get the name of the month. one dirty workaround is to create an array of strings with the name of the month. but that's a hassle. 

// this is where the library called Moment comes in. It's pretty much the only lib of its kind and is considered universally as the go-to lib for working with time in JS
// npm i moment --save 

const moment = require('moment');
var date = moment(); // this creates a moment obj that represents the current moment in timestamp
console.log(date.format('MMM Do, YYYY'));
// documentation can be found here: http://momentjs.com/docs/#/displaying/

// you can also manipulate the date like this
date.add(100, 'year').subtract(9, 'month');
console.log(date.format('MMM Do, YYYY'));

// you can create a moment using a timestamp
var date2 = moment(1234); // 1234ms later than the unix epic
console.log(date2.format('MMM Do, YYYY'));

// these 2 lines are equivalent
// new Date().getTime()
// moment().valueOf()  // also returns timestamp in ms since the unix epic
