const axios = require("axios");

const fetchPolicy = async () => {
  let response = await axios.get(
    "https://dn8mlk7hdujby.cloudfront.net/interview/insurance/policy"
  );
  return response.data.policy;
};

exports.fetchPolicy = fetchPolicy;
