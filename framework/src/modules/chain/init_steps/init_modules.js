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

const domain = require('domain');

const modulesList = {
	blocks: '../submodules/blocks',
	delegates: '../submodules/delegates',
	rounds: '../submodules/rounds',
	loader: '../submodules/loader',
	multisignatures: '../submodules/multisignatures',
	peers: '../submodules/peers',
	signatures: '../submodules/signatures',
	transactions: '../submodules/transactions',
	transport: '../submodules/transport',
	processTransactions: '../submodules/process_transactions',
};

module.exports = async scope => {
	const moduleNames = Object.keys(modulesList);

	const modulePromises = moduleNames.map(
		moduleName =>
			new Promise((resolve, reject) => {
				const moduleDomain = domain.create();
				const moduleCb = (err, object) => {
					if (err) return reject(err);

					return resolve(object);
				};

				moduleDomain.on('error', err => {
					scope.components.logger.fatal(`Domain ${moduleName}`, {
						message: err.message,
						stack: err.stack,
					});
				});

				moduleDomain.run(() => {
					scope.components.logger.debug('Loading module', moduleName);
					// eslint-disable-next-line import/no-dynamic-require
					const DynamicModule = require(modulesList[moduleName]);
					return new DynamicModule(moduleCb, scope);
				});
			})
	);

	const resolvedModules = await Promise.all(modulePromises);
	const modules = resolvedModules.reduce(
		(prev, module, index) => ({ ...prev, [moduleNames[index]]: module }),
		{}
	);

	scope.bus.registerModules(modules);

	return modules;
};
