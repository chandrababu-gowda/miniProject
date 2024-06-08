import fs from "fs-extra";

const tempDir = "./public/temp";

function emptyTemp() {
  setInterval(() => {
    try {
      fs.ensureDirSync(tempDir);
      fs.emptyDirSync(tempDir);
      console.log("Success: /public/temp is cleared");
    } catch (err) {
      console.error("Failure: Unable to clear /public/temp\n", err);
    }
  }, 86400000);
}

export { emptyTemp };
