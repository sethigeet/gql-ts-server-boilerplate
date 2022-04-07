import { Connection } from "typeorm";
import { internet, seed } from "faker";

import { redisClient } from "../../../src/modules/shared/utils";
import { User } from "../../../src/modules/user/userEntity";
import { createTypeormConnection } from "../../../src/modules/shared/utils";
import { createConfirmEmailLink } from "../../../src/modules/user/auth/utils";
import { CONFIRM_EMAIL_PREFIX } from "../../../src/modules/user/auth/cosntants";
import { getInvalidTokenMessage } from "../../../src/modules/user/auth/utils/validation/errorMessages";

import { TestClient } from "../utils";

let conn: Connection;
let userId: string;

seed(Date.now() + 1);
const username = internet.userName();
const email = internet.email();

beforeAll(async (done) => {
  conn = await createTypeormConnection();
  const user = await User.create({
    email,
    username,
    password: "password",
  }).save();

  userId = user.id;
  done();
});

afterAll(async (done) => {
  await conn.close();
  done();
});

describe("Create and confirm a confirm email link for a new registered user", () => {
  test("Check with tampered link", async (done) => {
    const confirmEmailLink = await createConfirmEmailLink(
      process.env.TEST_HOST,
      userId,
      redisClient
    );

    const splitEmailLink = confirmEmailLink.split("/") as string[];
    const token = splitEmailLink[splitEmailLink.length - 1];

    const client = new TestClient(process.env.TEST_HOST);
    const response = await client.confirmEmail(token + "dhsagd");

    expect(response.data.confirmEmail.errors).toEqual([
      {
        field: "token",
        message: getInvalidTokenMessage(),
      },
    ]);
    expect(response.data.confirmEmail.user).toBeNull();

    const updatedUser = await User.findOne({ where: { username } });

    if (!updatedUser) {
      throw new Error("User was not even created!");
    }

    expect(updatedUser.confirmed).toEqual(false);

    const key = await redisClient.get(CONFIRM_EMAIL_PREFIX + token);
    expect(key).toEqual(updatedUser.id);

    done();
  });

  test("Check with correct link", async (done) => {
    const confirmEmailLink = await createConfirmEmailLink(
      process.env.TEST_HOST,
      userId,
      redisClient
    );

    const splitEmailLink = confirmEmailLink.split("/") as string[];
    const token = splitEmailLink[splitEmailLink.length - 1];

    const client = new TestClient(process.env.TEST_HOST);
    const response = await client.confirmEmail(token);

    expect(response.data.confirmEmail.errors).toBeNull();
    expect(response.data.confirmEmail.user?.username).toEqual(username);
    expect(response.data.confirmEmail.user?.email).toEqual(email);

    const updatedUser = await User.findOne({ where: { username } });

    if (!updatedUser) {
      throw new Error("User was not even created!");
    }

    expect(updatedUser.confirmed).toEqual(true);

    const key = await redisClient.get(CONFIRM_EMAIL_PREFIX + token);
    expect(key).toBeNull();

    done();
  });
});
