const { assert } = require('chai');

const findUserByEmail = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@email.com",
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = findUserByEmail("user@example.com", testUsers).id;
    const expectedOutput = "userRandomID";
    assert.equal(expectedOutput, user);
  });

  it('should return false if email doesn\'t exist', function() {
    const user = findUserByEmail("user@gmail.com", testUsers);
    const expectedOutput = false;
    assert.equal(expectedOutput, user);
  });

  it('should return false if email is an empty string', function() {
    const user = findUserByEmail("", testUsers);
    const expectedOutput = false;
    assert.equal(expectedOutput, user);
  });
});
