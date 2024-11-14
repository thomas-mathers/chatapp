import { AccountSummary } from 'chatapp.account-service-contracts';
import { Router } from 'express';
import passport, { Profile } from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { Config } from '../config';
import { OauthProvider } from '../models/oauth-provider';
import { AccountService, AuthService } from '../services';

export class OAuth2Controller {
  private readonly _router = Router();

  constructor(
    private readonly config: Config,
    private readonly accountService: AccountService,
    private readonly authService: AuthService,
  ) {
    this.configureStrategies();
    this.configureRoutes();
  }

  get router(): Router {
    return this._router;
  }

  private configureStrategies() {
    passport.use(
      new FacebookStrategy(
        {
          clientID: this.config.facebook.clientId,
          clientSecret: this.config.facebook.clientSecret,
          callbackURL: '/oauth2/facebook/callback',
          scope: ['public_profile', 'email'],
          profileFields: ['id', 'emails', 'name', 'photos'],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          await this.verifyCallback('facebook', profile, done);
        },
      ),
    );

    passport.use(
      new GoogleStrategy(
        {
          clientID: this.config.google.clientId,
          clientSecret: this.config.google.clientSecret,
          callbackURL: '/oauth2/google/callback',
          scope: ['profile', 'email'],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          await this.verifyCallback('google', profile, done);
        },
      ),
    );
  }

  private async verifyCallback(
    provider: OauthProvider,
    profile: Profile,
    done: (error: Error | null | unknown, account?: AccountSummary) => void,
  ) {
    try {
      const account = await this.accountService.getByLinkedAccount(
        provider,
        profile.id,
      );

      if (account) {
        done(null, account);
        return;
      }

      const email = profile.emails?.[0].value;

      if (!email) {
        done(new Error('Email not provided by OAuth provider'));
        return;
      }

      const existingAccount = await this.accountService.getByEmail(email);

      if (existingAccount) {
        await this.accountService.patch(existingAccount.id, {
          oauthProviderAccountIds: {
            ...existingAccount.linkedAccounts,
            [provider]: profile.id,
          },
        });

        done(null, existingAccount);

        return;
      }

      const newAccountResult = await this.accountService.insert({
        username: email,
        password: '',
        email,
        emailVerified: true,
        profilePictureUrl: profile.photos?.[0].value ?? null,
        oauthProviderAccountIds: {
          [provider]: profile.id,
        },
        dateCreated: new Date(),
      });

      done(null, newAccountResult.getOrThrow());
    } catch (error) {
      done(error);
    }
  }

  private configureRoutes() {
    this.configureRoute('facebook');
    this.configureRoute('google');
  }

  private configureRoute(provider: string) {
    this._router.get(
      `/${provider}/login`,
      passport.authenticate(provider, { session: false }),
    );

    this._router.get(
      `/${provider}/callback`,
      passport.authenticate(provider, { session: false }),
      async (req, res) => {
        const code = await this.authService.linkAuthCodeToJwt(
          req.query.code as string,
          req.user as AccountSummary,
        );

        res.redirect(`${this.config.frontEndUrl}?code=${code}`);
      },
    );
  }
}
