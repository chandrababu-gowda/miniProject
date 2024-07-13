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
          const searchCondition = { name: imageName };
          const remedy = await generateRemedy(response);
          const updateData = { nutrients: response, remedy };
          await Image.findOneAndUpdate(searchCondition, updateData);
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
  const prompt = `"Potassium Deficiency: Foliar application of Potassium Nitrate (13:0:45) @ 5g per litre of water or Sulphate of Potash @ 5 g per litre.
  Sulphur deficiency: Spray of elemental sulphur @ 5 g per litre or spray of potassium sulphate @ 5 g per litre recommended or foliar spray of Banana special in Banana @ 5g per litre is recommended.
  Calcium deficiency: Soil application of  Calcium carbonate (Lime ) @ 50 g per plant  recommended. 
  Magnesium Deficiency: Application of Magnesium Sulphate @ 25g per plant or Foliar application of Banana special @ 5 g per litre recommended .
  Manganese Deficiency: Spraying of 0.5 % Manganese sulphate or spray of Bananaspecial @ 5 g per litre recommended. 
  Zinc deficiency: Spray of 0.5 % zinc sulphate or spray of  banana special @ 5 g per litre recommended. 
  Boron Deficiency: Soil application of Borax @ 25 g per plant or foliar application of 0.1 % boron(Solubore) or foliar application of Banana special @ 5g per litre recommended.
  Iron deficiency: foliar spray of 0.5 % Iron sulphate with 1 % urea recommended   or Spray of Banana special @ 5 g per litre is recommended." Use the given data and generate the remedy/solution if there is any nutritional defeciency in the given plant data ${data}. Give the solution in the plain text format.`;
  const result = await model.generateContent(prompt);

  return result.response.text();
}

export { uploadImage };
