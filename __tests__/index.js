const supertest = require("supertest")
const server = require("../api/server")
const db = require("../database/dbConfig")
const jwt = require("jsonwebtoken")
require("dotenv").config()

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
  it("GET /api", async ()=>{
    const res = await supertest(server).get("/api")
    expect(res.statusCode).toBe(200)
    expect(res.headers["content-type"]).toBe("application/json; charset=utf-8")
    expect(res.body.message).toBe("Welcome to our API")
  })

  it("POST /api/auth/register FAIL (username taken)", async () => {
    const res = await supertest(server)
      .post("/api/auth/register")
      .send({ username: "janedoe", password: "password" })
    expect(res.statusCode).toBe(409)
    expect(res.headers["content-type"]).toBe("application/json; charset=utf-8")
    expect(res.body.message).toBe("Username is already taken")
  })

  it("POST /api/auth/register", async () => {
    const res = await supertest(server)
      .post("/api/auth/register")
      .send({ username: "testuser", password: "thisisadumbtestpassword" })
    expect(res.statusCode).toBe(201)
    expect(res.headers["content-type"]).toBe("application/json; charset=utf-8")
    expect(res.body.id).toBeDefined()
    expect(res.body.username).toBe("testuser")
  })

  it("POST /api/auth/login FAIL (bad password)", async ()=> {
    const res = await supertest(server)
      .post("/api/auth/login")
      .send({ username: "janedoe", password: "password" })
    expect(res.statusCode).toBe(401)
    expect(res.headers["content-type"]).toBe("application/json; charset=utf-8")
    expect(res.body.message).toBe("Invalid username or password")
  })

  it("POST /api/auth/login FAIL (bad username)", async ()=> {
    const res = await supertest(server)
      .post("/api/auth/login")
      .send({ username: "testuser", password: "thisisadumbtestpassword" })
    expect(res.statusCode).toBe(401)
    expect(res.headers["content-type"]).toBe("application/json; charset=utf-8")
    expect(res.body.message).toBe("Invalid username or password")
  })

  it("POST /api/auth/login", async () => {
    const res = await supertest(server)
      .post("/api/auth/login")
      .send({ username: "janedoe", password: "abc12345" })
    expect(res.statusCode).toBe(200)
    expect(res.headers["content-type"]).toBe("application/json; charset=utf-8")
    expect(res.body.message).toBe("Welcome janedoe!")
    expect(res.headers["set-cookie"]).toBeDefined()
    const token = res.headers["set-cookie"][0].split(";")[0].split("=")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.username).toBe("janedoe")
  })
})

describe("jokes api integration tests", ()=> {
  it("GET /api/jokes FAIL (not logged in)", async ()=> {
    const res = await supertest(server).get("/api/jokes")
    expect(res.statusCode).toBe(401)
    expect(res.headers["content-type"]).toBe("application/json; charset=utf-8")
    expect(res.body.message).toBe("Not authorized")
  })

  it("GET /api/jokes", async ()=> {
    const res_login = await supertest(server)
      .post("/api/auth/login")
      .send({ username: "janedoe", password: "abc12345" })
    const res = await supertest(server)
      .get("/api/jokes")
      .set("Authorization", `Bearer ${res_login.headers["set-cookie"]}`)
    expect(res.statusCode).toBe(200)
    expect(res.headers["content-type"]).toBe("application/json; charset=utf-8")
    expect(res.body).toHaveLength(20)
    const sample_joke = {
      id: '0189hNRf2g',
      joke: "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later."
    }
    expect(res.body[0]).toEqual(sample_joke)
  })
})
