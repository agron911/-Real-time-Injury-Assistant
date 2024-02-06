const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.hashPassword = async function(password){
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    console.log('password', password, salt)
    const passwordHash = await bcrypt.hash(password, salt);
    return passwordHash;
  } catch (error) {
    console.log("Hashing error", error);
    return null;
  }
  bcrypt
    .genSalt(saltRounds)
    .then((salt) => {
      console.log("Salt: ", salt);
      return bcrypt.hash(password, salt);
    })
    .then((hash) => {
      console.log("Hash: ", hash);
      return hash;
    })
    .catch((err) => console.error(err.message));
};

exports.comparePassword = async (hash, password) => {
  try {
    const result = await bcrypt.compare(password, hash);
    return result;
  } catch (error) {
    return false;
  }

  bcrypt
    .compare(password, hash)
    .then((res) => {
      console.log(res); //
      return true;
    })
    .catch((err) => {
      console.error(err.message);
      return false;
    });
};
