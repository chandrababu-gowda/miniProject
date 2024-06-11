import express from "express";
import { router as uploadRouter } from "./routes/upload.route.js";
import { emptyTemp } from "./utils/emptyDir.js";

const app = express();

app.use("/upload", uploadRouter);

emptyTemp();

// Testing
function testingAws() {}

export { app };
