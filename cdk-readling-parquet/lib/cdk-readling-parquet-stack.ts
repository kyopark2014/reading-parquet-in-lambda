import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as path from "path";
import * as logs from "aws-cdk-lib/aws-logs"
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';

const debug = false;
const nproc = 1;
const projectName = "reading-parquet"

export class CdkReadlingParquetStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // s3 
    const s3Bucket = new s3.Bucket(this, `storage-${projectName}`, {
      bucketName: `storage-${projectName}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
      versioned: false,
    });
    if (debug) {
      new cdk.CfnOutput(this, 'bucketName', {
        value: s3Bucket.bucketName,
        description: 'The nmae of bucket',
      });
      new cdk.CfnOutput(this, 's3Arn', {
        value: s3Bucket.bucketArn,
        description: 'The arn of s3',
      });
      new cdk.CfnOutput(this, 's3Path', {
        value: 's3://' + s3Bucket.bucketName,
        description: 'The path of s3',
      });
    }

    // SQS for S3 putItem
    const queueS3PutItem = new sqs.Queue(this, 'QueueS3PutItem', {
      visibilityTimeout: cdk.Duration.seconds(310),
      queueName: "queue-s3-putitem.fifo",
      fifo: true,
      contentBasedDeduplication: false,
      deliveryDelay: cdk.Duration.millis(0),
      retentionPeriod: cdk.Duration.days(2),
    });
    if (debug) {
      new cdk.CfnOutput(this, 'sqsS3PutItemUrl', {
        value: queueS3PutItem.queueUrl,
        description: 'The url of the S3 putItem Queue',
      });
    }

    // Lambda for s3 event
    const lambdaS3event = new lambda.Function(this, 'lambda-S3-event', {
      runtime: lambda.Runtime.NODEJS_16_X,
      functionName: "lambda-s3-event",
      code: lambda.Code.fromAsset("../lambda-s3-event"),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(10),
      logRetention: logs.RetentionDays.ONE_DAY,
      environment: {
        sqsUrl: queueS3PutItem.queueUrl,
      }
    });
    s3Bucket.grantReadWrite(lambdaS3event); // permission for s3
    queueS3PutItem.grantSendMessages(lambdaS3event); // permision for SQS putItem

    // s3 put/delete event source
    const s3PutEventSource = new lambdaEventSources.S3EventSource(s3Bucket, {
      events: [
        s3.EventType.OBJECT_CREATED_PUT,
        s3.EventType.OBJECT_REMOVED_DELETE
      ],
      filters: [
        { prefix: 'data/' },
      ]
    });
    lambdaS3event.addEventSource(s3PutEventSource);




  }
}
