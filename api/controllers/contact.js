const users = require("../models/userModel.js");
const contacts = require("../models/contactModel.js");
const userChatGpts = require("../models/chatGptModel.js");
const { verifyToken } = require("../services/jwtService.js");
const express = require("express");
const router = express.Router();
//create Api for contact:

const createContact = router.post("/", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    await verifyToken(token);
    const { userID, firstname, lastname, phone, relation } = req.body;
    const user = await users.findById(userID).exec();
    if (user) {
      if (user.step === 1) {
        await users.findByIdAndUpdate(
          userID,
          { $set: { step: 2 } },
          { new: true }
        );
      }
      const newContact = await contacts.create({
        firstname,
        lastname,
        phone,
        relation,
        user,
      });
      return res
        .status(201)
        .json({ newContact, message: "Contact Added Successfully" });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error creating contact:", error);
    return res.status(500).json({ message: "Contact creation failed" });
  }
});

//get api for contacts:

const getContacts = router.get("/", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    await verifyToken(token);
    const { userID } = req.query;
    console.log("user from get conacts:", userID);
    const contact = await contacts.find({ user: userID });
    //console.log("user from conacts:", contact);
    if (contact) {
      console.log("user from conacts:", contact);
      res.status(200).json(contact);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//update Api for contact:

const updateContactApi = router.put("/", async (req, res) => {
  try {
    const { contactID, firstname, lastname, phone, relation } = req.body;
    const contact = await contacts.findById(contactID).exec();
    if (contact) {
      const newContact = await contacts.findByIdAndUpdate(
        contactID,
        {
          $set: {
            firstname: firstname,
            lastname: lastname,
            phone: phone,
            relation: relation,
          },
        },
        { new: true }
      );
      return res
        .status(201)
        .json({ newContact, message: "Contact updated Successfully" });
    } else {
      return res.status(404).json({ message: "contact not found" });
    }
  } catch (error) {
    console.error("Error updating contact:", error);
    return res.status(500).json({ message: "Contact not updated" });
  }
});

//delete api for contact

const deleteContactApi = router.delete("/", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    await verifyToken(token);
    const { contactID, userID } = req.query;
    // const { userID } = req.body;
    console.log(userID);
    const contact = await contacts.findById(contactID).exec();
    if (contact) {
      const deletedContact = await contacts
        .findByIdAndRemove({ _id: contactID })
        .exec();
      if (!deletedContact) {
        return res.status(404).json({ message: "Failed to delete contact" });
      }
      const remainingContacts = await contacts.find({ user: userID }).exec();
      console.log("rem: ", remainingContacts.length);
      console.log(userID);
      if (remainingContacts.length === 0) {
        const user = await users.findById({ _id: userID }).exec();
        console.log("user", user);
        if (user) {
          if (user.step === 2) {
            const updatedStep = await users.findByIdAndUpdate(
              userID,
              { $set: { step: 1 } },
              { new: true }
            );
            console.log("updated step: ", updatedStep);
          }
          return res
            .status(201)
            .json({ message: "step updated", remainingContacts });
        }
      }
      return res
        .status(204)
        .json({ message: "Contact deleted successfully", remainingContacts });
    }
  } catch (error) {
    console.error("Error updating contact:", error);
    return res.status(500).json({ message: "Contact not updated" });
  }
});

//sending msg as a response

const sendSosMessage = async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    await verifyToken(token);
    const { phone } = req.body;
    console.log("phone number: ", phone);
    const timeoutMillis = 1000;
    res.status(200).json({ message: "Request Received" });
    setTimeout(() => {
      if (!res.finished) {
        console.log("Timeout reached. Sending response...");
        res.status(200).json({ message: "Message Sent" });
      }
    }, timeoutMillis);
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ message: "Message not sent" });
  }
};
module.exports = {
  createContact,
  updateContactApi,
  deleteContactApi,
  getContacts,
  sendSosMessage,
};
