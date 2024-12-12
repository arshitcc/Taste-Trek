import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`);
        console.log(`\nMongoDB Connected !! DB_HOST : ${connectInstance.connection.host} `);
    } catch (error) {
        console.error('MONGO_DB Connection ERROR : ',error);
        process.exit(1);
    }
}

export default connectDB