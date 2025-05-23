// require('dotenv').config();
import dotenv from 'dotenv';
import connectDB from"./db/index.js";
import { connect } from 'mongoose';

dotenv.config({
    path:`./.env`
});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
})
.catch((error) => {
    console.error("MongoDb connection failed !!!", error);
    
});



/*
import express from 'express';

const app = express();

( async () => {
    try {
       await moongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error",(error)=>{
        console.log("ERRR:",error);
        throw error
       })

         app.listen(process.env.PORT, () => {
          console.log(`Server is running on port ${process.env.PORT}`);
         });


    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error
    }
}) */