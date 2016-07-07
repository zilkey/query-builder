module.exports = function(tableName){
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
      let builder = this;
      return new Promise(function(resolve, reject){
        var pg = require('pg');
        var client = new pg.Client({
          database: 'builder-test',
        });
        client.connect(function (err) {
          if (err) return reject(err);
          client.query(builder.toString(), [], function (err, result) {
            if (err) return reject(err);
            resolve(result.rows);
          })
        })
      }).then(callback)
    }
  }

}
