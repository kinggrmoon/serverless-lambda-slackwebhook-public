'use strict';
let https = require('https');

exports.handler = (event, context, callback) => {
    // Sets request options
    var options = {
        host: 'hooks.slack.com',
        port: '443',
        path: '/services/TQRSWMLPR/B01D0R9F4QL/58yNAC8tH14wXLCnTo6YWYjT', //aws system manager prameter store 사용형태로 전환필요
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
    };

    // Sets the request body    
    var message = event.Records[0];
    console.log('Message received from SNS:', message);

    let subject = event.Records[0].Sns.Subject;
    let color = "#36a64f"
    //var message = event.Records[0].Sns.Message;
    let msg = event.Records[0].Sns.Message; 
    const timestamp =
        new Date(event.Records[0].Sns.Timestamp).getTime() / 1000;

    const slackMessage = {
        text: "*" + subject + "*",
        attachments: [
          {
            color: color,
            title: "CodePipline Notification",
            title_link: "https://www.naver.com",
            fields: [
              {
                title: "URL",
                value: "https://www.naver.com",
                short: false
              },
              {
                title: "Message",
                value: "`" + msg + "`",
                short: false
              }
            ],
            ts: timestamp
          }
        ]
    };

    const req = https.request(options, (res) => {
        let body = '';
        console.log('Status:', res.statusCode);
        console.log('Headers:', JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log('Successfully processed HTTPS response');
            // If we know it's JSON, parse it
            if (res.headers['content-type'] === 'application/json') {
                body = JSON.parse(body);
            }
            callback(null, body);
        });
    });
    req.on('error', callback);
    req.write(JSON.stringify(slackMessage));
    req.end();
};