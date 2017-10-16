/*
 * LiskHQ/lisky
 * Copyright © 2017 Lisk Foundation
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
 *
 */
import cryptoModule from '../utils/cryptoModule';
import { createCommand } from '../utils/helpers';
import {
	getStdIn,
	getPassphrase,
	getFirstLineFromString,
} from '../utils/input';
import commonOptions from '../utils/options';

const PASSWORD_DISPLAY_NAME = 'your password';

const description = `Encrypt your secret passphrase under a password.

	Example: encrypt passphrase
`;

const outputPublicKeyOption = [
	'--output-public-key',
	'Includes the public key in the output. This option is provided for the convenience of node operators.',
];

const handleInput = outputPublicKey => ([passphrase, password]) => {
	const cipherAndIv = cryptoModule.encryptPassphrase(passphrase, password);
	return outputPublicKey
		? Object.assign({}, cipherAndIv, {
			publicKey: cryptoModule.getKeys(passphrase).publicKey,
		})
		: cipherAndIv;
};

const actionCreator = vorpal => async ({ options }) => {
	const {
		passphrase: passphraseSource,
		password: passwordSource,
		'output-public-key': outputPublicKey,
	} = options;

	return getStdIn({
		passphraseIsRequired: passphraseSource === 'stdin',
		dataIsRequired: passwordSource === 'stdin',
	})
		.then(stdIn => getPassphrase(vorpal, passphraseSource, stdIn.passphrase, { shouldRepeat: true })
			.then(passphrase => getPassphrase(
				vorpal,
				passwordSource,
				getFirstLineFromString(stdIn.data),
				{ displayName: PASSWORD_DISPLAY_NAME, shouldRepeat: true },
			)
				.then(password => [passphrase, password]),
			),
		)
		.then(handleInput(outputPublicKey));
};

const encryptPassphrase = createCommand({
	command: 'encrypt passphrase',
	description,
	actionCreator,
	options: [
		outputPublicKeyOption,
		commonOptions.passphrase,
		commonOptions.password,
	],
	errorPrefix: 'Could not encrypt passphrase',
});

export default encryptPassphrase;
