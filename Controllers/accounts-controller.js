const messageUtil = require("../utilities/message");
const accountsServices = require("../services/accountsServices");

const {
  successResponse,
  serverErrorResponse,
} = require("../utilities/response");

class Accounts {
  addAccount = async (req, res) => {
    let account;

    try {
      //create account record
      account = await accountsServices.createAccount({
        ...req.body,
      });

      //responses
      successResponse(res, messageUtil.create, account); //response success
    } catch (err) {
      serverErrorResponse(res, err); //response error
    }
  };
}

module.exports = new Accounts();
