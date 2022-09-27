const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const koneksi = require('./koneksi');

const app = express();
const PORT = process.env.port || 3000;


// parse application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

const hostname = 'http://dev3.dansmultipro.co.id/api/recruitment/'

// endpoint login
app.post('/login', (req, res) => {
    var username = req.body.username
    var password = req.body.password
    const query = "SELECT * FROM user WHERE username = ? AND password = ?";
    koneksi.query(query, [username, password], (error, rows, fields) => {
        if(error){
            console.log(error);
            return res.status(500).json({message: "terjadi kesalahan", error: error});
        }
        if(rows.length === 1){
            const jwt_token = jwt.sign({username: rows[0].username}, 'secret')
            res.status(200).json({success: true, username: rows[0].username, jwt_token})
        } else{
            res.status(400).json({success: false, message: "username/password salah"})
        }
    });
})


// start server
app.listen(PORT, () => {
    console.log(`server started in port ${PORT}`)
});