import express from "express";
import multer from "multer";

const upload = multer({ dest: "temp/" });
const app = express();

app.post("/", upload.single("photo"), (req, res, next) => {
  console.log(req.body);
  console.log(req.file);
  res.json({ message: "Files received" });
});

app.listen(3000, () => {
  console.log(`Server started on http://localhost:3000`);
});
