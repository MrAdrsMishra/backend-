import multer from "multer";

const storage = multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,"./public/temp")
    },
    filename: function (req,file,cb){
        cb(null,file.originalname)
    }
}) 
export const upload = multer({
    storage,
})  
// here in destination req and files is not getting used we can write "_" in place of them denoting "_will not be used_"