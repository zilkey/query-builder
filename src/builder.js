var pg = require('pg');

module.exports = connection;

function connection(config){
  function builder(tableName){
    let columns = [];
    let sql = [];
    let bindings = [];
    let action = "select";
    let mappings = { select, insert, update }

    return {
      toSQL: function () {
        return mappings[action]()
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
        populate(args, bindings, sql);
        return this;
      },
      insert: function(args){
        action = "insert"
        populate(args, bindings, columns);
        return this;
      },
      update: function(args, whereClause){
        action = "update"
        populate(args, bindings, columns);
        return this.where(whereClause)
      }
    }

    function populate(object, valueBucket, keyBucket) {
      for (var val in object) {
        if (object.hasOwnProperty(val)) {
          valueBucket.push(object[val]);
          keyBucket.push(val)
        }
      }
    }

    function select() {
      let columnString, string;
      columnString = columns.length ? columns.map(e => `"${e}"`).join(", ") : "*"
      string = `select ${columnString} from ${tableName}`
      if (sql.length) string += ` where ${sql.map(clause => `"${clause}" = ?`).join(" and ")}`
      return { sql: string, bindings }
    }

    function insert() {
      let columnString, string;
      columnString = columns.map(e => `"${e}"`).join(", ")
      string = `insert into ${tableName} (${columnString}) values (${bindings.map(binding => "?").join(", ")})`
      return { sql: string, bindings }
    }

    function update() {
      let setString = columns.map(e => `"${e}" = ?`).join(", ")
      let whereString
      if (sql.length) whereString = ` where ${sql.map(clause => `"${clause}" = ?`).join(" and ")}`
      string = `update ${tableName} set ${setString}${whereString}`
      return { sql: string, bindings }
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
