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

  describe("then", function () {
    it("returns a promise which yields the results", function (done) {
      var pg = require('pg');
      var client = new pg.Client({
        database: 'builder-test',
      });
      client.connect(function (err) {
        if (err) throw err;
        client.query('insert into users (name, age) values ($1, $2)', ['John', 24], function (err, result) {
          if (err) throw err;

          let statement = builder('users').select('name', 'age');
          statement.then(function (rows) {
            expect(rows).to.deep.equal([
              {name: 'John', age: 24},
            ])
            done()
          }, done)

        });
      });
    });
  })



})
