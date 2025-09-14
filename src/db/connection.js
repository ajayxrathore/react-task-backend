import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}${process.env.DB_NAME}`)
    } catch (error) {
        throw new Error("Error while connecting to MongoDB: " + error.message);
    }
}
export {
    connectDB
}
