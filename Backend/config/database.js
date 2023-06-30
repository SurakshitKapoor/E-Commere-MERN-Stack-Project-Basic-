const mongoose = require("mongoose");

const connectDB = async() => {

    mongoose.connect("mongodb://127.0.0.1:27017/e-comm", 
    {
        useNewUrlParser:true,
        useUnifiedTopology: true,
    })
    .then( () => console.log("DB ka connection is OK"))
    .catch((error) => console.log("connection is failed"));
}

module.exports = connectDB;
