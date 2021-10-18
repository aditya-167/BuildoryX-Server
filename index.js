import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
const morgan = require('morgan');
import csrf from "csurf";
import cookieParser from "cookie-parser";
import fs from 'fs';

require('dotenv').config();




const csrfProt = csrf({ cookie: true })
//express application
const app = express();

mongoose.connect(process.env.DATABASE,{
    userNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(()=>console.log('---Tutorial DB connected---'))
.catch((err)=>console.log("DB Connection error",err));

//middleware from front end to backend
//used to execute anything before sending it to client

app.use(cors());
app.use(express.json({limit: '5mb'}));
app.use(cookieParser());

app.use(morgan('dev'));
app.use((req,res,next)=>{
    next();
})

//route
fs.readdirSync('./routes').map((route)=>{
    app.use('/api',require(`./routes/${route}`));
})

app.use(csrfProt);

app.get("/api/csrf-token", function(req, res){
    res.json({csrfToken:req.csrfToken()})
});
//port
const port = process.env.PORT || 8000;

app.listen(port,()=> console.log(`Server running on port ${port}`));
