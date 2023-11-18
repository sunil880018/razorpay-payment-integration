require("dotenv").config();

const app = require('express')();
var http = require('http').Server(app);

const paymentRoute = require('./routes/paymentRoute');
const cors = require('cors')
app.use(cors());
app.use('/',paymentRoute);

http.listen(4000, function(){
    console.log('Server is running 4000');
});