# Automatically Create Athena Table Partitions Using Lambda

### Summary:
Amazon Athena is an interactive query service that makes it easy to analyze data stored in Amazon S3 using standard SQL.  It is recommended to partition the S3 data in order to reduce the amount of data scanned per query.  This presents a problem as new partitions have to be manually added to the Athena table whenever data is added to S3.  This solution automates that task by invoking a Lambda function whenever an object is added to the S3 bucket.  The lambda function executes an Athena query that creates the table partition if it doesn't already exist.

### Prerequisites:
- S3 Bucket structured with hive partitioning
	- More info: https://docs.aws.amazon.com/athena/latest/ug/partitions.html
- An Athena table with the S3 Bucket as the data source and partitions set up

### How to use this code:
1. Create a new Lambda function using the code and permissions policy template in this repo
2. Add `DATABASE_NAME` and `TABLE_NAME` environment variables to the function
3. Set up your S3 bucket to trigger the function when an object is put in the bucket
	a. in the S3 console, navigate to your bucket's "Properties" tab
	b. In the Events section, select "Add notification"
		Name: `AddAthenaPartitionOnPut`
		Events: `PUT`
		Send to: `Lambda Function`
		Lambda: Select the lambda function created in step 1
4. In the Athena console, execute the following query `Run MSCK REPAIR TABLE tableName;`, replacing `tableName` with the name of your table.  This will add partions for all pre-existing data

### How to test:
1. Put new data to the S3 bucket in a new partition/folder
2. In the Athena console, go to the `History` tab to confirm the query to add the partition succeeded.  The query should start with `ALTER TABLE tableName ADD IF NOT EXISTS PARTITION...`
3. Confirm the State of the query is `Succeeded`
