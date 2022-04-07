import rp from "request-promise";
import { CoreOptions } from "request";

import { UserResponse } from "../../../src/modules/user/auth/UserResponse";
import { User } from "../../../src/modules/user/userEntity";
import { ResetPasswordResponse } from "../../../src/modules/user/auth/resetPassword/responseTypes";

export class TestClient {
  url: string;
  jar: ReturnType<typeof rp.jar>;

  constructor(url: string) {
    this.url = url;
    this.jar = rp.jar();
  }

  getOptions(query: string): CoreOptions {
    return {
      json: true,
      jar: this.jar,
      withCredentials: true,
      body: {
        query,
      },
    };
  }

  async register(
    username: string,
    email: string,
    password: string
  ): Promise<{ data: { register: UserResponse } }> {
    return rp.post(
      this.url,
      this.getOptions(`
mutation {
  register(credentials: {username: "${username}", email: "${email}", password: "${password}"}) {
    errors {
      field
      message
    }
    user {
      id
      email
      username
    }
  }
}
`)
    );
  }

  async login(
    usernameOrEmail: string,
    password: string
  ): Promise<{ data: { login: UserResponse } }> {
    return rp.post(
      this.url,
      this.getOptions(`
mutation {
  login(credentials: {usernameOrEmail: "${usernameOrEmail}", password: "${password}"}) {
    errors {
      field
      message
    }
    user {
      id
      email
      username
    }
  }
}
`)
    );
  }

  async confirmEmail(
    token: string
  ): Promise<{ data: { confirmEmail: UserResponse } }> {
    return rp.post(
      this.url,
      this.getOptions(`
mutation {
  confirmEmail(token: "${token}") {
    errors {
      field
      message
    }
    user {
      id
      email
      username
    }
  }
}
`)
    );
  }

  async me(): Promise<{ data: { me: User | undefined } }> {
    return rp.post(
      this.url,
      this.getOptions(`
query {
  me {
    id
    email
    username
  }
}
`)
    );
  }

  async logout(): Promise<{ data: { logout: boolean } }> {
    return rp.post(
      this.url,
      this.getOptions(`
mutation {
  logout 
}
`)
    );
  }

  async logoutAllSessions(): Promise<{ data: { logoutAllSessions: boolean } }> {
    return rp.post(
      this.url,
      this.getOptions(`
mutation {
  logoutAllSessions
}
`)
    );
  }

  async forgotPassword(
    usernameOrEmail: string
  ): Promise<{ data: { forgotPassword: ResetPasswordResponse } }> {
    return rp.post(
      this.url,
      this.getOptions(`
mutation {
  forgotPassword(credentials: {usernameOrEmail: "${usernameOrEmail}"}) {
    errors {
      field
      message
    }
    successful
  }
}
`)
    );
  }

  async changePassword(
    token: string,
    newPassword: string
  ): Promise<{ data: { changePassword: ResetPasswordResponse } }> {
    return rp.post(
      this.url,
      this.getOptions(`
mutation {
  changePassword(credentials: {token: "${token}", newPassword: "${newPassword}"}) {
    errors {
      field
      message
    }
    successful
  }
}
`)
    );
  }
}
