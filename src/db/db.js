import mongoose from "mongoose";

async function connectToDatabase(url) {
  try {
    await mongoose.connect(url);
    console.log(`Success: Connected to the database`);
  } catch (error) {
    console.log(`Failure: Unable to connect to database`);
    console.log(`${error}`);
  }
}

export { connectToDatabase };
