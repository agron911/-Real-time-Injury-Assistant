import bcrypt from 'bcrypt';
const saltRounds = 10;

async function hashPassword(password) {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    
    return null;
  }
};

async function comparePassword(hash, password) {
  try {
    const result = await bcrypt.compare(password, hash);
    return result;
  } catch (error) {
    return false;
  }
};
export { hashPassword, comparePassword };

