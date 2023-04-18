const mysql = require('mysql');
const path = require('path');
require('dotenv').config({path:path.resolve(__dirname,'./.env')});

let con = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:process.env.MYSQL_PASS,
    port:3306
})

con.connect(err=>{
    if(err) console.log(err);
    else console.log('Connected to DB')
})

module.exports = con;