const utcToIst = (userDob) => {
  const dateUTC = new Date(userDob);

  const utcHours = dateUTC.getHours();
  const utcMinutes = dateUTC.getMinutes();

  // adding 5 hours 30 mins to utc to adjust to IST time
  dateUTC.setHours(utcHours + 5);
  dateUTC.setMinutes(utcMinutes + 30);

  return dateUTC;
};

module.exports = utcToIst;
