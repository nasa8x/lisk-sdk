const { Application, genesisBlockDevnet } = require('../framework/src');
const Cashback = require('./transactions/cashback');

const app = new Application(genesisBlockDevnet, { app: { label: 'my-app', minVersion: '0.0.0', version: '0.0.0', protocolVersion: '0.0' } });

app.registerTransaction(9, Cashback);

app
	.run()
	.then(() => app.logger.info('App started...'))
	.catch(error => {
		console.error('Faced error in application', error);
		process.exit(1);
});