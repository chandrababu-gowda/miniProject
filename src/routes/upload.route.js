import { Router } from "express";
import multer from "multer";
import { uploadImage } from "../controllers/upload.controller.js";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", upload.single("photo"), uploadImage);

export { router };
