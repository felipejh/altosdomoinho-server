import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'
import request from 'supertest'

const user = {
  name: 'user',
  email: 'user@test.com',
  password: '123456',
}

describe('Residents routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('yarn run knex migrate:rollback --all')
    execSync('yarn run knex migrate:latest')
  })

  it('Should it be possible to create an user', async () => {
    const response = await request(app.server).post('/users').send(user)

    expect(response.statusCode).toEqual(201)
    expect(response.body).toEqual(
      expect.objectContaining({
        name: user.name,
        email: user.email,
      }),
    )
  })
})
