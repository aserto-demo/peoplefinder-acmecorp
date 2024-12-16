// directory management API utility functions

// exports:
//   getUser(userId): get a user's profile
//   getUsers(): get all users
//   updateUser(userId): update a user's user and app metadata fields

const { toJson, DirectoryServiceV3, GetObjectsResponseSchema, SetObjectResponseSchema } = require("@aserto/aserto-node");
const { directoryServiceUrl, tenantId, directoryApiKey, directoryCertCAFile } = require("./config");

const directoryClient = DirectoryServiceV3({
  url: directoryServiceUrl,
  tenantId,
  apiKey: directoryApiKey,
  caFile: directoryCertCAFile,
});

// get a user's profile from the directory API
exports.getUser = async (_req, key) => {
  try {
     return await directoryClient.object({objectType: 'user', objectId: key});
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
      const jsonResponse = toJson(GetObjectsResponseSchema, response);
      users = users.concat(jsonResponse.results);
      const nextToken = response.page.nextToken;
      if (nextToken === "") {
        break;
      }
      page = { size: 100, token: nextToken };
    }
    return users
  } catch (error) {
    console.error(`getUsers: caught exception: ${error}`);
    return null;
  }
};

// update a user
exports.updateUser = async (req, user, payload) => {
  try {
    return await directoryClient.setObject({ object: payload });
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
