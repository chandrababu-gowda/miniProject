import { app } from "./app.js";
import { config } from "dotenv";
import { connectToDatabase } from "./db/db.js";

config();

connectToDatabase(process.env.MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Success: Server started on http://localhost:3000`);
    });
  })
  .catch((err) => {
    console.log(`Failure: Unable to connect to database`);
    console.log(err);
  });
