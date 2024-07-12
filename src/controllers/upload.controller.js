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
      console.log(`Image add to database`);
      fetch("http://127.0.0.1:5000/", {
        method: "POST",
        headers: {
          ContentType: "application/json",
        },
        body: JSON.stringify({ name: imageName }),
      })
        .then(async (response) => {
          console.log(response);
          const remedy = await generateRemedy(response);
          res.json({ message: "Image uploaded", response, remedy });
        })
        .catch((err) => {
          console.log(`Error: Unable to send to python file`);
          res.json({ message: "Unable to analyze the image" });
        });
    })
    .catch((err) => {
      console.log(`Error: Unable to upload image\n${err}`);
      res.json({ message: "Unable to upload image" });
    });
}

async function generateRemedy(data) {
  const prompt = `Give me the remedy for the nutrients deffeciency in banana leaf ${data}`;
  const result = await model.generateContent(prompt);

  return result.response.text();
}

export { uploadImage };
