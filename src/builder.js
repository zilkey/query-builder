var pg = require('pg');

module.exports = connection;

function connection(config){
  function builder(tableName){
    let columns = [];

    return {
      toString: function () {
        return `select ${columns.map(e => `"${e}"`).join(", ")} from ${tableName}`
      },
      select: function(...cols){
        columns = columns.concat(cols)
        return this;
      },
      then: function(callback){
        return builder.raw(this.toString()).then(callback)
      },
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
