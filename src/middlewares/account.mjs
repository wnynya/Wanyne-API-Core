'use strict';

import WanyneAccount from '../session.mjs';

export default () => {
  return async (req, res, next) => {
    if (req?.session?.account) {
      req.account = WanyneAccount.of(req.session.account).catch(() => {});
    }

    next();
  };
};
