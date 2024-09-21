import fs from "fs";
import path from "path";

const config = {
  server: {
    https: {
      key: fs.readFileSync(path.resolve("localhost-key.pem")),
      cert: fs.readFileSync(path.resolve("localhost.pem")),
    },
  },
};

export default config;
