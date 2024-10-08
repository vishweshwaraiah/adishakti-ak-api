const NumsGroup = require('@api/models/groupModel');
const axios = require('axios');

const sendMessages = (req, res) => {
  const numbers = req.body?.numbers;
  const messageContent = req.body?.message;

  const smsProviderAuthKey = process.env.SMSCOU_AUTH_KEY;
  const smsProviderAuthToken = process.env.SMSCOU_AUTH_TOKEN;
  let smsProviderApiUrl = process.env.SMSCOU_API_PATH;

  // Combine authKey and authToken
  const authsCombined = `${smsProviderAuthKey}:${smsProviderAuthToken}`;

  // Encode to Base64
  const base64Token = Buffer.from(authsCombined).toString('base64');

  const numList = numbers?.map((n) => n.phoneNumber);

  if (!numList.length)
    return res
      .status(404)
      .json({ message: 'At least one number is required!' });

  const bodyReq = {
    Text: 'User Admin login OTP is** - SMSCOU', // messageContent,
    SenderId: 'SMSCOU',
    DRNotifyUrl: '',
    DRNotifyHttpMethod: 'POST',
    Tool: 'API',
  };

  if (numList.length > 1) {
    apiUrl = `${smsProviderApiUrl}/${smsProviderAuthKey}/BulkSMSes/`;
    bodyReq.Numbers = numList;
  } else {
    apiUrl = `${smsProviderApiUrl}/${smsProviderAuthKey}/SMSes/`;
    bodyReq.Number = numList[0];
  }

  const requestHeaders = {
    Authorization: 'Basic ' + base64Token,
    'Content-Type': 'application/json',
  };

  axios({
    method: 'POST',
    url: apiUrl,
    headers: requestHeaders,
    data: JSON.stringify(bodyReq),
  })
    .then((response) => {
      return res.status(200).json(response.data);
    })
    .catch((error) => {
      const errMessage =
        error.response?.data?.Message || 'Something went wrong.!';
      return res
        .status(error.response?.status || 500)
        .json({ message: errMessage });
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

    return res.status(200).json({
      group: savedItem,
      message: 'Group ' + savedItem.group_name + ' created successfully!',
    });
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

const updateGroup = async (req, res) => {
  try {
    const groupName = req.body?.groupName;
    const groupId = req.body?.groupId;
    const numberList = req.body?.numberList;

    if (!groupName || !numberList.length || !groupId) {
      return res.status(400).json({ message: 'Wrong group data!' });
    }

    const filter = { _id: groupId };

    const update = {
      group_name: groupName,
      nums_group: numberList,
    };

    const options = {
      new: true,
    };

    const updatedGroup = await NumsGroup.findOneAndUpdate(
      filter,
      update,
      options
    );

    return res.status(200).json({
      group: updatedGroup,
      message: 'Group ' + groupName + ' created successfully!',
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const fetchNumsGroups = async (req, res) => {
  try {
    const groupDetails = await NumsGroup.find();
    return res.status(200).json(groupDetails);
  } catch (err) {
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
  updateGroup,
  fetchNumsGroups,
  deleteGroup,
};
