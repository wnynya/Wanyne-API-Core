import crypto from 'node:crypto';
import { DatabaseClass, FieldType, FieldFlag } from '@wanyne/orm';
import { AuthElement } from './element.mjs';

class AuthAccount extends DatabaseClass {
  static #table;
  static async init(database) {
    this.#table = await database.setTable('authaccount', {
      uuid: [
        FieldType.STRING(64),
        FieldFlag.NOTNULL(),
        FieldFlag.PRIMARY(),
        FieldFlag.FOREIGN(
          AuthElement.table.field('uuid'),
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

  constructor(element = new AuthElement()) {
    super(AuthAccount.#table, ['uuid']);

    this.element = element;

    this.uuid = this.element.uuid;
    this.username = null;
    this.passhash = null;
    this.passsalt = this.#crypt(Date.now());
  }

  async create(password) {
    this.passhash = this.#crypt(password);
    await this.element.create();
    await this._create();
  }

  async read() {
    await this.element.read();
    await this._read();
  }

  async update() {
    await this.element.update();
    await this._update();
  }

  async delete() {
    await this.element.delete();
    await this._delete();
  }

  #crypt(data) {
    const source = crypto.createHash('SHA512', this.passsalt || '');
    source.update(String(data));
    const hash = source.digest('hex');
    return hash;
  }

  verifyPassword(password) {
    return this.passhash === this.#crypt(password);
  }

  updatePassword(password) {
    this.passhash = this.#crypt(password);
  }

  // element

  addPermission(...args) {
    this.element.addPermission(...args);
  }

  removePermission(...args) {
    this.element.removePermissions(...args);
  }

  hasPermission(...args) {
    return this.element.hasPermission(...args);
  }

  static async of(uuid) {
    const account = new AuthAccount(await AuthElement.of(uuid));
    await account.read();
    return account;
  }

  static async index() {}

  // sessions

  async createSession() {}

  async readSessions() {}

  async clearSessions() {}

  // keys

  async createKey() {}

  async readKeys() {}

  // projects

  async createProject() {}

  async readProjects() {}
}

export default AuthAccount;
export { AuthAccount };
