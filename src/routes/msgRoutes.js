/**
 * Twilio Number: +13204138565
 */

const express = require('express');
const authorize = require('@api/_helpers/authorize');
const {
  sendMessages,
  createGroup,
  fetchNumsGroups,
  deleteGroup,
} = require('@api/controllers/msgController');

const msgRouter = express.Router();

msgRouter.post('/message', authorize(), sendMessages);

msgRouter.post('/creategroup', authorize(), createGroup);

msgRouter.get('/fetchgroups', authorize(), fetchNumsGroups);

msgRouter.delete('/delete/:groupName', authorize(), deleteGroup);

module.exports = msgRouter;
