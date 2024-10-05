import express from "express";
import config from "./config";
import logger from "./logger";

const app = express();

app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
});
