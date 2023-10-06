const express = require("express");

const router = express.Router();

const {
    createContact,
    updateContactApi,
    deleteContactApi,
    getContacts,
    sendSosMessage,
  } = require("../controllers/contact.js");

//Contact_routes

router.use("/userContact", createContact , updateContactApi, deleteContactApi, getContacts );

router.post("/sendSosMessage", sendSosMessage);

module.exports = router;

const contacts_routes = router;
