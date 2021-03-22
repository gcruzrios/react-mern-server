const jwt = require("jwt-simple");
const moment = require ("moment");

const SECRET_KEY = "Grvn240675Date2021";

exports.ensureAuth = (req, res, next ) => {
    if (!req.headers.authorization){
        return res.status(403).send({message:"la Petición no tiene cabecera de Autenticación."})
    }

    const token= req.headers.authorization.replace(/['"]+/g, "");

    try {

        var payload = jwt.decode(token, SECRET_KEY);

        if(payload.exp <= moment.unix()){
            return res.status(404).send({message: "El token ha expirado"});
        }

    }catch(err){
        //console.log(err);
        return res.status(404).send({message : "Token invalido" });
    }
    req.user = payload;
    next();
}