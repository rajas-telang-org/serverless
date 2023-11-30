// import { Bucket, Storage } from "@google-cloud/storage";
const { Bucket, Storage } = require("@google-cloud/storage");
const SecretsManager = require("@google-cloud/secret-manager");
// Create a new instance of the Storage client
const storage = new Storage();

const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const Mailgun = require("mailgun.js");
const uuid = require("uuid");
const Formdata = require("form-data");
const axios = require("axios");
const dynamodb = new AWS.DynamoDB.DocumentClient();

const mailgunApiKey = process.env.Email_API;
const mailgunDomain = process.env.MAIL_DOMAIN;

async function handler(event, context) {
  // try {
  const mailgun = new Mailgun(Formdata);
  const mg = mailgun.client({ username: "api", key: mailgunApiKey });
  let message;
  console.log("Event:", event.Records[0]);
  try {
    message = JSON.parse(event.Records[0].Sns.Message);
    console.log("Message:", message);
  } catch (e) {
    console.error("Error parsing message:", e);
    // Handle the error appropriately
  }
  //const message = JSON.parse(event.Records[0].Sns.Message);
  console.log(message);
  const submissionUrl = message.Submission_URL;
  const userEmail = message.User_Email;

  const bucketName = process.env.GoogleBucket_Name;

  const secretArn = process.env.SECRET_ARN;
  const secretManager = new AWS.SecretsManager();
  const secretValue = await secretManager
    .getSecretValue({ SecretId: secretArn })
    .promise();

  const encodedSecret = secretValue.SecretString;
  const decodedSecret = Buffer.from(encodedSecret, "base64").toString("utf-8");
  // const storage = new Storage({
  //   projectId: process.env.project_id,
  //   credentials: decodedSecret,
  // });
  const credentials = JSON.parse(decodedSecret);
  console.log(typeof credentials + credentials);

  const storage = new Storage({
    projectId: process.env.project_id,
    credentials: credentials,
  });

  const Bucket = storage.bucket(bucketName);

  // Download the release from GitHub and store in GCS

  const githubReleaseUrl = submissionUrl;
  const fileName = message.User_Email + ".zip_" + Date.now();
  const fileloc = "ASSIGNMENT_SUBMISSIONS/" + fileName;

  console.log(fileloc);

  let dynamoDBParams = {
    TableName: process.env.tableName,
    Item: {
      id: uuid.v4(),
      email: message.User_Email,
      file_location: fileloc,
      status: "failed",
      timestamp: new Date().toISOString(),
    },
  };

  const file = Bucket.file(fileloc);
  try {
    const fileCon = await downloadFile(githubReleaseUrl);
    await file.save(fileCon);
    await mg.messages
      .create(mailgunDomain, {
        from: `csye6225 cloud  <Rajas@${mailgunDomain}>`,
        to: [message.User_Email],
        subject: "Assignment submitted successfully",
        text: `Your submission with url ${githubReleaseUrl} was successfully received and verified at ${fileloc}. \nThanks & Regards. \n Team CSYE6225 Cloud Computing`,
      })
      .then((msg) => {
        console.log(msg);
        dynamoDBParams.Item.status = "success";
      });
    const response = {
      statusCode: 200,
      body: JSON.stringify("Lambda function successfull"),
    };

    await dynamodb.put(dynamoDBParams).promise();
    return response;
  } catch (error) {
    await mg.messages.create(mailgunDomain, {
      from: `csye6225 cloud <rajas@${mailgunDomain}>`,
      to: [message.User_Email],
      subject: "Assignment submission failed",
      text: ` Please verify the URL ${githubReleaseUrl} and resubmit. \nThanks & Regards. \n Team CSYE6225 Cloud Computing`,
    });
    const response = {
      statusCode: 400,
      body: JSON.stringify("Invalid event source"),
    };
    await dynamodb.put(dynamoDBParams).promise();
    return response;
  }
  //console.log(`gs://${bucketName}/${filename} uploaded.`);

  // Email the user the status of download
}
// }
async function downloadFile(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data, "binary");
}
exports.handler = handler;
