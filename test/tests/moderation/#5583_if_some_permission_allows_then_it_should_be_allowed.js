/* global */

const assert = require('assert');
const { AppDataSource } = require('../../../dest/database.js');

require('../../general.js');

const { Permissions } = require('../../../dest/database/entity/permissions');
const { defaultPermissions } = require('../../../dest/helpers/permissions/defaultPermissions');
const moderation = (require('../../../dest/systems/moderation')).default;
const db = require('../../general.js').db;
const variable = require('../../general.js').variable;
const message = require('../../general.js').message;
const user = require('../../general.js').user;

describe('#5583 - If lower permission allows, then it should be allowed - @func1', () => {
  after(async () => {
    await AppDataSource
      .createQueryBuilder()
      .delete()
      .from(Permissions)
      .where('1 = 1')
      .execute();
    await AppDataSource.getRepository(Permissions).insert({
      id:                 defaultPermissions.CASTERS,
      name:               'Casters',
      automation:         'casters',
      isCorePermission:   true,
      isWaterfallAllowed: true,
      order:              0,
      userIds:            [],
      excludeUserIds:     [],
      filters:            [],
    });
    await AppDataSource.getRepository(Permissions).insert({
      id:                 defaultPermissions.MODERATORS,
      name:               'Moderators',
      automation:         'moderators',
      isCorePermission:   true,
      isWaterfallAllowed: true,
      order:              1,
      userIds:            [],
      excludeUserIds:     [],
      filters:            [],
    });
    await AppDataSource.getRepository(Permissions).insert({
      id:                 defaultPermissions.SUBSCRIBERS,
      name:               'Subscribers',
      automation:         'subscribers',
      isCorePermission:   true,
      isWaterfallAllowed: true,
      order:              2,
      userIds:            [],
      excludeUserIds:     [],
      filters:            [],
    });
    await AppDataSource.getRepository(Permissions).insert({
      id:                 defaultPermissions.VIP,
      name:               'VIP',
      automation:         'vip',
      isCorePermission:   true,
      isWaterfallAllowed: true,
      order:              3,
      userIds:            [],
      excludeUserIds:     [],
      filters:            [],
    });
    await AppDataSource.getRepository(Permissions).insert({
      id:                 defaultPermissions.VIEWERS,
      name:               'Viewers',
      automation:         'viewers',
      isCorePermission:   true,
      isWaterfallAllowed: true,
      order:              4,
      userIds:            [],
      excludeUserIds:     [],
      filters:            [],
    });
  });

  before(async () => {
    await db.cleanup();
    await message.prepare();
    await user.prepare();

    await AppDataSource
      .createQueryBuilder()
      .delete()
      .from(Permissions)
      .where('1 = 1')
      .execute();
    await AppDataSource.getRepository(Permissions).insert({
      id:                 defaultPermissions.CASTERS,
      name:               'Casters',
      automation:         'casters',
      isCorePermission:   true,
      isWaterfallAllowed: true,
      order:              0,
      userIds:            [],
      excludeUserIds:     [],
      filters:            [],
    });
    moderation.__permission_based__cLinksEnabled[defaultPermissions.CASTERS] = true;

    await AppDataSource.getRepository(Permissions).insert({
      id:                 defaultPermissions.MODERATORS,
      name:               'Moderators',
      automation:         'moderators',
      isCorePermission:   true,
      isWaterfallAllowed: true,
      order:              1,
      userIds:            [],
      excludeUserIds:     [],
      filters:            [],
    });
    moderation.__permission_based__cLinksEnabled[defaultPermissions.MODERATORS] = true;
    await AppDataSource.getRepository(Permissions).insert({
      id:                 '262e0172-bf00-41d7-b363-346bea52838b',
      name:               'Test',
      automation:         'moderators',
      isCorePermission:   false,
      isWaterfallAllowed: true,
      order:              2,
      userIds:            [user.viewer.userId],
      excludeUserIds:     [],
      filters:            [],
    });
    await AppDataSource.getRepository(Permissions).insert({
      id:                 '162e0172-bf00-41d7-b363-346bea52838b',
      name:               'Test 2',
      automation:         'moderators',
      isCorePermission:   false,
      isWaterfallAllowed: true,
      order:              2,
      userIds:            [user.viewer.userId],
      excludeUserIds:     [],
      filters:            [],
    });
    await AppDataSource.getRepository(Permissions).insert({
      id:                 defaultPermissions.SUBSCRIBERS,
      name:               'Subscribers',
      automation:         'subscribers',
      isCorePermission:   true,
      isWaterfallAllowed: true,
      order:              3,
      userIds:            [],
      excludeUserIds:     [],
      filters:            [],
    });
    moderation.__permission_based__cLinksEnabled[defaultPermissions.SUBSCRIBERS] = true;

    await AppDataSource.getRepository(Permissions).insert({
      id:                 defaultPermissions.VIP,
      name:               'VIP',
      automation:         'vip',
      isCorePermission:   true,
      isWaterfallAllowed: true,
      order:              4,
      userIds:            [],
      excludeUserIds:     [],
      filters:            [],
    });
    moderation.__permission_based__cLinksEnabled[defaultPermissions.VIP] = true;

    await AppDataSource.getRepository(Permissions).insert({
      id:                 defaultPermissions.VIEWERS,
      name:               'Viewers',
      automation:         'viewers',
      isCorePermission:   true,
      isWaterfallAllowed: true,
      order:              5,
      userIds:            [],
      excludeUserIds:     [],
      filters:            [],
    });
    moderation.__permission_based__cLinksEnabled[defaultPermissions.VIEWERS] = true;
  });

  it (`Enable link moderation for Test group`, () => {
    moderation.__permission_based__cLinksEnabled['262e0172-bf00-41d7-b363-346bea52838b'] = true;
    moderation.__permission_based__cLinksEnabled['162e0172-bf00-41d7-b363-346bea52838b'] = true;
  });

  it(`Link 'http://www.foobarpage.com' should timeout`, async () => {
    assert(!(await moderation.containsLink({ sender: user.viewer, message: 'http://www.foobarpage.com' })));
  });

  it (`Disable link moderation for Test group`, () => {
    moderation.__permission_based__cLinksEnabled['262e0172-bf00-41d7-b363-346bea52838b'] = true;
    moderation.__permission_based__cLinksEnabled['162e0172-bf00-41d7-b363-346bea52838b'] = false;
  });

  it(`Link 'http://www.foobarpage.com' should not timeout`, async () => {
    assert((await moderation.containsLink({ sender: user.viewer, message: 'http://www.foobarpage.com' })));
  });
});
