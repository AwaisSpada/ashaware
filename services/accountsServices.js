const accountsServices = require("../Models/accounts-schema");
// To Cretae Account Record
exports.createAccount = async (query) => {
  return await accountsServices.create(query);
};
// To Get All Accounts Record
exports.getAllAccounts = async (query) => {
  return await accountsServices.find(query).sort({ _id: -1 });
};
// To Get One Record
exports.getAccountById = async (query) => {
  return await accountsServices.findOne(query);
};
// To Update Record
exports.updateAccount = async (query, data) => {
  return await accountsServices.findByIdAndUpdate(query, data, {
    new: true,
  });
};
// To Delete Account
exports.accountDelete = async (query) => {
  return await accountsServices.findByIdAndRemove(query);
};
