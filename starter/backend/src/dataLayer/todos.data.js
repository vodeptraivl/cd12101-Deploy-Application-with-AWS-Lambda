import AWS from "aws-sdk";

const docClient = new AWS.DynamoDB.DocumentClient();
const s3Client = new AWS.S3({ signatureVersion: 'v4' });

export async function createToDoData(todoItem) {
  console.log("Creating new todo item");

  const params = {
    TableName: process.env.TODOS_TABLE,
    Item: todoItem,
  };

  const result = await docClient.put(params).promise();
  console.log(result);

  return todoItem;
}

export async function updateToDoData(todoUpdate, todoId, userId) {
  console.log("Updating todo item");

  const params = {
    TableName: process.env.TODOS_TABLE,
    Key: {
      userId: userId,
      todoId: todoId,
    },
    UpdateExpression: "set #a = :a, #b = :b, #c = :c",
    ExpressionAttributeNames: {
      "#a": "name",
      "#b": "dueDate",
      "#c": "done",
    },
    ExpressionAttributeValues: {
      ":a": todoUpdate["name"],
      ":b": todoUpdate["dueDate"],
      ":c": todoUpdate["done"],
    },
    ReturnValues: "ALL_NEW",
  };

  const result = await docClient.update(params).promise();
  console.log("updateToDoData", result);
  const attributes = result.Attributes;

  return attributes;
}

export async function deleteToDoData(todoId, userId) {
  console.log("Deleting todo");

  const params = {
    TableName: process.env.TODOS_TABLE,
    Key: {
      userId: userId,
      todoId: todoId,
    },
  };

  const result = await docClient.delete(params).promise();
  console.log(result);
  return result;
}

export async function generateUploadUrlData(todoId) {
  console.log("Generating URL");

  const url = s3Client.getSignedUrl("putObject", {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: todoId,
    Expires: 1000,
  });
  console.log(url);
  return url;
}

export async function getAllToDoData(userId) {
  console.log("Getting all todo");

  const params = {
    TableName: process.env.TODOS_TABLE,
    KeyConditionExpression: "#userId = :userId",
    ExpressionAttributeNames: {
      "#userId": "userId",
    },
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  };

  const result = await docClient.query(params).promise();
  console.log(result);
  const items = result.Items;

  return items;
}

