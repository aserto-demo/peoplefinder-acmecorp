// directory management API utility functions

// exports:
//   getUser(userId): get a user's profile
//   getUsers(): get all users
//   updateUser(userId): update a user's user and app metadata fields

const { DirectoryServiceV3 } = require("@aserto/aserto-node");
const { directoryServiceUrl, tenantId, directoryApiKey } = require("./config");

const directoryClient = DirectoryServiceV3({
  url: directoryServiceUrl,
  tenantId,
  apiKey: directoryApiKey,
});

// get a user's profile from the directory API
exports.getUser = async (_req, key) => {
  try {
    const user = await directoryClient.object({objectType: 'user', objectId: key});
    return user;
  } catch (error) {
    console.error(`getUser: caught exception: ${error}`);
    return null;
  }
};

// get users
exports.getUsers = async (req) => {
  try {
    let users = [];
    let page = { size: 100 };
    while (true) {
      let response = await directoryClient.objects({
        objectType: "user" ,
        page: page,
      });
      users = users.concat(response.results);
      const nextToken = response.page.nextToken;
      if (nextToken === "") {
        break;
      }
      page = { size: 100, token: nextToken };
    }
    return users;
  } catch (error) {
    console.error(`getUsers: caught exception: ${error}`);
    return null;
  }
};

// update a user
exports.updateUser = async (req, user, payload) => {
  try {
    const response = await directoryClient.setObject({ object: payload });
    return response;
  } catch (error) {
    console.error(`updateUser: caught exception: ${error}`);
    return null;
  }
};

// delete a user
exports.deleteUser = async (req, user) => {
  // not implemented
  return null;
};
