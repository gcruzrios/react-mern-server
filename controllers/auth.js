const jwt = require("../services/jwt");
const moment = require('moment');
const User = require("../models/user");

function willExpireToken(token){
    const {exp} = jwt.decodeToken(token);

    const currentDate = moment().unix();

    if(currentDate > exp){
        return true;
    }
    return false;
}

function refreshAccessToken(req,res){
    const {refreshToken} = req.body;
    const isTokenExpired = willExpireToken(refreshToken)
    
    if(isTokenExpired){
        res.status(404).send({ message: "El refresh Token ha expirado"});
    }else{
        
        const { id } = jwt.decodeToken(refreshToken);
        User.findOne({ _id: id },(err, userStored) =>{
            if(err){
                res.status(500).send({ message:"Error del servidor"});
            }else{
                if(!userStored){
                    res.status(404).send({ message: "Usuario no encontrado."})
                }else{
                    res.status(200).send({ 
                        accessToken: jwt.createAccessToken(userStored),
                        refreshToken: refreshToken
                    });
                }
            }
        })
        
        
    }
    
}

module.exports = { refreshAccessToken };

