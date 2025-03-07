import { Database, DatabaseClient } from '@wanyne/orm';
import { default as Auth, AuthAccount, AuthElement } from '../src/index.mjs';

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

  let t = new AuthAccount();

  t.username = 'test';

  await t.create('1234');

  const tt = await AuthAccount.ofUsername('test');
  tt.addPermission('test.*');
  await tt.update();

  await tt.createSession();
  await tt.createSession();

  const sess = await tt.readSessions();

  console.log(sess[0].element);
  console.log(sess[1].hasPermission('test.a.b'));

  await tt.clearSessions();

  console.log(await tt.readSessions());

  //console.log(t.element.toJSON());
  //console.log(t.toJSON());

  //console.log(t.verifyPassword('1234'));

  //t.addPermission('test.*');

  //await t.update();

  console.log(t.hasPermission('test.a.b'));

  console.log('-------- END --------');
}

init();
