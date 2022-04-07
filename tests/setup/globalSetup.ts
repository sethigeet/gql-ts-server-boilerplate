import { AddressInfo } from "net";

import { startServer } from "../../src/modules/shared/utils";

module.exports = async function () {
  if (!process.env.TEST_HOST) {
    const server = await startServer();
    const { port } = server.address() as AddressInfo;
    process.env.TEST_HOST = `http://localhost:${port}/graphql`;
  }
};
