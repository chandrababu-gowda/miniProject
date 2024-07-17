import { Router } from "express";
import multer from "multer";
import {
  uploadImage,
  generateRemedy,
} from "../controllers/upload.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", upload.single("photo"), asyncHandler(uploadImage));
router.post("/generateRemedy", asyncHandler(generateRemedy));

export { router };
