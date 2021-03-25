const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt")
const User = require("../models/user");
//const user = require("../models/user");
const fs = require("fs");
const path = require("path");

function signUp(req, res){

    //console.log(req.body);
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
    User.find().then(users => {
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

    User.find({ active:query.active }).then(users => {
        if (!users){
            res.status(404).send({message: "No se encontrado ningún usuarios"})
        }else{
            res.status(200).send({users});
        }
    })

}

function uploadAvatar(req,res){
    const params = req.params;
    //console.log(params);

    User.findById({_id:params.id}, (err, userData) => {
        if(err){
            res.status(500).send({message: "Error del Servidor, "})
        }else{
            if(!userData){
                res.status(404).send({ message: "No ha encontrado el usuario"})
            }else{
                
                let user = userData;

                if (req.files){
                    let filePath = req.files.avatar.path;
                    let fileSplit = filePath.split("/");
                    let fileName = fileSplit[2];

                    let extSplit = fileName.split(".");
                    //console.log(extSplit);
                    let fileExt = extSplit[1];

                    if(fileExt !== "png" && fileExt !=="jpg" && fileExt !=="jpeg"){
                        res.status(400).send({message: "La extensión del imagen no es válida [jpg, jpeg, png]"});
                    }else{
                        user.avatar= fileName;
                        User.findByIdAndUpdate({ _id: params.id}, user,(err, userResult) =>{
                            if (err){
                                res.status(500).send ({ message:"Error del servidor"});

                            }else{
                                if (!userResult){
                                    res.status(404).send({message: "Usuario no encontrado"})
                                }else{
                                    res.status(200).send({avatar: fileName});
                                }
                            }
                        })
                    }
                }
              
            }   
        }
    })
}

function getAvatar(req,res){
    
    const avatarName = req.params.avatarName;

    const filePath = "./uploads/avatar/" + avatarName;

    fs.exists(filePath, exists =>{
        if(!exists){
            res.status(404).send({message:"Imagen no encontrado"})
        }else{
            res.sendFile(path.resolve(filePath));
        }
    })
    //console.log("Get avatar...");

}

async function updateUser(req, res){
    
    let userData = req.body;
    userData.email = req.body.email.toLowerCase();

    //console.log(userData);
    const params = req.params;

    if(userData.password){
        await bcrypt.hash(userData.password, null, null, (err,hash)=>{
            if(err){
               res.status(500).send({message:"Error al encriptar la contraseña"}) 
            }else{
                userData.password = hash;
            }
        });
    };

    User.findByIdAndUpdate({_id:params.id},userData, (err, userUpdate) =>{
        if(err){
            res.status(500).send({message:"Error del servidor."});
        }else{
            if (!userUpdate){
                res.status(404).send({message:"Usuario no encontrado"});
            }else{
                res.status(200).send({message: "Usuario actualizado correctamente"})
            }
        }
    })

}

function activateUser(req,res){
   //console.log("Activando usuario");
    const {id} = req.params;
    const { active } = req.body;

    //console.log(id);
    //console.log(active);

    User.findByIdAndUpdate(id, { active }, (err,userStored)=>{
        if(err){
            res.status(500).send({message:"Error del servidor."})
        }else{
            if (!userStored){
                res.status(404).send({message:"Error, usuario no encontrado."})
            }else{
                if(active===true){
                    res.status(200).send({message:"Usuario activado correctamente."})
                }else{
                    res.status(200).send({message:"Usuario desactivado correctamente."})
                }
            }
        }
    })

}

function deleteUser(req,res){
   const { id } = req.params;

   User.findByIdAndRemove(id, (err,userDeleted)=>{
        if(err){
            res.status(500).send({message:"Error del servidor."})
        }else{
            if (!userDeleted){
                res.status(404).send({message:"Error, usuario no encontrado."})
            }else{
                res.status(200).send({message:"Usuario ha sido eliminado correctamente."})
            }
        }
   })
}

function signUpAdmin(req,res){
    //console.log("Sign Up Admin");
    
    const user = new User();
    const {name, lastname, email, role, password } = req.body;

    user.name = name;
    user.lastname = lastname;
    user.email = email.toLowerCase();
    user.role = role;
    user.active = true;

    if (!password){
        res.status(500).send({message: "La contraseña es obligatoria."});
    }else{
        bcrypt.hash(password, null, null, (err,hash) => {

            if(err){
                res.status(500).send({message: "Encriptar la contraseña dió error"});
            }else{
                user.password = hash;
                user.save((err,userStored)=>{
                    if(err){
                        res.status(500).send({message:"El usuario ya existe."});
                    }else{
                        if(!userStored){
                            res.status(500).send({message: "Error al crear el nuevo usuario."})
                        }else{
                            //res.status(200).send({user: userStored})
                            res.status(200).send({ message: "Usuario creado correctamente"});
                        }
                    }
                })
            }

        });

    }

        
   
        



    
}

module.exports = {
    signUp, signIn, getUsers, getUsersActive, uploadAvatar, getAvatar, updateUser, activateUser, deleteUser, signUpAdmin
};