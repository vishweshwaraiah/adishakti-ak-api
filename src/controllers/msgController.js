const NumsGroup = require('@api/models/nums_group');

const sendMessages = async (req, res) => {
  const myTwilioNumber = process.env.TWILIO_NUMBER;
  const accountSid = process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_SERVICE_SID;

  const numbers = req.body?.numbers;
  const messageContent = req.body?.message;

  const client = require('twilio')(accountSid, authToken);

  Promise.all(
    numbers.map((number) => {
      const numInd = '+91' + number;
      return client.messages.create({
        to: numInd,
        from: myTwilioNumber || serviceSid,
        body: messageContent,
      });
    })
  )
    .then((message) => {
      return res.status(200).json(message);
    })
    .catch((err) => {
      const errMessage = err.message;
      return res.status(err.status).json({ message: errMessage });
    });
};

const createGroup = async (req, res) => {
  try {
    const groupName = req.body?.groupName;
    const numberList = req.body?.numberList;

    if (!groupName || !numberList.length) {
      return res.status(400).json({ message: 'All the fields are required!' });
    }

    const newGroup = new NumsGroup({
      group_name: groupName,
      nums_group: numberList,
    });

    const savedItem = await newGroup.save();

    return res.status(200).json(savedItem);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(500).json({
        message: 'Duplicate name. Group with same name already exists!',
      });
    } else {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
};

const fetchNumsGroups = async (req, res) => {
  try {
    const groupDetails = await NumsGroup.find();
    return res.status(200).json(groupDetails);
  } catch (error) {
    const errMessage = err.message;
    return res.status(err.status).json({ message: errMessage });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const groupName = req.params.groupName;

    if (!groupName) {
      return res
        .status(400)
        .json({ message: 'Please send a proper Group name!' });
    }

    const deletedItem = await NumsGroup.findOneAndDelete({
      group_name: groupName,
    });

    return res.status(200).json(deletedItem);
  } catch (error) {
    return res.status(500).json({ message: 'Delete failed!' });
  }
};

module.exports = {
  sendMessages,
  createGroup,
  fetchNumsGroups,
  deleteGroup,
};
