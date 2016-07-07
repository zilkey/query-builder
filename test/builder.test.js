const connection = require('../src/builder');
const expect = require('chai').expect;

describe("builder", function () {
  let builder;

  beforeEach(function () {
    builder = connection({database: "builder-test"});
  })

  describe("select", function () {

    it("builds a select statement", function () {
      let statement = builder('users').select('id', 'name');
      expect(statement.toSQL()).to.deep.eq({sql: 'select "id", "name" from users', bindings: []});
    });

    it("it allows selects to be chained", function(){
      let statement = builder('todos').select('id', 'name').select('foo');
      expect(statement.toSQL()).to.deep.eq({sql: 'select "id", "name", "foo" from todos', bindings: []});
    })
  })

  describe("where", function () {
    it("builds a where statement", function () {
      let statement = builder('users').where({name: 'Joe', age: 18});
      expect(statement.toSQL()).to.deep.eq({sql: `select * from users where "name" = ? and "age" = ?`, bindings: ['Joe', 18]});
    });
  })

  describe("insert", function () {
    it("builds an insert statement", function () {
      let statement = builder('users').insert({name: 'Joe', age: 18});
      expect(statement.toSQL()).to.deep.eq({sql: `insert into users ("name", "age") values (?, ?)`, bindings: ['Joe', 18]});
    });
  })

  describe("chaining", function () {
    it("allows clauses to be added in any order", function () {
      let statement = builder('users')
        .where({name: 'Tom'})
        .select("foo", "bar")
        .where({age: 34})

      expect(statement.toSQL()).to.deep.eq({sql: `select "foo", "bar" from users where "name" = ? and "age" = ?`, bindings: ['Tom', 34]});
    });
  })

  describe("then", function () {
    it("returns a promise which yields the results", function () {
      return builder.raw('insert into users (name, age) values ($1, $2)', ['John', 24])
        .then(function () {
          let statement = builder('users').select('name', 'age');
          return statement.then(function (rows) {
            expect(rows).to.deep.equal([
              {name: 'John', age: 24},
            ])
          })
        })
    });
  })

})
