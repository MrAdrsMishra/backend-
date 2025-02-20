import dotenv from 'dotenv'
import express from 'express'
import connectDB from "./db/index.js";
dotenv.config({
    path:"./.env"
})
const app = express()
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at port: ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("MONGODB connectio failed",error);
})
/*
(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("error",error)  
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`app is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.log("error:",error)
        throw error
    }
})()
*/