import { Image } from "../models/image.model.js";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

config();

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: process.env.GOOGLE_GEMINI_MODEL,
});

async function uploadImage(req, res) {
  const imageName = uuidv4();
  const imageCreationData = { name: imageName, date: new Date() };

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: imageName,
    Body: req.file.buffer,
    ContentType: req.file.mimeType,
  };

  const command = new PutObjectCommand(params);

  await s3.send(command);

  Image.create(imageCreationData)
    .then(async () => {
      console.log(`Success: Image uploaded`);
      const remedy = await generateRemedy();
      res.json({ message: "Image uploaded", remedy });
    })
    .catch((err) => {
      console.log(`Error: Unable to upload image\n${err}`);
      res.json({ message: "Unable to upload image" });
    });
}

async function generateRemedy() {
  const prompt = `Tell me about Pagani Utopia in 20 words`;
  const result = await model.generateContent(prompt);

  return result.response.text();
}

export { uploadImage };
