import { Connection } from "typeorm";
import { internet, seed } from "faker";

import {
  createTypeormConnection,
  redisClient,
} from "../../../src/modules/shared/utils";
import { createResetPasswordLink } from "../../../src/modules/user/auth/utils";
import {
  getIncorrectPasswordMessage,
  getInvalidTokenMessage,
  getMinLenMessage,
  getRequiredMessage,
} from "../../../src/modules/user/auth/utils/validation/errorMessages";
import { User } from "../../../src/modules/user/userEntity";

import { TestClient } from "../utils";

seed(Date.now() + 6);
const correctUsername = internet.userName();
const correctEmail = internet.email();
const correctPassword = internet.password(7);
const newPassword = internet.password(10);

let conn: Connection;
let userId: string;
let token: string;

beforeAll(async (done) => {
  // create the connection to the db
  conn = await createTypeormConnection();

  // create a user to test on
  const user = await User.create({
    email: correctEmail,
    username: correctUsername,
    password: correctPassword,
    confirmed: true,
  }).save();
  userId = user.id;

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

    const response = await client.changePassword("", "");

    expect(response.data.changePassword.errors).toEqual([
      {
        field: "token",
        message: getRequiredMessage("token"),
      },
      {
        field: "newPassword",
        message: getMinLenMessage("new password"),
      },
      {
        field: "newPassword",
        message: getRequiredMessage("new password"),
      },
    ]);
    expect(response.data.changePassword.successful).toBeNull();

    const loginResponse1 = await client.login(correctUsername, correctPassword);
    expect(loginResponse1.data.login.errors).toBeNull();
    expect(loginResponse1.data.login.user).toBeTruthy();

    const loginResponse2 = await client.login(correctUsername, newPassword);
    expect(loginResponse2.data.login.errors).toEqual([
      { field: "password", message: getIncorrectPasswordMessage() },
    ]);
    expect(loginResponse2.data.login.user).toBeNull();

    done();
  });

  test("Check with wrong credentials", async (done) => {
    const client = new TestClient(process.env.TEST_HOST);

    const response = await client.changePassword("dsaddsakl", newPassword);

    expect(response.data.changePassword.errors).toEqual([
      {
        field: "token",
        message: getInvalidTokenMessage(),
      },
    ]);
    expect(response.data.changePassword.successful).toEqual(false);

    const loginResponse1 = await client.login(correctUsername, correctPassword);
    expect(loginResponse1.data.login.errors).toBeNull();
    expect(loginResponse1.data.login.user).toBeTruthy();

    const loginResponse2 = await client.login(correctUsername, newPassword);
    expect(loginResponse2.data.login.errors).toEqual([
      { field: "password", message: getIncorrectPasswordMessage() },
    ]);
    expect(loginResponse2.data.login.user).toBeNull();

    done();
  });

  test("Check with correct credentials", async (done) => {
    const resetPasswordLink = await createResetPasswordLink(
      process.env.TEST_HOST,
      userId,
      redisClient
    );

    const splitEmailLink = resetPasswordLink.split("/") as string[];
    token = splitEmailLink[splitEmailLink.length - 1];

    const client = new TestClient(process.env.TEST_HOST);

    const response = await client.changePassword(token, newPassword);

    expect(response.data.changePassword.errors).toBeNull();
    expect(response.data.changePassword.successful).toEqual(true);

    const loginResponse1 = await client.login(correctUsername, correctPassword);
    expect(loginResponse1.data.login.errors).toEqual([
      { field: "password", message: getIncorrectPasswordMessage() },
    ]);
    expect(loginResponse1.data.login.user).toBeNull();

    const loginResponse2 = await client.login(correctUsername, newPassword);
    expect(loginResponse2.data.login.errors).toBeNull();
    expect(loginResponse2.data.login.user).toBeTruthy();

    done();
  });

  test("Check with a token that is already used", async (done) => {
    const client = new TestClient(process.env.TEST_HOST);

    const response = await client.changePassword(token, newPassword);
    expect(response.data.changePassword.errors).toEqual([
      {
        field: "token",
        message: getInvalidTokenMessage(),
      },
    ]);

    done();
  });
});
