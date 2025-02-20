import express from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
// for accepting data in defferent formates
 // for json parsing
app.use(express.json({ 
    limit:"20kb",
}))
// for url data
app.use(express.urlencoded({extended:true,limit:'20kb',})) 
// for public acess assets
app.use(express.static("public"))
app.use(cookieParser())

export {app};