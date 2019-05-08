const Bignum = require('browserify-bignum');
const { cryptography } = require('../../elements/lisk-cryptography');
const { TransferTransaction, TransactionError, validator, utils, constants } = require('../../elements/lisk-transactions');

const ENDORSE_TRANSACTION_TYPE = 9;

class Cashback extends TransferTransaction {
	applyAsset(store) {
		super.applyAsset(store);
		const sender = store.account.get(this.senderId);
		// const updatedSenderBalanceAfterBonus = +sender.balance + this.amount / 2;/
		const updatedSenderBalanceAfterBonus = new Bignum(sender.balance).add(this.amount / 2);
		const updatedSender = Object.assign({}, sender, {
			balance: updatedSenderBalanceAfterBonus.toString()
		});
		store.account.set(sender.address, updatedSender);
		return [];
	}

	// ToDo: undoAsset

	validateAsset() {
		validator.validate(exports.transferAssetFormatSchema, this.asset);
		const errors = [];
		if (this.type !== ENDORSE_TRANSACTION_TYPE) {
			errors.push(new TransactionError('Invalid type', this.id, '.type', this.type, ENDORSE_TRANSACTION_TYPE));
		}
		if (!utils.validateTransferAmount(this.amount.toString())) {
			errors.push(new TransactionError('Amount must be a valid number in string format.', this.id, '.amount', this.amount.toString()));
		}
		if (!this.fee.eq(constants.TRANSFER_FEE)) {
			errors.push(new TransactionError(`Fee must be equal to ${constants.TRANSFER_FEE}`, this.id, '.fee', this.fee.toString(), constants.TRANSFER_FEE));
		}
		if (!this.recipientId) {
			errors.push(new TransactionError('`recipientId` must be provided.', this.id, '.recipientId'));
		}
		try {
			utils.validateAddress(this.recipientId);
		} catch (error) {
			errors.push(new TransactionError(error.message, this.id, '.recipientId', this.recipientId));
		}
		if (this.recipientPublicKey) {
			const calculatedAddress = cryptography.getAddressFromPublicKey(this.recipientPublicKey);
			if (this.recipientId !== calculatedAddress) {
				errors.push(new TransactionError('recipientId does not match recipientPublicKey.', this.id, '.recipientId', this.recipientId, calculatedAddress));
			}
		}
		return errors;
	}
}

module.exports = Cashback;
