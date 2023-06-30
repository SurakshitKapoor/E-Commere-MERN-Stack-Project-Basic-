const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
// const mongoose = require("mongoose");
const connectDB = require("./config/database");
const User = require("./model/Users");
const Product = require("./model/Products");
const port = 3000;

// const connectDB = async () => {
//     await mongoose.connect ("mongodb://127.0.0.1:27017/e-comm")
//     .then( () => {console.log("DB ka connection is successful") })
//     .catch((error) => console.log("Failed connection"));


//     const productSchema = new mongoose.Schema({});
//     const product = mongoose.model("product", productSchema);
//     const data = await product.find();
//     console.log(data);

// }
connectDB();

app.use(express.json());

app.use(cors());
//cors was the error in api integration in frontend app -> we were assuming there was some issue in fetch or backend but cors module was required to parse app with backend


app.get("/", (req, resp) => {
    resp.send("You are in index.js file");
    console.log(`we're avalibale on port ${port}`);
});

//using jwt token in signup
app.post("/register" , async (req, resp) => {
    // resp.send("Hi , you are registered");
    const user = new User(req.body);
    const result = await user.save();
    // resp.send(result);
        
        if(result) {
            jwt.sign( {result}, apikey, { expiresIn: "2h"} , (err, token) => {

                if(err) {
                    resp.send({result: "something went wrong in fetching the token"});
                }
                //we're sending jwt token in response -> can be seen by postman
                //we have to bind it with the resp
                resp.send({result, token: token});
                
            });
        }
    }

    // resp.send(req.body);
);

const apikey = "surakshit";

//login by jwt token -> we can also make a middleware of jwt token , and use it in login route
app.post("/login", async(req, resp) => {
    
    //validations
    if(req.body.email && req.body.password) {

        const user = await User.findOne(req.body).select("-password");

        if(user) {
            jwt.sign( {user}, apikey, { expiresIn: "2h"} , (err, token) => {

                if(err) {
                    resp.send({result: "something went wrong in fetching the token"});
                }
               
                resp.send({user, auth: token});
                
            });
        }
        else {
            resp.send({result: "No user found"});
        }
        // resp.send(req.body);
    }
    else {
        return resp.status(401).json({
            success: false,
            message: "Provide all the input fields",
        })
    }
    
}   );

app.post("/add-products", verifyToken, async (req, resp) => {

    const product = new Product(req.body);
    const result = await product.save();
    console.log(result);
    resp.send(result);

});

app.get ("/products", verifyToken, async(req, resp) => {
    let product = await Product.find();
    if( product.length > 0 ) {
        
        resp.send (product);
    }  
    else {
        resp.send ("Not having the product items in list");
    }
});


app.delete("/products/:id", verifyToken, async (req, resp) => {
    // resp.send("working");
    // resp.send(req.params.id); -> for testing initially of working of route

    const result = await Product.deleteOne( {_id: req.params.id} );
    resp.send(result);
});


app.get("/products/:id" , verifyToken, async (req, resp) => {
    let result = await Product.findOne({_id: req.params.id});
    if(result){
        resp.send(result);
    }
    else {
        resp.send({result: "No id Found"});
    }
});

app.put("/products/:id", verifyToken, async (req, resp) => {
    let result = await Product.updateOne({_id: req.params.id}, {
        $set : req.body,
    });
    resp.send(result);

});

app.get("/search/:key", verifyToken, async (req, resp) => {
    let result = await Product.find({
        $or : [
            {name : {$regex: req.params.key}},
            {company : {$regex: req.params.key}},
            {category : {$regex: req.params.key}},
        ]
    });
    resp.send(result);
    
})

// a middleware which will pass in evry api -> to verify user
function verifyToken (req, resp, next) {
    let token = req.headers['authorization'];
    if(token) {
        token = token.split(' ')[1];
        jwt.verify(token, apikey, (err, valid) => {
            if(err) {
                resp.send("Pls enter a valid token");
            }
            else {
                next();
            }
        })
    }
    else{
        resp.send("Token is missing");
    }

    console.log("Middleware called", token);

    //we've to end the middleware by ending req-resp cycle or calling next() -> nahi toh req will left hangling
    // resp.send({result: "Middleware is called !"});
    // next();
};


app.listen(port, () => {
    console.log(`Hi, you are port number : ${port}`);
});