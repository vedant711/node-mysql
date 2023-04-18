const router = require('express').Router();
const con = require('../connect');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({path:path.resolve(__dirname,'./.env')});


con.query('use node',err=>{if(err) throw err})

router.post('/login',async(req,res)=>{
    const {name,password} = req.body;
    if (!name||!password) res.status(400).json('Bad Request');
    con.query(`select * from employees where name='${name}' order by id asc limit 1;`,(err,result,fields)=>{
        if (err) throw err
        // console.log(result)
        if (result.length !== 0) { if (bcrypt.compare(password,result[0].password)) res.status(200).json({token:generateToken(result[0])})}
        else res.status(200).json('Invalid Username or Password')
    })
})

const generateToken = result => {
    const payload = {
        id:result.id,
        name:result.name,
        email:result.email,
        mobile: result.mobile,
        admin: result.admin 
    }
    const options = {};
    const token = jwt.sign(payload,process.env.JWT_SECRET,options)
    return token
}

router.post('/create',(req,res)=>{
    const {name,password,mobile,email} = req.body;
    if (!name||!password||!email||!mobile) res.status(400).json('Bad Request');
    bcrypt.genSalt(10,(err,salt)=>{
        if(err) res.status(400).json('Bad Request');
        bcrypt.hash(password,salt,function(err,hash){
            if (err) res.status(400).json('Bad Request');
            con.query(`select * from employees where name='${name}';`,(err,result,fields)=>{
                if (result.length === 0) {
                    if (mobile.length===10 && email.includes('@') && password.length===8) {
                        con.query(`insert into employees (name,password,mobile,email,admin) values ('${name}','${hash}',${mobile},'${email}',${false})`,(err,result)=>{
                            if (err) {res.status(400).json('Bad Request');throw err; }
                            else res.status(200).json('User added successfully')
                        });
                    } else res.status(200).json('Invalid Input')  
                } else res.status(200).json('User already exists')
            })
        })
    })
})

router.get('/admin/:token',(req,res)=>{
    const token = req.params.token;
    if (token) {
        jwt.verify(token.slice(1,-1),process.env.JWT_SECRET,(err,decoded)=> {
            if (err) {
                res.status(400).json({message:'Bad Request'})
                console.log(err)
            } else if (decoded.admin===1) {
                con.query(`select * from employees`,(err,result,fields)=>{
                    if (err) {res.status(400).json({message:'Bad Request'}); throw err}
                    res.status(200).json({res:result,message:'successful'})
                })
            } else res.status(403).json({message:'Forbidden'})
        })
    } else res.status(403).json({message:'Forbidden'})
})

router.post('/editname/:id',(req,res)=>{
    const {name,token} = req.body;
    if (token) {
        jwt.verify(token.slice(1,-1),process.env.JWT_SECRET,(err,decoded)=> {
            console.log(decoded.id,req.params.id)
            if (err) {
                res.status(400).json({message:'Bad Request'})
                console.log(err)
            } else if (decoded.id===parseInt(req.params.id) || decoded.admin===1) {
                if (!name) res.status(400).json('Please enter all details')
                con.query(`select * from employees where id=${req.params.id};`, (err,result2,fields)=> {
                    if (result2.length !== 0) {
                        con.query(`select * from employees where name='${name}';`,(err,result,fields)=>{
                            if (result.length === 0) {
                                con.query(`update employees set name='${name}' where id=${req.params.id};`,(err,result1)=>{
                                    if (err) {res.status(400).json('Bad Request');throw err;}
                                    con.query(`select * from employees where id=${req.params.id} order by id asc limit 1;`,(err,new_user,fields)=>{res.status(200).json({message:'User updated successfully',token:generateToken(new_user[0])})})
                                })
                            } else res.status(200).json('Username already taken')
                        })
                    } else res.status(400).json("User doesn't exist")
                })
            } else res.status(403).json('Forbidden')
        })
    } else res.status(403).json('Forbidden')
})

router.post('/editpassword/:id',(req,res)=>{
    const {password,token} = req.body;
    if (token) {
        jwt.verify(token.slice(1,-1),process.env.JWT_SECRET,(err,decoded)=> {
            if (err) {
                res.status(400).json({message:'Bad Request'})
                console.log(err)
            } else if (decoded.id===parseInt(req.params.id) || decoded.admin===1) {
                if (!password) res.status(400).json('Please enter all details')
                con.query(`select * from employees where id=${req.params.id};`, (err,result2,fields)=> {
                    if (result2.length !== 0) {
                        bcrypt.genSalt(10,(err,salt)=>{
                            if(err) res.status(400).json('Bad Request');
                            bcrypt.hash(password,salt,function(err,hash){
                                if (err) res.status(400).json('Bad Request');
                                con.query(`update employees set password='${hash}' where id=${req.params.id};`,(err,result)=>{
                                    if (err) {res.status(400).json('Bad Request');throw err;}
                                    res.status(200).json('User updated successfully')
                                })
                            })
                        })
                    } else res.status(400).json("User doesn't exist")
                })
            } else res.status(403).json('Forbidden')
        })
    }else res.status(403).json('Forbidden')
    
})

router.post('/delete/:id',(req,res)=>{
    const token = req.body.token;
    if (token) {
        jwt.verify(token.slice(1,-1),process.env.JWT_SECRET,(err,decoded)=> {
            if (err) {
                res.status(400).json({message:'Bad Request'})
                console.log(err)
            } else if (decoded.admin===1) {
                con.query(`delete from employees where id='${req.params.id}'`,(err,result)=>{
                    if (err) {res.status(400).json('Bad Request');throw err;}
                    res.status(200).json('User Deleted successfully')
                })
            } else res.status(403).json('Forbidden')
        })
    } else res.status(403).json('Forbidden')
    
})

router.post('/create-superuser',(req,res)=>{
    const {name,password,mobile,email,token} = req.body;
    if (token){
        jwt.verify(token.slice(1,-1),process.env.JWT_SECRET,(err,decoded)=> {
            if (err) {
                res.status(400).json({message:'Bad Request'})
                console.log(err)
            } else if (decoded.admin === 1) {
                if (!name||!password||!email||!mobile) res.status(400).json('Bad Request');
                bcrypt.genSalt(10,(err,salt)=>{
                    if(err) res.status(400).json('Bad Request');
                    bcrypt.hash(password,salt,function(err,hash){
                        if (err) res.status(400).json('Bad Request');
                        con.query(`select * from employees where name='${name}';`,(err,result,fields)=>{
                            if (result.length === 0) {
                                if (mobile.length===10 && email.includes('@') && password.length===8) {
                                    con.query(`insert into employees (name,password,mobile,email,admin) values ('${name}','${hash}',${mobile},'${email}',${true})`,(err,result)=>{
                                        if (err) {res.status(400).json('Bad Request');throw err; }
                                        else res.status(200).json('User added successfully')
                                    });
                            } else res.status(200).json('Invalid Input')
                            } else res.status(200).json('User already exists')
                        })
                    })
                })
            } else res.status(403).json('Forbidden')
        })
    } else res.status(403).json('Forbidden')
})

module.exports = router;