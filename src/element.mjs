'use strict';

import { DatabaseClass } from '@wanyne/orm';
import Crypto from './modules/crypto.mjs';

class WanyneElement extends DatabaseClass {
  constructor(superArgs, uuid = Crypto.uuid()) {
    super(...superArgs);

    this.uuid = uuid;
    this.permissions = [];
    this.createdatetime = new Date();
  }

  addPermission(perm) {
    if (!this.permissions.includes(perm)) {
      this.permissions.push(perm);
    }
    this.modifydatetime = new Date();
  }

  removePermission(perm) {
    if (!this.permissions.includes(perm)) {
      this.permissions.splice(this.permissions.indexOf(perm), 1);
    }
    this.modifydatetime = new Date();
  }

  hasPermission(perm) {
    return has(this.permissions, perm);
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

export default WanyneElement;
