const supertest = require("supertest")
const server = require("../api/server")
const db = require("../database/dbConfig")

beforeEach(async ()=> {
  await db.seed.run()
})

afterAll(async ()=> {
  await db.seed.run()
  await db.destroy()
})

describe("simple basic test", ()=> {
  it("placeholder test", ()=> {
    expect(2+2).toBe(4)
  })
})

describe("authentication integration tests", ()=> {
  it("GET /", async ()=>{
    const res = await supertest(server).get("/")
    expect(res.statusCode).toBe(200)
    expect(res.headers["content-type"]).toBe("application/json; charset=utf-8")
    expect(res.body.message).toBe("Welcome to our API")
  })
})
