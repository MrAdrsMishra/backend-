import mongoose from "mongoose";
import {DATABASE_NAME} from "../constants.js"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DATABASE_NAME}`)
        console.log(`connection successfully!! DB host: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("error found in databse connection",error)
        process.exit(1);
    }
}
export default connectDB;