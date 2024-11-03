import { AccountSummary } from 'chatapp.account-service-contracts';
import { Router } from 'express';
import passport, { Profile } from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { Config } from '../config';
import { AuthService } from '../services/authService';
import { ExternalAccountService } from '../services/externalAccountService';

export class OAuth2Controller {
  private readonly _router = Router();

  constructor(
    private readonly config: Config,
    private readonly externalAccountService: ExternalAccountService,
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
        const code = await this.authService.getAuthCode(
          req.user as AccountSummary,
        );

        res.redirect(`${this.config.frontEndUrl}?code=${code}`);
      },
    );
  }

  private async verifyCallback(
    provider: string,
    profile: Profile,
    done: (error: Error | null | unknown, account?: AccountSummary) => void,
  ) {
    try {
      const account =
        await this.externalAccountService.getOrCreateByExternalProfile(
          provider,
          profile,
        );
      done(null, account);
    } catch (error) {
      done(error);
    }
  }
}
