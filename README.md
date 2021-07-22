# management-messenger-slack
> Serverless framework, Lambda deploy

## 설명
- aws Lambda Srevice를 이용하여 SNS 트리거 발생시 Slack으로 알람을 전송하는 함수 구성
- 서버리스프레임워크를 통해 Lambda배포
- node.js로 Lambda구성 

## 환경
---
    $> { yum | apt-get | brew } install npm
    $> npm install serverless

## 실행
---
    $> npm i
    $> sls deploy --stage {stage} --aws-profile {aws profile}

## 설정
---
## serverless optional setting(serverless.yml)
    # webook path
    provider:
        environment:
            SlackHookPath: "{Slack WebHook URL: ex_ /services/TQRSWMLPRB01D0R9F4QL/58yNA******************}"

        # Parameter Store Use
        iamRoleStatements:
            - Effect: Allow
              Action: ssm:GetParameter
              Resource: arn:aws:ssm:*:{AWS_ID}:parameter{Parameter_Name: ex_ /management/messenger/slack}# serverless-lambda-slackwebhook-public
