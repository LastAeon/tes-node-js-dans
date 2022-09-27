const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const koneksi = require('./koneksi');

const app = express();
const PORT = process.env.port || 3000;


// parse application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

const hostname = 'http://dev3.dansmultipro.co.id/api/recruitment'

// endpoint registration and login
app.post('/registrasi', (req, res) => {
    var username = req.body.username
    var userCount

    if(username === '' || req.body.password === ''){
        return res.status(400).json({success: false, message: "username/password tidak boleh kosong"})
    }

    const querySearch = 'SELECT username FROM user WHERE username = ?'
    koneksi.query(querySearch, username, (error, rows, fields) => {
        userCount = rows.length
        if(rows.length !== 0){
            return res.status(400).json({success: false, message: "username sudah ada"})
        } else{
            bcrypt.hash(req.body.password, 10, (err, hashed_password) => {
                if(err) {
                    throw err;
                } else {
                    const query = "INSERT INTO user (username, password) VALUES (?,?)";
                    koneksi.query(query, [username, hashed_password], (error, rows, fields) => {
                        if(error){
                            console.log(error);
                            return res.status(500).json({message: "terjadi kesalahan", error: error});
                        }
                        res.status(201).json({success: true, message: 'user berhasil ditambahkan'});
                    });
                }
            })
        }
    })
    
})


app.post('/login', (req, res) => {
    var username = req.body.username
    var password = req.body.password
    const query = "SELECT * FROM user WHERE username = ?";
    koneksi.query(query, username, (error, rows, fields) => {
        if(error){
            console.log(error);
            return res.status(500).json({message: "terjadi kesalahan", error: error});
        }
        if(rows.length === 1){
            bcrypt.compare(password, rows[0].password, (err, result) => {
                if(result === true){
                    const jwt_token = jwt.sign({username: rows[0].username}, 'secret')
                    res.status(200).json({success: true, username: rows[0].username, jwt_token})
                }
                else{
                    res.status(400).json({success: false, message: "username/password salah"})
                }
            })
            
        } else{
            res.status(400).json({success: false, message: "username/password salah"})
        }
    });
})

const verifikasi = require('./middleware/auth');
// endpoint job list
app.get('/positions.json', verifikasi(), (req, res) => {
    console.log(hostname+req.originalUrl)
    axios.get(hostname+req.originalUrl)
    .then(queryRes => {
        res.status(200).json(queryRes.data)
    })
});

// endpoint job detail
app.get('/positions/:id', verifikasi(), (req, res) => {
    console.log(hostname+req.originalUrl)
    axios.get(hostname+req.originalUrl)
    .then(queryRes => {
        res.status(200).json(queryRes.data)
    })
});


// start server
app.listen(PORT, () => {
    console.log(`server started in port ${PORT}`)
});