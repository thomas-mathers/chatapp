import { ApiError, ApiErrorCode } from 'chatapp.api-error';
import { Logger } from 'chatapp.logging';
import { Router } from 'express';

import { Config } from '../config';
import { FileService } from '../services/fileService';

function isNodeJsError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

export class FileController {
  private readonly _router = Router();

  constructor(
    readonly config: Config,
    readonly logger: Logger,
    readonly fileService: FileService,
  ) {
    this._router.get('/:fileId', async (req, res) => {
      const { fileId } = req.params;

      if (!fileId) {
        res.status(400).json(
          ApiError.fromErrorCode({
            code: ApiErrorCode.InvalidRequest,
            message: 'File ID is required',
          }),
        );
        return;
      }

      try {
        const file = await fileService.download(fileId);

        logger.info('File downloaded', { fileId });

        res.status(200).send(file);
      } catch (error) {
        if (isNodeJsError(error)) {
          switch (error.code) {
            case 'ENOENT':
              res.status(404).json(
                ApiError.fromErrorCode({
                  code: ApiErrorCode.FileNotFound,
                }),
              );
              return;
          }
        }

        throw error;
      }
    });

    this._router.post('/', async (req, res) => {
      if (!req.files) {
        res.status(400).json(
          ApiError.fromErrorCode({
            code: ApiErrorCode.InvalidRequest,
            message: 'No files were uploaded',
          }),
        );
        return;
      }

      const files = Object.values(req.files);

      if (files.length > 1 || Array.isArray(files[0])) {
        res.status(400).json(
          ApiError.fromErrorCode({
            code: ApiErrorCode.InvalidRequest,
            message: 'Only one file can be uploaded at a time',
          }),
        );
        return;
      }

      const file = files[0];

      if (!config.mimeTypes.has(file.mimetype)) {
        res.status(400).json(
          ApiError.fromErrorCode({
            code: ApiErrorCode.InvalidRequest,
            message: 'Unsupported file type',
          }),
        );
        return;
      }

      try {
        const fileId = await fileService.upload(file.name, file.data);

        logger.info('File uploaded', { fileId });

        res.status(201).json({ fileId });
      } catch (error) {
        res.status(500).json(
          ApiError.fromErrorCode({
            code: ApiErrorCode.Unknown,
          }),
        );
        logger.error('Failed to upload file', { error });
      }
    });
  }

  get router() {
    return this._router;
  }
}
