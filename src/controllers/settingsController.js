const AppSettings = require('@api/models/settingsModel');

const updateSettings = async (req, res) => {
  try {
    const appTheme = req.body?.appTheme;
    const menuStyle = req.body?.menuStyle;
    const userEmail = req.body?.userEmail;

    if (!appTheme || !menuStyle) {
      return res.status(400).json({ message: 'All the fields are required!' });
    }

    const filter = { userEmail: userEmail };

    const updates = {
      appTheme,
      menuStyle,
    };

    const options = {
      new: true,
    };

    const updatedSettings = await AppSettings.findOneAndUpdate(
      filter,
      updates,
      options
    );

    return res.status(200).json(updatedSettings);
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ message: "Invalid data or User doesn't exists!" });
  }
};

const fetchSettings = async (req, res) => {
  try {
    const userEmail = req.params?.userEmail;

    if (!userEmail) {
      return res.status(404).json({ message: 'Invalid user email id!' });
    }

    const appSettings = await AppSettings.findOne({ userEmail: userEmail });

    if (appSettings && appSettings.userEmail) {
      return res.status(200).json(appSettings);
    } else {
      const defaults = {
        appTheme: 'default',
        menuStyle: 'default',
        userEmail: userEmail,
      };

      const newEntry = new AppSettings(defaults);

      const defSettings = await newEntry.save();

      return res.status(200).json(defSettings);
    }
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ message: "Invalid data or User doesn't exists!" });
  }
};

module.exports = {
  updateSettings,
  fetchSettings,
};
