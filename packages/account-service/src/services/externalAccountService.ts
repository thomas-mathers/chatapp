import { ApiError, ApiErrorCode } from 'chatapp.api-error';
import { ObjectId } from 'mongodb';
import { Profile } from 'passport';
import { Result } from 'typescript-result';

import { ExternalAccountRepository } from '../repositories/externalAccountRepository';
import { AccountService } from './accountService';

export class ExternalAccountService {
  constructor(
    private readonly externalAccountRepository: ExternalAccountRepository,
    private readonly accountService: AccountService,
  ) {}

  async getOrCreateByExternalProfile(
    provider: string,
    { id: providerAccountId, emails, photos }: Profile,
  ) {
    const email = emails?.[0].value;
    const profilePictureUrl = photos?.[0].value;

    const externalAccount = await this.externalAccountRepository.getByProvider(
      provider,
      providerAccountId,
    );

    if (externalAccount) {
      if (profilePictureUrl) {
        await this.refreshProfilePicture(
          externalAccount.accountId.toString(),
          profilePictureUrl,
        );
      }

      return await Result.fromAsync(
        this.accountService.getById(externalAccount.accountId.toString()),
      ).getOrThrow();
    }

    if (!email) {
      throw ApiError.fromErrorCode({ code: ApiErrorCode.EmailMissing });
    }

    const account = await Result.fromAsync(
      this.accountService.getOrCreateByEmail(email),
    ).getOrThrow();

    if (profilePictureUrl) {
      await this.refreshProfilePicture(account.id, profilePictureUrl);
    }

    await this.externalAccountRepository.insert({
      accountId: new ObjectId(account.id),
      provider,
      providerAccountId,
      dateCreated: new Date(),
    });

    return account;
  }

  private async getProfilePictureBlob(
    profilePictureUrl: string,
  ): Promise<Blob> {
    const response = await fetch(profilePictureUrl);

    if (!response.ok) {
      throw ApiError.fromErrorCode({
        code: ApiErrorCode.AccountNotFound,
        message: 'Failed to download profile picture',
      });
    }

    const profilePictureBlob = await response.blob();

    return profilePictureBlob;
  }

  private async refreshProfilePicture(
    accountId: string,
    profilePictureUrl: string,
  ) {
    const profilePictureBlob =
      await this.getProfilePictureBlob(profilePictureUrl);

    await this.accountService.updateProfilePicture(
      accountId,
      profilePictureBlob,
    );
  }
}
