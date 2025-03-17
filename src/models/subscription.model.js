import { model, Schema } from "mongoose";
const subscriptionSchema = new Schema({
    // who is subscribing
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    // to which channel is getting subscribed
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
},{timestamps:true})
export const subscription = model("Subscription",subscriptionSchema)