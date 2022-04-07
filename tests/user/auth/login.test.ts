import { Connection } from "typeorm";
import { internet, seed } from "faker";

import { createTypeormConnection } from "../../../src/modules/shared/utils";

import {
  getDoesNotExistMessage,
  getEmailNotConfirmedMessage,
  getIncorrectPasswordMessage,
  getRequiredMessage,
  getAccountLockedMessage,
} from "../../../src/modules/user/auth/utils/validation/errorMessages";
import { User } from "../../../src/modules/user/userEntity";

import { TestClient } from "../utils";

seed(Date.now() + 2);
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

describe("Login a user", () => {
  test("Check with a username that is not registered", async (done) => {
    const client = new TestClient(process.env.TEST_HOST);

    const username = "dsahddsa";
    const password = correctPassword;

    const response = await client.login(username, password);

    expect(response.data.login.errors).toEqual([
      {
        field: "usernameOrEmail",
        message: getDoesNotExistMessage("username/email"),
      },
    ]);
    expect(response.data.login.user).toBeNull();

    done();
  });

  test("Check with a email that is not registered", async (done) => {
    const client = new TestClient(process.env.TEST_HOST);

    const email = "dasd@fas.cas";
    const password = correctPassword;

    const response = await client.login(email, password);

    expect(response.data.login.errors).toEqual([
      {
        field: "usernameOrEmail",
        message: getDoesNotExistMessage("username/email"),
      },
    ]);
    expect(response.data.login.user).toBeNull();

    done();
  });

  test("Check with a email that is not confirmed", async (done) => {
    const client = new TestClient(process.env.TEST_HOST);

    // Register the user before running further tests
    await User.create({
      email: correctEmail,
      username: correctUsername,
      password: correctPassword,
    }).save();

    // -----------------------------------------------

    const email = correctEmail;
    const password = correctPassword;

    const response = await client.login(email, password);

    expect(response.data.login.errors).toEqual([
      {
        field: "usernameOrEmail",
        message: getEmailNotConfirmedMessage(),
      },
    ]);
    expect(response.data.login.user).toBeNull();

    done();
  });

  test("Check with a username whose email is not confirmed", async (done) => {
    const client = new TestClient(process.env.TEST_HOST);

    const username = correctUsername;
    const password = correctPassword;

    const response = await client.login(username, password);

    expect(response.data.login.errors).toEqual([
      {
        field: "usernameOrEmail",
        message: getEmailNotConfirmedMessage(),
      },
    ]);
    expect(response.data.login.user).toBeNull();

    done();
  });

  test("Check with a correct email but wrong password", async (done) => {
    // Confirm the user's email before running further tests
    await User.update({ username: correctUsername }, { confirmed: true });

    // -----------------------------------------------
    const client = new TestClient(process.env.TEST_HOST);

    const email = correctEmail;
    const password = "dasgdjga";

    const response = await client.login(email, password);

    expect(response.data.login.errors).toEqual([
      { field: "password", message: getIncorrectPasswordMessage() },
    ]);
    expect(response.data.login.user).toBeNull();

    done();
  });

  test("Check with a correct username but wrong password", async (done) => {
    const client = new TestClient(process.env.TEST_HOST);

    const username = correctUsername;
    const password = "dasgdjga";

    const response = await client.login(username, password);

    expect(response.data.login.errors).toEqual([
      { field: "password", message: getIncorrectPasswordMessage() },
    ]);
    expect(response.data.login.user).toBeNull();

    done();
  });

  test("Check with missing credentials", async (done) => {
    const client = new TestClient(process.env.TEST_HOST);

    const username = "";
    const password = "";

    const response = await client.login(username, password);

    expect(response.data.login.errors).toEqual([
      {
        field: "usernameOrEmail",
        message: getRequiredMessage("username/email"),
      },
      { field: "password", message: getRequiredMessage("password") },
    ]);
    expect(response.data.login.user).toBeNull();

    done();
  });

  test("Check with a correct email and correct passowrd", async (done) => {
    const client = new TestClient(process.env.TEST_HOST);

    const username = correctUsername;
    const email = correctEmail;
    const password = correctPassword;

    const response = await client.login(email, password);

    expect(response.data.login.errors).toBeNull();
    expect(response.data.login.user?.username).toEqual(username);
    expect(response.data.login.user?.email).toEqual(email);
    expect(response.data.login.user?.password).toBeUndefined();

    done();
  });

  test("Check with a correct username and correct passowrd", async (done) => {
    const client = new TestClient(process.env.TEST_HOST);

    const username = correctUsername;
    const email = correctEmail;
    const password = correctPassword;

    const response = await client.login(username, password);

    expect(response.data.login.errors).toBeNull();
    expect(response.data.login.user?.username).toEqual(username);
    expect(response.data.login.user?.email).toEqual(email);
    expect(response.data.login.user?.password).toBeUndefined();

    done();
  });

  test("Check after locking the user's account", async (done) => {
    // Lock the user's account before running further tests
    await User.update(
      { username: correctUsername },
      { forgotPasswordLocked: true }
    );

    // -----------------------------------------------
    const client = new TestClient(process.env.TEST_HOST);

    const email = correctEmail;
    const password = correctPassword;

    const response = await client.login(email, password);

    expect(response.data.login.errors).toEqual([
      {
        field: "usernameOrEmail",
        message: getAccountLockedMessage("forgotPassword"),
      },
    ]);
    expect(response.data.login.user).toBeNull();

    done();
  });
});
