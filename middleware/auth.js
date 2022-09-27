const jwt = require('jsonwebtoken');

function verifikasi(){
    return function(req, res, next){
        var token = req.headers.authorization
        console.log(req.headers.authorization)
        console.log(req.headers)
        if(!token){
            return res.status(400).json({message: "user not logged in"})
        } else{
            try{
                let username = jwt.verify(token, 'secret')
                req.user = username
                console.log(username)
                next()
            } catch(err){
                return res.status(400).json({message: "invalid token"})
            }
        }
    }
}

module.exports = verifikasi;