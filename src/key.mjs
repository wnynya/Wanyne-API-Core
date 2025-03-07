'use strict';

import { DatabaseClass, FieldType, FieldFlag } from '@wanyne/orm';
import Crypto from './modules/crypto.mjs';
import WanyneElement from './element.mjs';

class WanyneKey extends DatabaseClass {
  static #table;
  static async init(database) {
    this.#table = await database.setTable('authaccount', {
      element: [
        FieldType.STRING(64),
        FieldFlag.NOTNULL(),
        FieldFlag.PRIMARY(),
        FieldFlag.FOREIGN(
          WanyneElement.table.field('uuid'),
          'CASCADE',
          'CASCADE'
        ),
      ],
      username: [FieldType.STRING(32), FieldFlag.NOTNULL(), FieldFlag.UNIQUE()],
      passhash: [FieldType.STRING(128), FieldFlag.NOTNULL()],
      passsalt: [FieldType.STRING(128), FieldFlag.NOTNULL()],
    });
    return this.#table;
  }
  static get table() {
    return this.#table;
  }

  constructor(authelement = new WanyneElement()) {
    super(AuthAccount.table, ['element']);

    this.authelement = authelement;

    this.element = this.authelement.uuid;
    this.username = null;
    this.passhash = null;
    this.passsalt = this.#crypt(Date.now());
  }

  async create(password) {
    this.passhash = this.#crypt(password);
    await this.authelement.create();
    await this._create();
  }

  async read() {
    await this._read();
    this.authelement = await WanyneElement.of(this.element);
  }

  async update() {
    await this.authelement.update();
    await this._update();
  }

  async delete() {
    await this.authelement.delete();
    await this._delete();
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

  // element

  addPermission(...args) {
    this.authelement.addPermission(...args);
  }

  removePermission(...args) {
    this.authelement.removePermissions(...args);
  }

  hasPermission(...args) {
    return this.authelement.hasPermission(...args);
  }

  static async of(element) {
    const account = new AuthAccount();
    account.element = element;
    await account.read();
    return account;
  }

  static async ofUsername(username) {
    const results = await AuthAccount.table.read({
      record: ['element'],
      filter: {
        username: username,
      },
    });
    return await AuthAccount.of(results[0].element);
  }

  static async index() {}

  // sessions

  async createSession(expire) {
    const session = new AuthSession(this.authelement, expire);
    await session.create();
    return session;
  }

  async readSessions() {
    const results = await AuthSession.table.read({
      record: ['sid'],
      filter: {
        element: this.element,
      },
    });
    const tasks = [];
    for (const res of results) {
      tasks.push(AuthSession.of(res.sid));
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

  // projects

  async createProject() {}

  async readProjects() {}
}

export default AuthAccount;
