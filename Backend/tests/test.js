import { connect, closeDatabase, clearDatabase } from './db-handler';
import User from '../model/user-class';


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


test('Username should not be prohibited', function() {
    var isvalid = User.validate('Taige', '1234');
    expect(isvalid).toBe(0);
})

test('Add user', function() {
    var new_user = new User('Taige', '1234', 'ok');
    new_user.save();
    return User.all().then((users) => {
        expect(users).toContainEqual({
            username: 'Taige',
            password: '1234',
            status: 'ok',
        })
    })
})
