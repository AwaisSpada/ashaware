const announcementSchema = require("../Models/announcement-schema");

//To create Announcement record
exports.createAnnouncement = async (query) => {
  return await announcementSchema.create(query);
};

//To Get Record Of All The Announcement
exports.getAllAnnouncements = async (query) => {
  return await announcementSchema.find(query).sort({ _id: -1 });
};

//To Get One Record of Announcement
exports.getAnnouncementDetails = async (query) => {
  return await announcementSchema.findOne(query);
};

// To Update the Announcement record
exports.updateAnnouncement = async (query, data) => {
  return await announcementSchema.findOneAndUpdate(query, data, {
    new: true,
  });
};
