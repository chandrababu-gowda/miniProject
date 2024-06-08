import express from "express";
import { router as uploadRouter } from "./routes/upload.route";

app.use("/upload", uploadRouter);

export { app };
