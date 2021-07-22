'use strict';
const https = require("https");
const AWS = require("aws-sdk");

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
  let message = event.Records[0];
  console.log('Message received from SNS:', message);

  let color = "#36a64f"
  let msg = event.Records[0].Sns.Message;
    
  const timestamp =
    new Date(event.Records[0].Sns.Timestamp).getTime() / 1000;
  var EventSource = event.Records[0].EventSource; 
  
  var snsType = event.Records[0].Sns.Message.detailType;
  
  if ( JSON.stringify(msg).indexOf("detailType") != -1 && JSON.stringify(msg).indexOf("CodeCommit") != -1){
    console.log('OK');
    var authorName = event.Records[0].Sns.Message.detail.callerUserArn;
    var detailType = event.Records[0].Sns.Message.detailType;
    var repositoryName = event.Records[0].Sns.Message.detail.repositoryName;
    var referenceName = event.Records[0].Sns.Message.detail.referenceName;
    var newmsg = JSON.stringify(msg);
    
    //make slackMessage
    const slackMessage = {
      text: "*" + EventSource + "*",
      attachments: [
      {
        color: color,
        author_name: authorName,
        title: "Notification " + detailType ,
        title_link: "https://www.naver.com",
        fields: [
        {
          title: "Repository",
          value: repositoryName,
          short: false
        },
        {
          title: "Branch",
          value: referenceName,
          short: false
        },
        {
          title: "Message",
          value: "`" + newmsg + "`",
          short: false
        }],
        ts: timestamp
      }]
    }
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

  }else{
    console.log('NONE');
    //make slackMessage 
    const slackMessage = {
      text: "*" + EventSource + "*",
      attachments: [
      {
        color: color,
        title: "Notification SNS",
        fields: [
        {
          title: "Message",
          value: "`" + msg + "`",
          short: false
        }],
        ts: timestamp
      }]
    }
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
  }
}