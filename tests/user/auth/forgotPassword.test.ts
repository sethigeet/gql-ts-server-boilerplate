import { Connection } from "typeorm";
import { internet, seed } from "faker";

import { createTypeormConnection } from "../../../src/modules/shared/utils";
import {
  getDoesNotExistMessage,
  getEmailNotConfirmedMessage,
  getRequiredMessage,
} from "../../../src/modules/user/auth/utils/validation/errorMessages";
import { User } from "../../../src/modules/user/userEntity";

import { TestClient } from "../utils";

seed(Date.now() + 5);
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
  }).save();

  done();
});

afterAll(async (done) => {
  // close the connection to the db
  await conn.close();

  done();
});

describe("Request for reset password link for a user", () => {
  test("Check with missing credentials", async (done) => {
    const client = new TestClient(process.env.TEST_HOST);

    const response = await client.forgotPassword("");

    expect(response.data.forgotPassword.errors).toEqual([
      {
        field: "usernameOrEmail",
        message: getRequiredMessage("username/email"),
      },
    ]);
    expect(response.data.forgotPassword.successful).toBeNull();

    done();
  });

  test("Check with wrong credentials", async (done) => {
    const client = new TestClient(process.env.TEST_HOST);

    const response = await client.forgotPassword("dsaddsakl");

    expect(response.data.forgotPassword.errors).toEqual([
      {
        field: "usernameOrEmail",
        message: getDoesNotExistMessage("username/email"),
      },
    ]);
    expect(response.data.forgotPassword.successful).toEqual(false);

    done();
  });

  test("Check with correct username but without confirming the email", async (done) => {
    const client = new TestClient(process.env.TEST_HOST);

    const response = await client.forgotPassword(correctUsername);

    expect(response.data.forgotPassword.errors).toEqual([
      {
        field: "usernameOrEmail",
        message: getEmailNotConfirmedMessage(),
      },
    ]);
    expect(response.data.forgotPassword.successful).toEqual(false);

    done();
  });

  test("Check with correct email but without confirming the email", async (done) => {
    const client = new TestClient(process.env.TEST_HOST);

    const response = await client.forgotPassword(correctEmail);

    expect(response.data.forgotPassword.errors).toEqual([
      {
        field: "usernameOrEmail",
        message: getEmailNotConfirmedMessage(),
      },
    ]);
    expect(response.data.forgotPassword.successful).toEqual(false);

    done();
  });

  test("Check with correct username", async (done) => {
    // Confirm the user's email
    await User.update({ username: correctUsername }, { confirmed: true });

    const client = new TestClient(process.env.TEST_HOST);

    const response = await client.forgotPassword(correctUsername);

    expect(response.data.forgotPassword.errors).toBeNull();
    expect(response.data.forgotPassword.successful).toEqual(true);

    done();
  });

  test("Check with correct email", async (done) => {
    const client = new TestClient(process.env.TEST_HOST);

    const response = await client.forgotPassword(correctEmail);

    expect(response.data.forgotPassword.errors).toBeNull();
    expect(response.data.forgotPassword.successful).toEqual(true);

    done();
  });
});
