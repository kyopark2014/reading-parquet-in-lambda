import json
import boto3
import os

s3 = boto3.client('s3')
sqs = boto3.client('sqs')
sqsUrl = os.environ.get('sqsUrl')
import awswrangler as wr

def lambda_handler(event, context):
    print(event)
    print(f'event: {json.dumps(event)}')
    print(f'cpu_count: {os.cpu_count()}')

    for record in event['Records']:
        print("record: ", record)

        receiptHandle = record['receiptHandle']
        print("receiptHandle: ", receiptHandle)

        body = record['body']
        print("body: ", body)

        jsonbody = json.loads(body)
        
        timestamp = jsonbody['timestamp']
        print("timestamp: ", timestamp)

        bucket = jsonbody['bucket']
        print("bucket: ", bucket)

        key = jsonbody['key']
        print("key: ", key)


        path=f"s3://{S3_OUTPUT_BUCKET_NAME.lower()}/{log_data['table_name'].lower()}/pr_account_id={log_data['account_id']}/pr_stat_date={log_data['stat_date'] }/"    
        # df = wr.s3.read_parquet(path=path, dataset=True)
        df = wr.s3.read_parquet(path=path, dataset=False, use_threads=4)
        # df = wr.s3.read_parquet(path=path, dataset=False, use_threads=True)
   
        print(f'{df.index}')

        # delete queue
        try:
            sqs.delete_message(QueueUrl=sqsUrl, ReceiptHandle=receiptHandle)
        except Exception as e:        
            print('Fail to delete the queue message: ', e)
            
    statusCode = 200     
    return {
        'statusCode': statusCode,
    }