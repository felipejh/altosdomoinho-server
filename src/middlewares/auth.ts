import jwt from 'jsonwebtoken'

import authConfig from '../config/auth'
import { FastifyReply, FastifyRequest } from 'fastify'

const jwtVerifyPromisified = (token: string, secret: string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, {}, (err, payload) => {
      if (err) {
        reject(err)
      } else {
        resolve(payload)
      }
    })
  })
}

export default async (request: FastifyRequest, response: FastifyReply) => {
  const authHeader = request.headers.authorization

  if (!authHeader) {
    return response.status(401).send('Token not provided')
  }

  const [, token] = authHeader.split(' ')

  try {
    const secret = authConfig.secret
    await jwtVerifyPromisified(token, secret)
  } catch {
    response.status(401).send({ error: 'Invalid token' })
  }
}
