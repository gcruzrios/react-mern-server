const mongoose = require("mongoose");

const app = require("./app");

const port = process.env.PORT || 4000;


const { API_VERSION, URL_SERVER, PORT_DB } = require('./config');



mongoose.connect(`mongodb://${ URL_SERVER }:${ PORT_DB }/greivin`,{useNewUrlParser: true, useUnifiedTopology:true}, (err, res)=>{
    if(err){
        throw err;

    }else{
        console.log("La conexión a la base de datos es correcta");

        app.listen( port, ()=>{
            console.log("##############################");
            console.log("######### API  REST  #########");
            console.log("##############################");
            console.log(`http://${URL_SERVER}:${port}/api/${API_VERSION}`)

        })
    }
})