const aws = require('aws-sdk');
const sqs = new aws.SQS({apiVersion: '2012-11-05'});
const sqsUrl = process.env.sqsUrl;

exports.handler = async (event, context) => {
    //console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env));
    //console.log('## EVENT: ' + JSON.stringify(event));

    let response;
    for (let i in event.Records) {
        // Get the object from the event and show its content type
        const eventName = event.Records[i].eventName; // ObjectCreated:Put        
        console.log('eventName: ' + eventName);

        const bucket = event.Records[i].s3.bucket.name;
        const key = decodeURIComponent(event.Records[i].s3.object.key.replace(/\+/g, ' '));

        console.log('bucket: ' + bucket);
        console.log('key: ' + key);

        if (eventName == 'ObjectCreated:Put') {
            let date = new Date();
            const timestamp = Math.floor(date.getTime()/1000.0);
            console.log('timestamp: ', timestamp);

            const jsonData = {
                timestamp: timestamp,
                bucket: bucket,
                key: key
            };
            console.log('jsonData: ', JSON.stringify(jsonData));

            // push the event to SQS
            try {
                let params = {
                    // DelaySeconds: 10, // not allow for fifo
                    MessageDeduplicationId: key,
                    MessageAttributes: {},
                    MessageBody: JSON.stringify(jsonData), 
                    QueueUrl: sqsUrl,
                    MessageGroupId: "putItem"  // use single lambda for stable diffusion 
                };         
                console.log('params: '+JSON.stringify(params));
        
                let result = await sqs.sendMessage(params).promise();  
                console.log("result="+JSON.stringify(result));
            } catch (err) {
                console.log(err);
            }             
        }
    }

    return response;
};