const builder = require('../src/builder');
const expect = require('chai').expect;

describe("builder", function () {

  describe("select", function () {

    it("builds a select statement", function () {
      let statement = builder('users').select('id', 'name');
      expect(statement.toString()).to.eq('select "id", "name" from users');
    });

    it("it allows selects to be chained", function(){
      let statement = builder('todos').select('id', 'name').select('foo');
      expect(statement.toString()).to.eq('select "id", "name", "foo" from todos');

    })

  })

})
