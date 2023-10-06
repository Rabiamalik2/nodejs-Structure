const OpenAI = require("openai");
const express = require("express");
const router = express.Router();
const users = require("../models/userModel.js");
const userChatGpts = require("../models/chatGptModel.js");
const { verifyToken } = require("../services/jwtService.js");
const { v4: uuidv4 } = require("uuid");

const CreatemessageApi = router.post("/", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    await verifyToken(token);
    const { userID, messages } = req.body;
    console.log("Request Body:", req.body);
    const uuid = uuidv4();
    console.log("Generated UUID:", uuid);
    const openai = new OpenAI({
      apiKey: "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",
    });
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: messages.text }],
    });
    const msg = {
      _id: uuid,
      createdAt: new Date(),
      text: completion.choices[0].message.content,
      user: {
        _id: completion.id,
        step: "0",
        questionaireKey: "false",
        firstname: "Chat",
        lastname: "Gpt",
        phone: "03122838823",
        email: "chatgpt@gmail.com",
        password: "password",
        imagePath: "null",
        dob: "29/9/11",
        gender: "null",
        homeAddress: "null",
      },
    };
    const user = await users.findById(userID).exec();
    if (user) {
      const msgUser = await userChatGpts.findOne({ user });
      // console.log("msgUSer", msgUser);
      if (msgUser) {
        const newDate = new Date();
        await userChatGpts.findOneAndUpdate(
          msgUser._id,
          {
            $push: {
              messages: [messages, msg],
            },
          },
          { new: true }
        );
        res.status(201).json({ messages, msg });
        console.log(completion);
        console.log("updatedMsgs", msg);
      } else if (!msgUser) {
        await userChatGpts.create({
          messages: [messages, msg],
          user,
        });
        // console.log("my messages:", messages);
        return res
          .status(201)
          .json({ messages, msg, message: "record Added Successfully" });
      }
    }
  } catch (error) {
    console.error("Error storing messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const getAllMsgs = router.get("/", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    await verifyToken(token);
    const { userID } = req.query;
    const user = await users.findById(userID).exec();
    if (user) {
      const allMsgs = await userChatGpts.find({
        user,
      });
      console.log("allMsgs: ", allMsgs);
      res.json(allMsgs);
    } else {
      return res.status(401).send("User not found");
    }
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = {
  CreatemessageApi,
  getAllMsgs,
};
