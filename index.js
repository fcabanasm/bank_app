const serverless = require("serverless-http");
const express = require("express");
const app = express();
const { policyCalc } = require("./policy");
const { fetchPolicy } = require("./service");

app.get("/", async function (req, res) {
  const policy = await fetchPolicy();
  res.send(policyCalc(policy));
});

module.exports.handler = serverless(app);
