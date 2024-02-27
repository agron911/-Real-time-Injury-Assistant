import { connect, closeDatabase, clearDatabase } from './db-handler';
import { isValid, createUser } from '../model/User';

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
    var isvalid = isValid('about', '1234');
    expect(isvalid).toBe(3);
})
