import { Image } from "../models/image.model.js";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

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

  // const file = req.file

  // console.log("hello");
  // console.log(file);

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: imageName,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  // console.log(params)
  const command = new PutObjectCommand(params);

  try {
    await s3.send(command);
    //console.log(res)
  } catch (e) {
    console.log("failed to send to s3", e);
  }

  Image.create(imageCreationData)
    .then(async () => {
      // fetch("http://127.0.0.1:5000/", {
      //   method: 'POST',
      //   headers: {
      //     ContentType: "application/json",
      //   },
      //   body: { "name": imageName },

      // })
      await axios
        .post("http://127.0.0.1:5000/", { name: imageName })
        .then(async (response) => {
          console.log("Sent and returned from python server");
          res.json({
            message: "Image uploaded",
            response: response.data,
          });
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

async function generateRemedy(req, res) {
  try {
    const { data } = req.body;
    console.log(data);
    const prompt = `
  For a banana plant, I have the following standard values and remedies for various nutrient deficiencies:
  - Potassium Deficiency: Foliar application of Potassium Nitrate (13:0:45) @ 5g per litre of water or Sulphate of Potash @ 5 g per litre.
  - Sulphur Deficiency: Spray of elemental sulphur @ 5 g per litre or spray of potassium sulphate @ 5 g per litre recommended or foliar spray of Banana special in Banana @ 5g per litre is recommended.
  - Calcium Deficiency: Soil application of Calcium carbonate (Lime) @ 50 g per plant recommended.
  - Magnesium Deficiency: Application of Magnesium Sulphate @ 25g per plant or Foliar application of Banana special @ 5 g per litre recommended.
  - Manganese Deficiency: Spraying of 0.5% Manganese sulphate or spray of Banana special @ 5 g per litre recommended.
  - Zinc Deficiency: Spray of 0.5% zinc sulphate or spray of banana special @ 5 g per litre recommended.
  - Boron Deficiency: Soil application of Borax @ 25 g per plant or foliar application of 0.1% boron (Solubore) or foliar application of Banana special @ 5g per litre recommended.
  - Iron Deficiency: Foliar spray of 0.5% Iron sulphate with 1% urea recommended or Spray of Banana special @ 5 g per litre is recommended.
  
  Using the given data, please generate a remedy/solution if there is any nutritional deficiency in the plant data provided below. The data is in the form of objects of objects, decode it if necessary, and generate the solution based on the standard remedies provided. Please give the solution in plain text format.
  
  Here is the data:
  ${JSON.stringify(data)}
  
  - Boron Deficiency: ${data.Boron.Deficient}
  - Iron Deficiency: ${data.Iron.Deficient}
  - Calcium Deficiency: ${data.Calcium.Deficient}
  - Potassium Deficiency: ${data.Potassium.Deficient}
  
  This data is in the form of objects. Now iterate through the object and generate the remedy. The remedy should be one among those I have given and very short.
  `;

    const result = await model.generateContent(prompt);

    res.status(200).json({
      message: "Remedy generated",
      remedy: result.response.text(),
    });
  } catch (err) {
    console.log("failed to generate remedy", err);
    res.status(400).json({
      message: "Unable to generate remedy",
    });
  }
}

export { uploadImage, generateRemedy };
