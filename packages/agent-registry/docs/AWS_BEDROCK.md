# AWS Bedrock AgentCore Action Group

## Description

Defines a Bedrock Agent action group exposing Veil Protocol's quantum-resistant
payment signing/verification and Ghost private DeFi intent execution as
Lambda-backed actions, fronted by `@veil_/agent-registry`'s REST API
(`src/api`).

## CloudFormation

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: Veil Protocol action group for Bedrock AgentCore

Resources:
  VeilAgentActionGroup:
    Type: AWS::Bedrock::AgentActionGroup
    Properties:
      ActionGroupName: veil-protocol-actions
      AgentId: !Ref BedrockAgentId
      AgentVersion: DRAFT
      ActionGroupExecutor:
        Lambda: !GetAtt VeilAgentRegistryFunction.Arn
      ApiSchema:
        Payload: |
          openapi: 3.0.0
          info:
            title: Veil Protocol Agent Tools
            version: 1.0.0
          paths:
            /tools/sign-payment:
              post:
                operationId: veil_sign_payment
                description: >
                  Sign a quantum-resistant payment using ML-DSA-65
                  post-quantum cryptography via Veil Protocol's x402-pqc
                  standard.
                requestBody:
                  content:
                    application/json:
                      schema:
                        type: object
                        required: [amount, currency, recipient, network]
                        properties:
                          amount: { type: string }
                          currency: { type: string, enum: [USDC, ETH, VEIL] }
                          recipient: { type: string }
                          network: { type: string, enum: [base, base-sepolia] }
                responses:
                  '200':
                    description: Signed payment header
            /tools/verify-payment:
              post:
                operationId: veil_verify_payment
                description: Verify a quantum-resistant x402-pqc payment signature.
                requestBody:
                  content:
                    application/json:
                      schema:
                        type: object
                        required: [paymentHeader, expectedAmount, expectedRecipient]
                        properties:
                          paymentHeader: { type: string }
                          expectedAmount: { type: string }
                          expectedRecipient: { type: string }
                responses:
                  '200':
                    description: Verification result
            /tools/ghost-query:
              post:
                operationId: veil_ghost_query
                description: >
                  Query Ghost, Veil's private AI agent, for DeFi intent
                  parsing and execution planning inside sealed Octra Circles.
                requestBody:
                  content:
                    application/json:
                      schema:
                        type: object
                        required: [instruction]
                        properties:
                          instruction: { type: string }
                          context: { type: object }
                responses:
                  '200':
                    description: Parsed intent and execution plan
            /tools/encrypt-payload:
              post:
                operationId: veil_encrypt_payload
                description: Encrypt a payload using ML-KEM-768 post-quantum key encapsulation.
                requestBody:
                  content:
                    application/json:
                      schema:
                        type: object
                        required: [payload, recipientPublicKey]
                        properties:
                          payload: { type: string }
                          recipientPublicKey: { type: string }
                responses:
                  '200':
                    description: Encrypted payload

  VeilAgentRegistryFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: veil-agent-registry
      Runtime: nodejs20.x
      Handler: dist/api/lambda.handler
      Code:
        S3Bucket: !Ref DeploymentBucket
        S3Key: agent-registry.zip
      Timeout: 30
```

## Links

- https://veilprotocol.net
- https://veilprotocol.net/docs
