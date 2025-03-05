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
  await Auth.init(database);

  let t = new AuthAccount();

  t.username = 'test';

  //await t.create('1234');

  t = await AuthAccount.of('66ef1683-f4e0-4c7c-bb09-d69c4c066c05');

  //console.log(t.element.toJSON());
  //console.log(t.toJSON());

  //console.log(t.verifyPassword('1234'));

  //t.addPermission('test.*');

  //await t.update();

  console.log(t.hasPermission('test.a.b'));

  console.log('-------- END --------');
}

init();
