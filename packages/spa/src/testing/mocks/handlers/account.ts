import {
  AccountRegistrationRequest,
  AccountSummary,
} from 'chatapp.account-service-contracts';
import { HttpResponse, http } from 'msw';

export const accountHandlers = [
  http.post('/accounts', async ({ request }) => {
    const json = await request.json();
    const { username, email } = json as AccountRegistrationRequest;

    const accountSummary: AccountSummary = {
      id: '1',
      username,
      email,
      profilePictureUrl: null,
      linkedAccounts: {},
      dateCreated: new Date().toISOString(),
    };

    return HttpResponse.json(accountSummary, { status: 201 });
  }),
];
