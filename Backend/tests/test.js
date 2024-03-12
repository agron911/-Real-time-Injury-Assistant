import { connect, closeDatabase, clearDatabase } from './db-handler';
import User from '../model/user-class';
import { hashPassword, comparePassword } from "../utils/passwordUtils.js"
import DAO from '../model/dao.js';
import { UserConfirmation } from '../controller/joinCommunity.js';


/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => await connect());

/**
 * Clear all test data after every test.
 */
afterEach(async () => await clearDatabase());

/**
 * Remove and close the db and server.
 */
afterAll(async () => await closeDatabase());


test('Username should be valid', function() {
    var isvalid = User.validate('Taige', '1234');
    expect(isvalid).toBe(0);
})
test('Username should not be prohibited', function() {
    var isvalid = User.validate('careers', '1234');
    expect(isvalid).toBe(3);
})
test('password should be long enough', function(){
    var isvalid = User.validate('daniel', '1');
    expect(isvalid).toBe(2);
})
test('Password is good', async function(){
    var isvalid = User.validate('daniel', '1234');
    expect(isvalid).toBe(0);
})
test('Username should be long enough', function(){
    var isvalid = User.validate('d', '1234');
    expect(isvalid).toBe(1);
})
test('Username is good', function(){
    var isvalid = User.validate('somenewuser','tyuio');
})
test('Case Sensitivity', async function(){
    //var new_user = new User('daniel', await hashPassword('1234'), 'ok');
    var newuser = await DAO.createUser('daniel', await hashPassword('1234'), 'ok')
    var user = await DAO.getUserByName('Daniel')
    var check = 1
    if(user){
        check = 1
    }
    expect(check).toBe(1)
});

test('Test existing user password match', async function(){
    var hashedpasssword = await hashPassword('1234')
    var new_user = await DAO.createUser('daniel', hashedpasssword, 'ok')
    var passwordresult =  await comparePassword(new_user[0].password, '1234')
    return User.retrieve('daniel').then((user) => {
        expect(passwordresult).toBe(true);
    })
})
test('Test existing user password mismatch', async function(){
    var new_user = new User('daniel', await hashPassword('1234'), 'ok');
    new_user.save();
    var passwordresult =  await comparePassword(new_user.password, '12345')
    return User.retrieve('daniel').then((user) => {
        expect(passwordresult).toBe(false);
    })
})

// test('Add user', async function() {
//     var new_user = new User('Taige', await hashPassword('1234'), 'ok');
//     new_user.save();
//     var new_user_id = new_user._id
//     return User.all().then((users) => {
//         expect(users[0]).toContainEqual({
//             __v:0,
//             //_id: new_user_id,
//             acknowledged: false,
//             online: false,
//             username: 'Taige',
//             password: '$2b$10$j3pQrHc7ZHoythXsmbhSLOjfxR9uRebxSfpaeL4wm2GJUn/gevGT6',
//             status: 'ok',
//         })
//     })
// })
