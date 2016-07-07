var pg = require('pg');

module.exports = connection;

function connection(config){
  function builder(tableName){
    let columns = [];
    let sql = [];
    let bindings = [];
    let action = "select";
    return {
      toSQL: function () {
        let columnString, string;
        switch (action) {
          case 'select':
            columnString = columns.length ? columns.map(e => `"${e}"`).join(", ") : "*"
            string = `select ${columnString} from ${tableName}`
            if (sql.length) string += ` where ${sql.map(clause => `"${clause}" = ?`).join(" and ")}`
            break;

          case 'insert' :
            columnString = columns.map(e => `"${e}"`).join(", ")
            string = `insert into ${tableName} (${columnString}) values (${bindings.map(binding => "?").join(", ")})`
            break;
        }

        return { sql: string, bindings }
      },
      select: function(...cols){
        columns = columns.concat(cols)
        return this;
      },
      then: function(callback){
        let statement = this.toSQL();
        return builder.raw(statement.sql, statement.binds).then(callback)
      },
      where: function(args){
        for (var val in args) {
          if (args.hasOwnProperty(val)) {
            bindings.push(args[val]);
            sql.push(val)
          }
        }
        return this;
      },
      insert: function(args){
        action = "insert"
        for (var val in args) {
          if (args.hasOwnProperty(val)) {
            bindings.push(args[val]);
            columns.push(val)
          }
        }
        return this;
      }
    }
  }

  builder.raw = function (sql, binds = []) {
    return new Promise(function(resolve, reject){
      var client = new pg.Client(config);
      client.connect(function (err) {
        if (err) return reject(err);
        client.query(sql, binds, function (err, result) {
          if (err) return reject(err);
          resolve(result.rows);
        })
      })
    })
  }

  return builder;
}
