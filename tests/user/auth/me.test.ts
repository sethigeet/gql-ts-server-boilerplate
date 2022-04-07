import { Connection } from "typeorm";
import { internet, seed } from "faker";

import { createTypeormConnection } from "../../../src/modules/shared/utils";
import { User } from "../../../src/modules/user/userEntity";

import { TestClient } from "../utils";

seed(Date.now() + 3);
const correctUsername = internet.userName();
const correctEmail = internet.email();
const correctPassword = internet.password(7);

let conn: Connection;

beforeAll(async (done) => {
  // create the connection to the db
  conn = await createTypeormConnection();

  // create a user to test on
  await User.create({
    email: correctEmail,
    username: correctUsername,
    password: correctPassword,
    confirmed: true,
  }).save();

  done();
});

afterAll(async (done) => {
  // close the connection to the db
  await conn.close();

  done();
});

describe("Check the me query", () => {
  test("Check without loggin in", async (done) => {
    const client = new TestClient(process.env.TEST_HOST);

    const response = await client.me();

    expect(response.data.me).toBeNull();

    done();
  });

  test("Check after loggin in", async (done) => {
    const client = new TestClient(process.env.TEST_HOST);

    // Login the user before running further tests
    await client.login(correctUsername, correctPassword);

    // -----------------------------------------------

    const response = await client.me();
    expect(response.data.me).toBeTruthy();

    done();
  });
});
