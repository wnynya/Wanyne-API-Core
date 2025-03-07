import WanyneElement from './element.mjs';
import WanyneAccount from './account.mjs';
import WanyneSession from './session.mjs';

async function init(database) {
  await WanyneElement.init(database);
  await WanyneAccount.init(database);
  await WanyneSession.init(database);
}

export default {
  init: init,
  AuthElement: WanyneElement,
  AuthAccount: WanyneAccount,
  AuthSession: WanyneSession,
};

export { WanyneElement as AuthElement, WanyneAccount as AuthAccount };
