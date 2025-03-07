'use strict';

import { DatabaseClass, FieldType, FieldFlag } from '@wanyne/orm';
import Crypto from './modules/crypto.mjs';
import WanyneAccount from './account.mjs';

class WanyneSession extends DatabaseClass {
  static #table;
  static async init(database) {
    this.#table = await database.setTable('authsession', {
      sid: [FieldType.STRING(256), FieldFlag.NOTNULL(), FieldFlag.PRIMARY()],
      account: [
        FieldType.STRING(64),
        FieldFlag.FOREIGN(
          WanyneAccount.table.field('uuid'),
          'CASCADE',
          'CASCADE'
        ),
      ],
      body: [FieldType.JSON()],
      createdatetime: [FieldType.DATETIME(), FieldFlag.NOTNULL()],
      accessdatetime: [FieldType.DATETIME()],
      expiredatetime: [FieldType.DATETIME()],
      ip: [FieldType.STRING(64)],
      useragent: [FieldType.STRING(512)],
      logs: [FieldType.JSON()],
    });
    return this.#table;
  }
  static get table() {
    return this.#table;
  }

  constructor(sid = Crypto.randomString(42)) {
    super(WanyneSession.table, ['sid']);

    this.sid = sid;
    this.body = {};
    this.createdatetime = new Date();
    this.logs = {};

    this.new = true;
  }

  static async of(sid) {
    const session = new WanyneSession(sid);
    await session.read();
    session.new = false;
    return session;
  }
}

export default WanyneSession;
