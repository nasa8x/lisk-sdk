/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

'use strict';

const ChainModule = require('../../../../../../src/modules/chain');
const { MockedInMemoryChannel } = require('../../../__mocks__/channel');
const {
	defaultTransactions,
	startDatabase,
	closeDatabase,
	storageConfig,
	cacheConfig,
	genesisConfig,
	genesisBlock,
} = require('../../../utils');

describe.only('Synchronous tasks', () => {
	const databaseName = 'synchronous_task';
	const channel = {
		publish: jest.fn(),
		once: jest.fn(),
		invoke: jest.fn((action, arg) => {
			if (action === 'app:getComponentConfig') {
				if (arg === 'storage') {
					return storageConfig(databaseName);
				}
				if (arg === 'cache') {
					return cacheConfig();
				}
			}
			return {};
		}),
		subscribe: jest.fn((event, listener) => {
			listener({});
		}),
	};

	let chainModule;
	let db;

	beforeAll(async () => {
		db = await startDatabase(databaseName);
		const options = {
			...ChainModule.defaults.default,
			constants: genesisConfig(),
			genesisBlock: genesisBlock(),
			registeredTransactions: defaultTransactions(),
		};
		chainModule = new ChainModule(options);
		await chainModule.load(channel);
	});

	afterAll(async () => {
		await chainModule.unload();
		await closeDatabase(db, databaseName);
	});

	describe('when "attempt to forge" synchronous task runs every 100 ms and takes 101 ms', () => {});
	describe('when "blockchain synchronization" synchronous task runs every 100 ms and takes 101 ms', () => {});
	describe('Forging and Sync process mutex', () => {
		it('should never start "attempt to forge" task when "blockchain synchronization" task is running', async () => {
			console.log(chainModule.chain.scope.modules.delegates);
		});

		it('should never start "blockchain synchronization" task when "attempt to forge" task is running', () => {});
	});
});
