import { LoginResponse } from 'chatapp.account-service-contracts';
import { Router } from 'express';
import passport, { Profile } from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Result } from 'typescript-result';

import { Config } from '../config';
import { AccountService } from '../services/accountService';
import { AuthService } from '../services/authService';
import { ExternalAccountService } from '../services/externalAccountService';

export class OAuth2Controller {
  private readonly _router = Router();

  constructor(
    private readonly config: Config,
    private readonly externalAccountService: ExternalAccountService,
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
          await this.verify('facebook', profile, done);
        },
      ),
    );

    passport.use(
      new GoogleStrategy(
        {
          clientID: this.config.google.clientId,
          clientSecret: this.config.google.clientSecret,
          callbackURL: '/oauth2/google/callback',
        },
        async (_accessToken, _refreshToken, profile, done) => {
          await this.verify('google', profile, done);
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
      (req, res) => {
        const user: LoginResponse = req.user as LoginResponse;
        const { jwt } = user;
        res.redirect(`${this.config.frontEndUrl}#jwt=${jwt}`);
      },
    );
  }

  private async verify(
    provider: string,
    { id: providerAccountId, emails }: Profile,
    done: (error: Error | null | unknown, user?: LoginResponse | false) => void,
  ) {
    try {
      const credentials = await this.externalAccountService.getByProvider(
        provider,
        providerAccountId,
      );

      if (credentials) {
        return await Result.fromAsync(
          this.authService.socialLogin(credentials.accountId),
        ).fold((t) => done(null, t), done);
      }

      const email = emails?.[0].value;

      if (!email) {
        return done(null, false);
      }

      const existingAccount = await Result.fromAsync(
        this.accountService.getByEmail(email),
      ).getOrNull();

      if (existingAccount !== null) {
        await this.externalAccountService.insert({
          accountId: existingAccount.id,
          provider,
          providerAccountId,
        });

        return await Result.fromAsync(
          this.authService.socialLogin(existingAccount.id),
        ).fold((t) => done(null, t), done);
      }

      const account = await Result.fromAsync(
        this.accountService.socialRegister(email),
      ).getOrThrow();

      await this.externalAccountService.insert({
        accountId: account.id,
        provider,
        providerAccountId,
      });

      return await Result.fromAsync(
        this.authService.socialLogin(account.id),
      ).fold((t) => done(null, t), done);
    } catch (error) {
      done(error);
    }
  }
}
