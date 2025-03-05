import AuthElement from './element.mjs';
import AuthAccount from './account.mjs';

async function init(database) {
  await AuthElement.init(database);
  await AuthAccount.init(database);
}

export default {
  init: init,
  AuthElement: AuthElement,
  AuthAccount: AuthAccount,
};

export { AuthElement, AuthAccount };
