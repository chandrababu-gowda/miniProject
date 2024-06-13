import express from "express";
import { router as uploadRouter } from "./routes/upload.route.js";
import { emptyTemp } from "./utils/emptyDir.js";
import { ApiError } from "./utils/ApiError.js";
import { ApiResponse } from "./utils/ApiResponse.js";

const app = express();

app.use("/upload", uploadRouter);

app.use((err, req, res, next) => {
  console.log(new ApiError(500, "Failure: Internal Server Error"));
  res
    .status(500)
    .json(new ApiResponse(500, {}, "Failure: Internal Server Error"));
});

emptyTemp();

// Testing
function testingAws() {}

export { app };
