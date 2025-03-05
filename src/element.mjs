import { DatabaseClass, FieldType, FieldFlag } from '@wanyne/orm';
import { v4 as uuidv4 } from 'uuid';

class AuthElement extends DatabaseClass {
  static #table;
  static async init(database) {
    this.#table = await database.setTable('authelement', {
      uuid: [FieldType.STRING(64), FieldFlag.NOTNULL(), FieldFlag.PRIMARY()],
      permissions: [FieldType.JSON(), FieldFlag.NOTNULL()],
      createdatetime: [FieldType.DATETIME(), FieldFlag.NOTNULL()],
      modifydatetime: [FieldType.DATETIME(), FieldFlag.NOTNULL()],
      accessdatetime: [FieldType.DATETIME()],
      expiredatetime: [FieldType.DATETIME()],
    });
    return this.#table;
  }
  static get table() {
    return this.#table;
  }

  constructor(expire = null) {
    super(AuthElement.#table, ['uuid']);

    this.uuid = uuidv4();
    this.permissions = [];
    this.createdatetime = new Date();
    this.modifydatetime = this.createdatetime;
    this.accessdatetime = null;
    this.expiredatetime = expire;
  }

  addPermission(perm) {
    if (!this.permissions.includes(perm)) {
      this.permissions.push(perm);
    }
    this.modifyDatetime = new Date();
  }

  removePermission(perm) {
    if (!this.permissions.includes(perm)) {
      this.permissions.splice(this.permissions.indexOf(perm), 1);
    }
    this.modifyDatetime = new Date();
  }

  hasPermission(perm) {
    return has(this.permissions, perm);
  }

  static async of(uuid) {
    const element = new AuthElement();
    element.uuid = uuid;
    await element.read();
    return element;
  }
}

function has(source, target) {
  if (!Array.isArray(source)) {
    return false;
  }
  let checked = false;
  for (const perm of source) {
    if (perm.startsWith('-')) {
      if (check(perm.substring(1), target)) {
        return false;
      }
    } else if (checked) {
      continue;
    } else {
      checked = check(perm, target);
    }
  }
  return checked;
}

function check(source, target) {
  const sourceArray = source.split('.');
  const targetArray = target.split('.');
  const loop = Math.max(sourceArray.length, targetArray.length);
  let bool = false;
  let lastSource;
  for (let n = 0; n < loop; n++) {
    lastSource =
      sourceArray[n] === null || sourceArray[n] === undefined
        ? '*'
        : sourceArray[n];
    bool =
      lastSource === targetArray[n] ||
      (lastSource === '*' &&
        !(targetArray[n] === null || targetArray[n] === undefined));
    if (!bool) {
      break;
    }
  }
  return bool;
}

export default AuthElement;
export { AuthElement };
