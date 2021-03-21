const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const { API_VERSION } = require('./config');


//Load routings
const userRoutes = require("./routers/user");
const authRoutes = require("./routers/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Configure HEaders HTTP


// Router Basic
app.use(`/api/${API_VERSION}`, userRoutes);
app.use(`/api/${API_VERSION}`, authRoutes);

module.exports = app;