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
    const user = findUserByEmail("user@example.com", testUsers).id
    const expectedOutput = "userRandomID";
    assert.equal(expectedOutput, user);
  });

  it('should return undefined if email doesn\'t exist', function() {
    const user = findUserByEmail("user@gmail.com", testUsers)
    const expectedOutput = false;
    assert.equal(expectedOutput, user);
  })
    
});

// describe("#shouldBuyCar()", function() {

//   it("should return false if it's a hatchback", function() {
//     const car = {
//       type: 'hatchback'
//     };
//     const shouldBuy = shouldBuyCar(car);
//     assert.isFalse(shouldBuy);
//   });

//   it("should return false when there are no details about the car", function() {
//     const car = {};
//     const shouldBuy = shouldBuyCar(car);
//     assert.isFalse(shouldBuy);
//   })