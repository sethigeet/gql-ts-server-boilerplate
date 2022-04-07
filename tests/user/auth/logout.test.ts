import { Connection } from "typeorm";
import { internet, seed } from "faker";

import { createTypeormConnection } from "../../../src/modules/shared/utils";

import { User } from "../../../src/modules/user/userEntity";

import { TestClient } from "../utils";

seed(Date.now() + 4);
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

describe("Logout a user", () => {
  test("Logout when no user is logged in", async (done) => {
    const client = new TestClient(process.env.TEST_HOST);

    // Make sure that the user is logged out
    const meResponse = await client.me();
    expect(meResponse.data.me).toBeNull();

    const response = await client.logout();

    // make sure that the response from server was good
    expect(response.data.logout).toEqual(false);

    // make sure that the user is still logged out
    const meResponse2 = await client.me();
    expect(meResponse2.data.me).toBeNull();

    done();
  });

  test("Singlie session: Logout when a user is logged in", async (done) => {
    const client = new TestClient(process.env.TEST_HOST);

    // Login the user
    await client.login(correctUsername, correctPassword);

    // Make sure that the user is logged in
    const meResponse = await client.me();
    expect(meResponse.data.me).toBeTruthy();

    // logout the user
    const response = await client.logout();

    // make sure that the response from server was good
    expect(response.data.logout).toEqual(true);

    // make sure that the user was logged out
    const meResponse2 = await client.me();
    expect(meResponse2.data.me).toBeNull();

    done();
  });

  test("Multiple sessions: Logout when a user is logged in", async (done) => {
    const client1 = new TestClient(process.env.TEST_HOST);
    const client2 = new TestClient(process.env.TEST_HOST);

    // Login the user
    await client1.login(correctUsername, correctPassword);
    await client2.login(correctUsername, correctPassword);

    // Make sure that the user is logged in
    const meResponse1 = await client1.me();
    const meResponse2 = await client2.me();
    expect(meResponse1.data.me).toBeTruthy();
    expect(meResponse2.data.me).toBeTruthy();
    expect(meResponse1).toEqual(meResponse2);

    // logout the user
    const response = await client1.logoutAllSessions();

    // make sure that the response from server was good
    expect(response.data.logoutAllSessions).toEqual(true);

    // make sure that both users were logged out
    const meResponse3 = await client1.me();
    const meResponse4 = await client2.me();
    expect(meResponse3.data.me).toBeNull();
    expect(meResponse4.data.me).toBeNull();

    done();
  });
});
