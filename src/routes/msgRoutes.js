/**
 * Twilio Number: +13204138565
 */

const express = require('express');
const {
  sendMessages,
  createGroup,
  fetchNumsGroups,
  deleteGroup,
} = require('@api/controllers/msgController');

const msgRouter = express.Router();

msgRouter.post('/message', sendMessages);

msgRouter.post('/creategroup', createGroup);

msgRouter.get('/fetchgroups', fetchNumsGroups);

msgRouter.delete('/delete/:groupName', deleteGroup);

module.exports = msgRouter;
