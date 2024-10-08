import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const certificate = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJRvFbyAnxb4ZHMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1ibDBsd2x4a3YxNGQxMGlmLnVzLmF1dGgwLmNvbTAeFw0yNDEwMDYw
MTA2MDhaFw0zODA2MTUwMTA2MDhaMCwxKjAoBgNVBAMTIWRldi1ibDBsd2x4a3Yx
NGQxMGlmLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAMbA9JEnUhSA+b7D1V6CclgM/DuOWBpEXznObZn0k6JyyXAtG2tX8OFa0GgA
5dpC/dx6yzJqHvK36qhNfrtQY8li26ZjA5oxDHrZNu6kHzkDftiI2QPgJNMjZCNW
KKMWBgmWqnMJJpsPwDpwqzvcPyCyXhJce+zfZscw/h3ju+CP4zv9CLQN/hEoBr21
dGLbTm0OqSgw2OcXrS7JVs0MxeircBV2+YPeVjUecliSNUytHX2PuLcf6sWlNwik
4A93NFadPN2zcGZ2hoqotxKJx/SRIz/gRApz5PFCR0W7D7ZIgCKORVoWmdp9xa2Q
PgIgI6deKodTaj0B/v5kevDzp8sCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUMYoIj9CcVrpeHEZ8ooTKCusYG7gwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQCntbH72hSjcp9biP0AqwgquOnFLMJWex03RkKAYWKP
tf+1fXOLDIRFCmjWXltmiUtdKLLSDFV6oZlZoRrO04mrZy1BhCtl8uWo1jK9Ra62
VVLfhYnz+dvOxpavlvn8qNBM76L3zqsVyOXBD8i13i8GQjaDLzxrDvey0xyNizJn
oOv3bzHahAhQplfFoaIbtOh+74XZuICStpeugItsP9+v6met8y8JyNKSV0vXRU2z
Y6nnA24uQL9ETVKrbGEAL7UbXYac98v1DBm1HyXdnBedQcNnFqGVP9e2GJFrbTy0
NgRgie725wfdBwyDqa2ddT0pF77VAy0kdUYrLSxGMBsS
-----END CERTIFICATE-----`

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  return jsonwebtoken.verify(token, certificate, { algorithms: ['RS256'] });
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
