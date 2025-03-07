'use strict';

import { DatabaseClass, FieldType, FieldFlag } from '@wanyne/orm';
import Crypto from './modules/crypto.mjs';
import WanyneElement from './element.mjs';

class WanyneSession extends DatabaseClass {
  static #table;
  static async init(database) {
    this.#table = await database.setTable('authsession', {
      sid: [FieldType.STRING(256), FieldFlag.NOTNULL(), FieldFlag.PRIMARY()],
      element: [
        FieldType.STRING(64),
        FieldFlag.NOTNULL(),
        FieldFlag.FOREIGN(
          WanyneElement.table.field('uuid'),
          'CASCADE',
          'CASCADE'
        ),
      ],
      createdatetime: [FieldType.DATETIME(), FieldFlag.NOTNULL()],
      accessdatetime: [FieldType.DATETIME()],
      expiredatetime: [FieldType.DATETIME()],
      ip: [FieldType.DATETIME(64)],
      useragent: [FieldType.STRING(512)],
      logs: [FieldType.JSON()],
    });
    return this.#table;
  }
  static get table() {
    return this.#table;
  }

  constructor(wanyneElement, expire = null) {
    super(WanyneSession.table, ['sid']);

    this.wanyneElement = wanyneElement;

    this.sid = Crypto.randomString(42);
    this.element = this.wanyneElement?.uuid;
    this.createdatetime = new Date();
    this.accessdatetime = new Date();
    this.expiredatetime = expire;
    this.logs = '{}';
  }

  async read() {
    await this._read();
    this.wanyneElement = await WanyneElement.of(this.element);
  }

  // element

  addPermission(...args) {
    this.wanyneElement.addPermission(...args);
  }

  removePermission(...args) {
    this.wanyneElement.removePermissions(...args);
  }

  hasPermission(...args) {
    return this.wanyneElement.hasPermission(...args);
  }

  static async of(sid) {
    const session = new WanyneSession();
    session.sid = sid;
    await session.read();
    return session;
  }
}

export default WanyneSession;
