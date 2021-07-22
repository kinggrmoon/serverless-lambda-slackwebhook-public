const https = require("https");
const AWS = require("aws-sdk");
const url = require("url");
// to get the slack hook url, go into slack admin and create a new "Incoming Webhook" integration
const slack_url = "https://hooks.slack.com/services/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";
const slack_req_opts = url.parse(slack_url);
slack_req_opts.method = "POST";
slack_req_opts.headers = { "Content-Type": "application/json" };
 
exports.handler = function(event, context) {
  (event.Records || []).forEach(function(rec) {
    if (rec.Sns) {
      var req = https.request(slack_req_opts, function(res) {
        if (res.statusCode === 200) {
          context.succeed("posted to slack");
        } else {
          context.fail("status code: " + res.statusCode);
        }
      });
 
      req.on("error", function(e) {
        console.log("problem with request: " + e.message);
        context.fail(e.message);
      });
 
      const codecommit = new AWS.CodeCommit({ apiVersion: "2015-04-13" });
      const records = JSON.parse(event.Records[0].Sns.Message).Records[0];
      let repository = records.eventSourceARN.split(":")[5];
      let commitId = records.codecommit.references[0].commit;
      let region = records.eventSourceARN.split(":")[3];
      const timestamp =
        new Date(event.Records[0].Sns.Timestamp).getTime() / 1000;
      let subject = event.Records[0].Sns.Subject;
 
      // Get the repository from the event and use it to get details of the commit
      codecommit.getCommit(
        {
          commitId: commitId,
          repositoryName: repository
        },
        function(err, data) {
          if (err) {
            context.fail(err);
          } else {
            console.log(data);
            const commit = data.commit;
            let color = "#36a64f";
            let branchName = records.codecommit.references[0].ref;
            let msg = commit.message;
            let authorName =
              commit.author.name + " <" + commit.author.email + ">";
            const slackMessage = {
              text: "*" + subject + "*",
              attachments: [
                {
                  color: color,
                  author_name: authorName,
                  title: "CodeCommit Notification",
                  title_link:
                    "https://ap-northeast-2.console.aws.amazon.com/codecommit/home?region=" +
                    region +
                    "#repository/" +
                    repository +
                    "/commit/" +
                    commitId,
                  fields: [
                    {
                      title: "Branch",
                      value: branchName,
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
 
            req.write(JSON.stringify(slackMessage)); // for testing: , channel: '@vadim'
 
            req.end();
          }
        }
      );
    }
  });
};