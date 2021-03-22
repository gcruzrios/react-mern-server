const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt")
const User = require("../models/user");
const user = require("../models/user");

function signUp(req, res){

    console.log(req.body);
    const user = new User();
    const {name, lastname, email, password, repeatPassword} = req.body;

    user.name = name;
    user.lastname = lastname;
    user.email = email.toLowerCase();
    user.role ='admin';
    user.active = false;
    
    if (!password || !repeatPassword){
        res.status(404).send({message:"Las contraseñas son obligatorias"});
    }else{
        if(password !== repeatPassword){
            res.status(404).send({message:"Las contraseñas no son iguales"});
        }else{
            bcrypt.hash(password, null, null, function(err,hash){
                if (err){
                    res.status(500).send({message:"Ha ocurrido un error al encriptar la contraseña"})
                }else{
                    user.password = hash;
                    user.save((err, userStored)=>{
                        if(err){
                            res.status(500).send({message: 'Un usuario ya existe con ese email'})
                        }else{
                            if(!userStored){
                                res.status(404).send({message:"Error al crear el usuario"})
                            }else{
                                res.status(200).send({user:userStored})
                            }
                        }
                    })
                    
                }
            })

            
        }
    }
}

function signIn(req, res){
    const params = req.body;
    //console.log(params);
    const email= params.email.toLowerCase();
    const password = params.password;

    User.findOne({email}, (err,userStored)=>{
        if (err){
            res.status(500).send({message: "Error del servidor."});
        }else{
            if(!userStored){
                res.status(404).send({message: "Usuario no encontrado"})
            }else{
                 bcrypt.compare(password, userStored.password, (err, check)=>{
                     if (err){
                         res.status(500).send( {message: "Error del servidor"});
                     }else if (!check){
                         res.status(404).send({message: "La contraseña no es válida"})

                     }else{
                         if (!userStored.active){
                            res.status(200).send ({ code:200, message: "El usuario no se ha activado.."})
                         }else{
                             res.status(200).send({
                                accessToken: jwt.createAccessToken(userStored),
                                refreshToken: jwt.createRefreshToken(userStored)
                            });
                         }

                     }   
                 })   
            }
        }
    })

}

function getUsers(req,res){
    user.find().then(users => {
        if (!users){
            res.status(404).send({message: "No se encontrado ningún usuarios"})
        }else{
            res.status(200).send({users});
        }
    })

}

function getUsersActive(req,res){

    //console.log(req);
    const query=req.query;

    user.find({ active:query.active }).then(users => {
        if (!users){
            res.status(404).send({message: "No se encontrado ningún usuarios"})
        }else{
            res.status(200).send({users});
        }
    })

}

module.exports = {
    signUp, signIn, getUsers, getUsersActive
};