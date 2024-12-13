import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./apiError";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from "./env";   

cloudinary.config({
    cloud_name : CLOUDINARY_CLOUD_NAME,
    api_key : CLOUDINARY_API_KEY,
    api_secret : CLOUDINARY_API_SECRET,
})

const uploadFile = async(filePath: string) => {
    if(!filePath) return "";
    try {
        const response = await cloudinary.uploader.upload(filePath,{
            resource_type : "auto",
        });

        fs.unlinkSync(filePath);
        return response.url;
    } catch (error:any) {
        fs.unlinkSync(filePath);
        console.log(error.message);
        throw new ApiError(500, "Failed to upload file to cloudinary");
    }
}

const deleteFile = async(fileUrl: string) => {
    try {
        const regex : RegExp = /\/([^\/]+)\/([^\/]+)\/([^\/]+)\/([^\/]+)\.([a-z]+)/;
        const matches : RegExpMatchArray | null = fileUrl.match(regex);

        if(!matches || matches.length < 4) throw new ApiError(404, "File not found");
        
        const publicId = matches[4];
        const resource_type = matches[1];
        
        if(publicId && resource_type){
            await cloudinary.uploader.destroy(publicId,{resource_type});
        }
        else throw new ApiError(404, "File not found");
        return true;
    } catch (error) {
        throw new ApiError(500, "Failed to delete file from cloudinary");
    }
}

export { cloudinary, uploadFile, deleteFile };