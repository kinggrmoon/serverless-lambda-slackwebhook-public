# management-messenger-slack
Serverless framework, Lambda deploy 

### serverless optional setting
# webook path
provider:
    environment:
        SlackHookPath: "{Slack WebHook URL: ex_ /services/TQRSWMLPR/B01D0R9F4QL/58yNA******************}"

# Parameter Store Use
    iamRoleStatements:
        - Effect: Allow
          Action: ssm:GetParameter
          Resource: arn:aws:ssm:*:{AWS_ID}:parameter{Parameter_Name: ex_ /management/messenger/slack}# serverless-lambda-slackwebhook-public
