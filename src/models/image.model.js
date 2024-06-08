import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date },
});

const Image = mongoose.model("images", imageSchema);

export { Image };
