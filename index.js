var AWS = require('aws-sdk');
var athena = new AWS.Athena();

const EQUALS_UTF8 = '%3D';

exports.handler = async (event) => {

	const newObjectKeys = event.Records.map(record => record.s3.object.key);

	const partitions = newObjectKeys.map(key => {
		const columns = key.split('/')
			.filter(column => column.includes(EQUALS_UTF8))
			.map(column => `${column.replace(EQUALS_UTF8, ' = \'')}'`);
		return `PARTITION (${columns.join(', ')})`;
	});

	const params = {
		QueryString: `ALTER TABLE ${process.env.DATABASE_NAME}.${process.env.TABLE_NAME} ADD IF NOT EXISTS ${partitions.join(' ')};`,
		QueryExecutionContext: {
			Database: process.env.DATABASE_NAME
		}
	};

	return await new Promise((resolve, reject) => {
		athena.startQueryExecution(params, function(err, data) {
			if (err) {
				reject(err);
			} else {
				resolve(`Query Executed: ${params.queryString}`);
			}
		});
	});

};
