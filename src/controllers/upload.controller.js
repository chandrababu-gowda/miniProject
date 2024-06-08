import multer from "multer";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { lstat } from "fs";

const app = express();
const upload = multer({ dest: "public/temp/" });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.post("/", upload.single("photo"), (req, res) => {
  console.log(req.body);
  console.log(req.file);
  res.json({ message: "File received" });
});

const tempDir = "./public/temp";
setInterval(() => {
  try {
    fs.ensureDirSync(tempDir);
    fs.emptyDirSync(tempDir);
    console.log("Temporary directory is cleared");
  } catch (err) {
    console.error("Error while clearing temporary directory:", err);
  }
}, 3000);
