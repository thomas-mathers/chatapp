import bodyParser from 'body-parser';
import { Logger } from 'chatapp.logging';
import { handleErrorMiddleware } from 'chatapp.middlewares';
import cors from 'cors';
import express from 'express';
import fileUpload from 'express-fileupload';
import { Server } from 'http';

import { Config } from './config';
import { FileController } from './controllers/fileController';
import { LocalStorageFileService } from './services/localStorageFileService';

export class App {
  private constructor(
    private readonly _logger: Logger,
    private readonly _httpServer: Server,
  ) {}

  static async launch(config: Config): Promise<App> {
    const logger = new Logger({ level: config.logging.level });

    const fileService = new LocalStorageFileService(config);
    const fileController = new FileController(config, logger, fileService);

    const httpServer = express()
      .use(cors())
      .use(bodyParser.json())
      .use(
        fileUpload({
          limits: {
            fileSize: config.maxFileSize,
          },
          abortOnLimit: true,
        }),
      )
      .use('/files', fileController.router)
      .use(handleErrorMiddleware)
      .listen(config.port, () => {
        logger.info(`Server is running on port ${config.port}`);
      });

    return new App(logger, httpServer);
  }

  async close(): Promise<void> {
    await this.closeHttpServer();
  }

  private async closeHttpServer() {
    return new Promise<void>((resolve) => {
      this._httpServer.close(() => {
        this._logger.info('HTTP server closed');
        resolve();
      });
    });
  }
}
