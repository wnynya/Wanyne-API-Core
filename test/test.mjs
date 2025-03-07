import { Database, DatabaseClient } from '@wanyne/orm';
import {
  default as Auth,
  WanyneAccount,
  WanyneSession,
} from '../src/index.mjs';

const database = new Database(
  new DatabaseClient.MySQL({
    host: '100.100.2.103',
    port: 3306,
    user: 'wanynedev',
    password: 'wanyne@Minecraftmonogatari',
    database: 'wanynedev',
  })
);

async function init() {
  await database.client.query('DROP TABLE `authsession`').catch(() => {});
  await database.client.query('DROP TABLE `authaccount`').catch(() => {});
  await database.client.query('DROP TABLE `authelement`').catch(() => {});

  await Auth.init(database);

  let t = new WanyneAccount();

  t.username = 'test';
  t.updatePassword('1234');

  await t.create();

  const tt = await WanyneAccount.ofAny('test');
  tt.addPermission('test.*');
  await tt.update();

  console.log(tt.hasPermission('test.a.b'));

  const s = new WanyneSession();

  s.account = tt.uuid;
  await s.create();

  const ss = await WanyneSession.of(s.sid);

  console.log(s.sid);
  console.log(ss.sid, ss.toJSON());

  const sa = await WanyneAccount.of(ss.account);
  console.log(sa.toJSON());
  console.log(sa.hasPermission('test.c.b'));

  //console.log(t.element.toJSON());
  //console.log(t.toJSON());

  //console.log(t.verifyPassword('1234'));

  //t.addPermission('test.*');

  //await t.update();

  console.log('-------- END --------');
}

init();
