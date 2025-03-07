'use strict';

import { FieldType, FieldFlag } from '@wanyne/orm';
import Crypto from './modules/crypto.mjs';
import WanyneElement from './element.mjs';
import WanyneSession from './session.mjs';

class WanyneAccount extends WanyneElement {
  static #table;
  static async init(database) {
    this.#table = await database.setTable('authaccount', {
      uuid: [FieldType.STRING(64), FieldFlag.NOTNULL(), FieldFlag.PRIMARY()],
      permissions: [FieldType.JSON(), FieldFlag.NOTNULL()],
      createdatetime: [FieldType.DATETIME(), FieldFlag.NOTNULL()],
      modifydatetime: [FieldType.DATETIME()],
      accessdatetime: [FieldType.DATETIME()],

      username: [FieldType.STRING(32), FieldFlag.NOTNULL(), FieldFlag.UNIQUE()],
      passhash: [FieldType.STRING(128), FieldFlag.NOTNULL()],
      passsalt: [FieldType.STRING(128), FieldFlag.NOTNULL()],
    });
    return this.#table;
  }
  static get table() {
    return this.#table;
  }

  constructor(uuid = Crypto.uuid()) {
    super([WanyneAccount.table, ['uuid']], uuid);

    this.username = null;
    this.passhash = null;
    this.passsalt = this.#crypt(Date.now());
  }

  #crypt(data) {
    return new Crypto(data).salt(this.passsalt || '').hash('SHA-512');
  }

  verifyPassword(password) {
    return this.passhash === this.#crypt(password);
  }

  updatePassword(password) {
    this.passhash = this.#crypt(password);
  }

  static async of(uuid) {
    const account = new WanyneAccount(uuid);
    await account.read();
    return account;
  }

  static async ofAny(data) {
    const results = await WanyneAccount.table.read({
      record: ['uuid'],
      filter: {
        fields: [
          {
            uuid: data,
          },
          {
            username: data,
          },
        ],
      },
    });
    if (results.length <= 0) {
      throw new Error('default404');
    }
    return await WanyneAccount.of(results[0].uuid);
  }

  static async index() {}

  // sessions

  async readSessions() {
    const results = await WanyneSession.table.read({
      record: ['sid'],
      filter: {
        element: this.element,
      },
    });
    const tasks = [];
    for (const res of results) {
      tasks.push(WanyneSession.of(res.sid));
    }
    return await Promise.all(tasks);
  }

  async clearSessions() {
    const sessions = await this.readSessions();
    const tasks = [];
    for (const session of sessions) {
      tasks.push(session.delete());
    }
    await Promise.all(tasks);
  }
}

export default WanyneAccount;
