'use strict';
const https = require("https");
const AWS = require("aws-sdk");

/*
function getParameterFromSystemManager(callback) {
    
  // Fetches a parameter called REPO_NAME from SSM parameter store.
  // Requires a policy for SSM:GetParameter on the parameter being read.
  var params = {
    Name: '/management/messenger/slack', 
    WithDecryption: true
  };
  console.log('in the getParameterFromSystemManager function')
  var ssm = new AWS.SSM({apiVersion: '2014-11-06'});
  var request = ssm.getParameter(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);                 // an error occurred
    } else {
      console.log(data.Parameter.Value);           // successful response
    }
    callback();
  });
}
*/

exports.handler = (event, context, callback) => {
  /*
  var ssm = new AWS.SSM({apiVersion: '2014-11-06'});
  var params = {
    Name: '/management/messenger/slack', 
    WithDecryption: true
  };
  var request = ssm.getParameter(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);                 // an error occurred
    } else {
      console.log(data.Parameter.Value);           // successful response
    }
  });
  
  */
  /*
  const call_hook_path = getParameterFromSystemManager(function(){
    console.log('done');
    context.done(null, 'Hello from Lambda');
  });
  */

  const hook_path = process.env.SlackHookPath;

  var options = {
    host: 'hooks.slack.com',
    port: '443',
    path: hook_path,            //aws system manager prameter store 사용형태로 전환필요
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
   
  let records = event.Records[0];
  console.log('Message received from Records:', records);

  let color = "#36a64f"
  let EventSource = records.EventSource;

  const timestamp =
    new Date(event.Records[0].Sns.Timestamp).getTime() / 1000;

  //console.log('Message received from SNS :', typeof(event.Records[0].Sns));
  let sns = event.Records[0].Sns;
  //console.log('Message received from SNS:', sns);
  
  //console.log('Message received from SNS Message:', typeof(event.Records[0].Sns.Message));
  let msg = JSON.parse(event.Records[0].Sns.Message);
  let msg_s = event.Records[0].Sns.Message;
  //console.log('Message received from SNS Message:', typeof(msg_j));
  console.log('Message received from SNS Message:', msg);

  //console.log('Message received from SNS Message Detail:', typeof(event.Records[0].Sns.Message.detail));
  let detailType = msg.detailType;
  let region = msg.region;
  //console.log('Message received from SNS Message Detail:', detailType);
  //let detail = msg_j.detail.repositoryName;
  //console.log('Message received from SNS Message Detail:', detail);


  /******************************
  * codecommit
  ******************************/
  if ( msg_s.indexOf("aws:codecommit") != -1 ){
    console.log('aws.codecommit');
    let commitID = msg.detail.commitId;
    
    if ( JSON.stringify(msg.detail).indexOf("repositoryNames") != -1 ){
      var repository = msg.detail.repositoryNames;
    } else {
      var repository = msg.detail.repositoryName;
    }

    //console.log("cID:",commitID);
    //console.log("repo:",repository);

    const codecommit = new AWS.CodeCommit({ apiVersion: "2015-04-13" });
    codecommit.getCommit(
    {
      commitId: commitID,
      repositoryName: repository
    },
    function(err, data) {
      if (err) {
        context.fail(err);
      } else {
        if ( JSON.stringify(msg.detail).indexOf("referenceName") != -1 ){
          var referenceName= msg.detail.referenceName;
        } else {
          var referenceName = "src:  Dest: ";
        }
        
        // check Branch setting
        //if ( referenceName == "dev" ) {
        if ( referenceName == "dev" || referenceName.indexOf("feature/") != -1 ) {
          console.log('Not is Test or Main Branch(Branch Name: ', referenceName + ")");
          process.exit();
        }

        const commit = data.commit;
        let commitMsg = commit.message;
        let authorName = commit.author.name + " <" + commit.author.email + ">";
        const slackMessage = {
          text: "*" + EventSource + "*",
          attachments: [
          {
            color: color,
            author_name: authorName,
            title: "Notification:\n" + detailType,
            title_link:
              "https://ap-northeast-2.console.aws.amazon.com/codecommit/home?region=" +
              region +
              "#repository/" +
              repository +
              "/commit/" +
              commitID,
              fields: [
              {
                title: "Repo",
                value: repository,
                short: false
              },
              {
                title: "Branch",
                value: referenceName,
                short: false
              },
              {
                title: "Message",
                value: "`" + commitMsg + "`",
                short: false
              }],
              /*
              {
                title: "Message_Row",
                value: "`" + msg_s + "`",
                short: false
              }],
              */
            footer: "lambda",
            footer_icon: "https://platform.slack-edge.com/img/default_application_icon.png",
            ts: timestamp
          }]
        };
        const req = https.request(options, (res) => {
          let body = '';
          console.log('Status:', res.statusCode);
          console.log('Headers:', JSON.stringify(res.headers));
          res.setEncoding('utf8');
          res.on('data', (chunk) => body += chunk);
          res.on('end', () => {
            console.log('Successfully processed HTTPS response');
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
    });
  /******************************
  * codepipeline
  ******************************/
  } else if ( msg_s.indexOf("aws:codepipeline") != -1 ){
    console.log('aws.codepipeline');
    let state = msg.detail.state;
    let pipeline = msg.detail.pipeline;
    let stage = msg.detail.stage;
    const slackMessage = {
      text: "*" + EventSource + "*",
      attachments: [
      {
        color: color,
        title: "Notification: \n" + detailType,
        title_link:
          "https://ap-northeast-2.console.aws.amazon.com/codesuite/codepipeline/pipelines/" + 
          pipeline +
          "/view?region=" +
          region,
          fields: [
          {
            title: "Name",
            value: pipeline,
            short: false
          },
          {
            title: "Stage",
            value: stage,
            short: false
          },
          {
            title: "State",
            value: state,
            short: false
          }],
          /*
          {
            title: "Message",
            value: "`" + msg_s + "`",
            short: false
          }],
          */
        footer: "lambda",
        footer_icon: "https://platform.slack-edge.com/img/default_application_icon.png",
        ts: timestamp
      }]
    };
    const req = https.request(options, (res) => {
      let body = '';
      console.log('Status:', res.statusCode);
      console.log('Headers:', JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('Successfully processed HTTPS response');
        if (res.headers['content-type'] === 'application/json') {
          body = JSON.parse(body);
        }
        callback(null, body);
      });
    });
    req.on('error', callback);
    req.write(JSON.stringify(slackMessage));
    req.end();
  /*
  ******************************
  * ETC
  ******************************
  */
  } else {
    console.log('ETC');
    const slackMessage = {
      text: "*" + EventSource + "*",
      attachments: [
      {
        color: color,
        title: "Notification SNS",
        fields: [
        {
          title: "Message",
          value: "`" + msg_s + "`",
          short: false
        }],
        footer: "lambda",
        footer_icon: "https://platform.slack-edge.com/img/default_application_icon.png",
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