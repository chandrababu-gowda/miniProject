import { Router } from "express";
import multer from "multer";
import { uploadImage } from "../controllers/upload.controller.js";

const router = Router();
const upload = multer({ dest: "public/temp/" });

router.post("/", upload.single("photo"), uploadImage);

export { router };
