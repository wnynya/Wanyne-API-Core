import WanyneAccount from './account.mjs';
import WanyneSession from './session.mjs';

import session from './middlewares/session.mjs';
import account from './middlewares/account.mjs';

async function init(database) {
  await WanyneAccount.init(database);
  await WanyneSession.init(database);
}

export default {
  WanyneAccount: WanyneAccount,
  WanyneSession: WanyneSession,
  init: init,
  middlewares: {
    session: session,
    account: account,
  },
};

export { WanyneAccount, WanyneSession };
