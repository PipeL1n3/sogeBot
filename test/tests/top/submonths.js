/* global describe it before */
const { getOwner } = require('../../../dest/helpers/commons/getOwner');

require('../../general.js');

const db = require('../../general.js').db;
const message = require('../../general.js').message;

const top = (require('../../../dest/systems/top')).default;

const { prepare } = require('../../../dest/helpers/commons/prepare');
const { User } = require('../../../dest/database/entity/user');
const assert = require('assert');
const { AppDataSource } = require('../../../dest/database');
const twitch = require('../../../dest/services/twitch.js').default;

// users
const owner = { userName: '__broadcaster__' };

describe('Top - !top submonths - @func2', () => {
  before(async () => {
    await db.cleanup();
    await message.prepare();
  });

  it ('Add 10 users into db and last user will don\'t have any submonths', async () => {
    for (let i = 0; i < 10; i++) {
      await AppDataSource.getRepository(User).save({
        userId: String(Math.floor(Math.random() * 100000)),
        userName: 'user' + i,
        subscribeCumulativeMonths: i * 100,
      });
    }
  });

  it('run !top submonths and expect correct output', async () => {
    const r = await top.submonths({ sender: { userName: getOwner() } });
    assert.strictEqual(r[0].response, 'Top 10 (submonths): 1. @user9 - 900 months, 2. @user8 - 800 months, 3. @user7 - 700 months, 4. @user6 - 600 months, 5. @user5 - 500 months, 6. @user4 - 400 months, 7. @user3 - 300 months, 8. @user2 - 200 months, 9. @user1 - 100 months, 10. @user0 - 0 months', owner);
  });

  it('add user0 to ignore list', async () => {
    const r = await twitch.ignoreAdd({ sender: owner, parameters: 'user0' });
    assert.strictEqual(r[0].response, prepare('ignore.user.is.added' , { userName: 'user0' }));
  });

  it('run !top submonths and expect correct output', async () => {
    const r = await top.submonths({ sender: { userName: getOwner() } });
    assert.strictEqual(r[0].response, 'Top 10 (submonths): 1. @user9 - 900 months, 2. @user8 - 800 months, 3. @user7 - 700 months, 4. @user6 - 600 months, 5. @user5 - 500 months, 6. @user4 - 400 months, 7. @user3 - 300 months, 8. @user2 - 200 months, 9. @user1 - 100 months', owner);
  });
});
