import { expect, it, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

const user = {
  name: 'user',
  email: 'user@test.com',
  password: '123456',
}

const signInCredentials = {
  email: user.email,
  password: user.password,
}

const resident = {
  name: 'John Doe',
  apt: '101',
  tower: 'Toscana',
  obs: 'Observation',
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

  it('should be able to create a new resident', async () => {
    await request(app.server).post('/users').send(user)

    const responseSignIn = await request(app.server)
      .post('/auth')
      .send(signInCredentials)

    const response = await request(app.server)
      .post('/residents')
      .set('Authorization', `Bearer ${responseSignIn.body.token}`)
      .send(resident)

    expect(response.statusCode).toEqual(201)
    expect(response.body).toEqual(expect.objectContaining(resident))
  })

  it('should be able to list all residents', async () => {
    await request(app.server).post('/users').send(user)

    const responseSignIn = await request(app.server)
      .post('/auth')
      .send(signInCredentials)

    await request(app.server)
      .post('/residents')
      .set('Authorization', `Bearer ${responseSignIn.body.token}`)
      .send(resident)

    const listResidentsResponse = await request(app.server)
      .get('/residents?filter={}&range=[0,9]&sort=["id","ASC"]')
      .set('Authorization', `Bearer ${responseSignIn.body.token}`)
      .expect(200)

    expect(listResidentsResponse.body).toEqual(
      expect.arrayContaining([expect.objectContaining(resident)]),
    )
  })

  it('should be able to get one resident', async () => {
    await request(app.server).post('/users').send(user)

    const responseSignIn = await request(app.server)
      .post('/auth')
      .send(signInCredentials)

    const createResidentResponse = await request(app.server)
      .post('/residents')
      .set('Authorization', `Bearer ${responseSignIn.body.token}`)
      .send(resident)

    const { id: residentId } = createResidentResponse.body

    const getOneResidentResponse = await request(app.server)
      .get(`/residents/${residentId}`)
      .set('Authorization', `Bearer ${responseSignIn.body.token}`)
      .expect(200)

    expect(getOneResidentResponse.body).toEqual(
      expect.objectContaining(resident),
    )
  })

  it('should be able to delete a resident', async () => {
    await request(app.server).post('/users').send(user)

    const responseSignIn = await request(app.server)
      .post('/auth')
      .send(signInCredentials)

    const createResidentResponse = await request(app.server)
      .post('/residents')
      .set('Authorization', `Bearer ${responseSignIn.body.token}`)
      .send(resident)

    const { id: residentId } = createResidentResponse.body

    const deleteResidentResponse = await request(app.server)
      .delete(`/residents/${residentId}`)
      .set('Authorization', `Bearer ${responseSignIn.body.token}`)
      .expect(200)

    const getOneResidentResponse = await request(app.server)
      .get(`/residents/${residentId}`)
      .set('Authorization', `Bearer ${responseSignIn.body.token}`)

    expect(deleteResidentResponse.text).toEqual(residentId)
    expect(getOneResidentResponse.body).toEqual(
      expect.not.objectContaining(resident),
    )
  })

  it('should be able to edit a resident', async () => {
    await request(app.server).post('/users').send(user)

    const responseSignIn = await request(app.server)
      .post('/auth')
      .send(signInCredentials)

    const createResidentResponse = await request(app.server)
      .post('/residents')
      .set('Authorization', `Bearer ${responseSignIn.body.token}`)
      .send(resident)

    const { id: residentId } = createResidentResponse.body

    const editResidentResponse = await request(app.server)
      .put(`/residents/${residentId}`)
      .set('Authorization', `Bearer ${responseSignIn.body.token}`)
      .send({
        name: 'Edited name',
        apt: '1',
        tower: 'tower',
        obs: 'obs',
      })
      .expect(200)

    expect(editResidentResponse.body).toEqual(
      expect.objectContaining({
        name: 'Edited name',
        apt: '1',
        tower: 'tower',
        obs: 'obs',
      }),
    )
  })
})
