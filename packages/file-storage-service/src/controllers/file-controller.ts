import { ApiError, ApiErrorCode } from 'chatapp.api-error';
import { Logger } from 'chatapp.logging';
import { Router } from 'express';

import { Config } from '../config';
import { FileService } from '../services/file-service';

export class FileController {
  private readonly _router = Router();

  constructor(
    readonly config: Config,
    readonly logger: Logger,
    readonly fileService: FileService,
  ) {
    this._router.post('/:accountId/:filename', async (req, res) => {
      const { accountId, filename } = req.params;

      const file = req.file!;

      if (!config.mimeTypes.has(file.mimetype)) {
        res.status(400).json(
          ApiError.fromErrorCode({
            code: ApiErrorCode.InvalidRequest,
            message: 'Unsupported file type',
          }),
        );
        return;
      }

      const url = await fileService.upload(accountId, filename, file.buffer);

      logger.info('File uploaded', { url });

      res.status(201).json({ url });
    });
  }

  get router() {
    return this._router;
  }
}
