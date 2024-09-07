import { log } from "console";
import mongoose from "mongoose";

const mongoConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to mongoDB:${conn.connection.host}`);
  } catch (error) {
    console.log(
      `Some error occured while connecting to mongodb: ${error.message}`
    );
  }
};
export default mongoConnect;
