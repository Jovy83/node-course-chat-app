const path = require('path');
const express = require('express');

var app = express();
const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '/../public'); // much cleaner way using the built-in path module so use this instead

// console.log(__dirname + '/../public'); // old way we used to navigate to another folder. if we log this, you can see that the path is not clean as it goes to server, then back out, before finally getting to the public folder. this is unnecessary. 
// console.log(publicPath); 

app.use(express.static(publicPath));

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})