import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date },
  nutrients: { type: Object },
  remedy: { type: String },
});

const Image = mongoose.model("images", imageSchema);

export { Image };
