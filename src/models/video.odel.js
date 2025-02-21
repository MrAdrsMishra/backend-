import mongoose, {Schema,model} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema =new Schema(
    {
        videFile:{
            type:String,
            required:true
        },
        thumbnail:{
            type:String,
            required:true
        },
        title:{
            type:String,
            required:true
        },
        description:{
            type:String, // cloudnary
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        views:{
            type:Number,
            default:0
        },
        isPublish:{
            type:Boolean,
            required:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }, 
    }
,{timestamps:true})
// aggregate pipelines
videoSchema.plugin(mongooseAggregatePaginate)
 
export const Video = model("Video",videoSchema);