import { Image } from "../models/image.model.js";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";

config();

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
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
    .then(() => {
      console.log(`Success: Image uploaded`);
      res.json({ message: "Image uploaded" });
    })
    .catch((err) => {
      console.log(`Error: Unable to upload image\n${err}`);
      res.json({ message: "Unable to upload image" });
    });
}

export { uploadImage };
