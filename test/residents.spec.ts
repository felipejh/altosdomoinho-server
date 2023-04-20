import { expect, it, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

const resident = {
  name: 'John Doe',
  apt: 101,
  tower: 'Toscana',
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
    const response = await request(app.server).post('/residents').send(resident)

    expect(response.statusCode).toEqual(201)
    expect(response.body).toEqual(expect.objectContaining(resident))
  })

  it('should be able to list all residents', async () => {
    await request(app.server).post('/residents').send(resident)

    const listResidentsResponse = await request(app.server)
      .get('/residents?filter={}&range=[0,9]&sort=["id","ASC"]')
      .expect(200)

    expect(listResidentsResponse.body).toEqual(
      expect.arrayContaining([expect.objectContaining(resident)]),
    )
  })

  it('should be able to get one resident', async () => {
    const createResidentResponse = await request(app.server)
      .post('/residents')
      .send(resident)

    const { id: residentId } = createResidentResponse.body

    const getOneResidentResponse = await request(app.server)
      .get(`/residents/${residentId}`)
      .expect(200)

    expect(getOneResidentResponse.body).toEqual(
      expect.objectContaining(resident),
    )
  })

  it('should be able to delete a resident', async () => {
    const createResidentResponse = await request(app.server)
      .post('/residents')
      .send(resident)

    const { id: residentId } = createResidentResponse.body

    const deleteResidentResponse = await request(app.server)
      .delete(`/residents/${residentId}`)
      .expect(200)

    const getOneResidentResponse = await request(app.server).get(
      `/residents/${residentId}`,
    )

    expect(deleteResidentResponse.text).toEqual(residentId)
    expect(getOneResidentResponse.body).toEqual(
      expect.not.objectContaining(resident),
    )
  })

  it('should be able to edit a resident', async () => {
    const createResidentResponse = await request(app.server)
      .post('/residents')
      .send(resident)

    const { id: residentId } = createResidentResponse.body

    const editResidentResponse = await request(app.server)
      .put(`/residents/${residentId}`)
      .send({
        name: 'Edited name',
      })
      .expect(200)

    expect(editResidentResponse.body).toEqual(
      expect.objectContaining({
        name: 'Edited name',
      }),
    )
  })
})
