import mongoose from "mongoose";

//Function to connect to the mongodb database
export const connectDb = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database connected")
    );
    await mongoose.connect(`${process.env.MONGO_DB_URI_LOCAL}/chatApp`);
  } catch (error) {
    console.log(error);
  }
};
