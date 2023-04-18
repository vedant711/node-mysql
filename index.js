const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config({path:path.resolve(__dirname,'./.env')});
var bodyParser = require('body-parser')
const cors = require('cors');
const connect = require('./connect');

app.use(cors({credentials: true, origin: 'http://localhost:3000'}))
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(require('./routes/apis'))
app.listen(process.env.PORT, ()=> {console.log(`Listening on ${process.env.PORT}`)})