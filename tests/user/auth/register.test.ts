import { Connection } from "typeorm";
import { internet, seed } from "faker";

import { User } from "../../../src/modules/user/userEntity";
import {
  getInvalidEmailMessage,
  getMinLenMessage,
  getMustNotContainMessage,
  getRequiredMessage,
  getUnavailableMessage,
} from "../../../src/modules/user/auth/utils/validation/errorMessages";
import { createTypeormConnection } from "../../../src/modules/shared/utils";

import { TestClient } from "../utils";

seed(Date.now() + 0);
const correctUsername = internet.userName();
const correctEmail = internet.email();
const correctPassword = internet.password(7);

let conn: Connection;
beforeAll(async (done) => {
  conn = await createTypeormConnection();
  done();
});
afterAll(async (done) => {
  await conn.close();
  done();
});

describe("Register a user", () => {
  test("Check with correct credentials", async (done) => {
    const username = correctUsername;
    const email = correctEmail;
    const password = correctPassword;

    const client = new TestClient(process.env.TEST_HOST);

    const response = await client.register(username, email, password);

    expect(response.data.register.errors).toBeNull();
    expect(response.data.register.user?.username).toEqual(username);
    expect(response.data.register.user?.email).toEqual(email);
    expect(response.data.register.user?.password).toBeUndefined();

    const createdUser = await User.findOne({ where: { username } });

    if (!createdUser) {
      throw new Error("User was not created in the databse!");
    }

    expect(createdUser.email).toEqual(email);
    expect(createdUser.password).not.toEqual(password);

    done();
  });

  test("Check for duplicate username", async (done) => {
    const username = correctUsername;
    const email = "abcd@abcd.com";
    const password = correctPassword;

    const client = new TestClient(process.env.TEST_HOST);

    const response = await client.register(username, email, password);

    expect(response.data.register.errors).toEqual([
      { field: "username", message: getUnavailableMessage("username") },
    ]);
    expect(response.data.register.user).toBeNull();

    done();
  });

  test("Check for duplicate email", async (done) => {
    const username = "somenewuser";
    const email = correctEmail;
    const password = correctPassword;

    const client = new TestClient(process.env.TEST_HOST);

    const response = await client.register(username, email, password);

    expect(response.data.register.errors).toEqual([
      { field: "email", message: getUnavailableMessage("email") },
    ]);
    expect(response.data.register.user).toBeNull();

    done();
  });

  test("Check for username with @ symbol", async (done) => {
    const username = "abdad@";
    const email = correctEmail;
    const password = correctPassword;

    const client = new TestClient(process.env.TEST_HOST);

    const response = await client.register(username, email, password);

    expect(response.data.register.errors).toEqual([
      { field: "username", message: getMustNotContainMessage("username", "@") },
    ]);
    expect(response.data.register.user).toBeNull();

    done();
  });

  test("Check with short/wrong credentials", async (done) => {
    const username = "ab";
    const email = "sdad";
    const password = "bd";

    const client = new TestClient(process.env.TEST_HOST);

    const response = await client.register(username, email, password);

    expect(response.data.register.errors).toEqual([
      { field: "email", message: getInvalidEmailMessage() },
      { field: "username", message: getMinLenMessage("username") },
      { field: "password", message: getMinLenMessage("password") },
    ]);
    expect(response.data.register.user).toBeNull();

    done();
  });

  test("Check with missing credentials", async (done) => {
    const username = "";
    const email = "";
    const password = "";

    const client = new TestClient(process.env.TEST_HOST);

    const response = await client.register(username, email, password);

    expect(response.data.register.errors).toEqual([
      { field: "email", message: getRequiredMessage("email") },
      { field: "username", message: getRequiredMessage("username") },
      { field: "username", message: getMinLenMessage("username") },
      { field: "password", message: getRequiredMessage("password") },
      { field: "password", message: getMinLenMessage("password") },
    ]);
    expect(response.data.register.user).toBeNull();

    done();
  });
});
