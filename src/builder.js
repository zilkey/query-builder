module.exports = function(tableName){
  let columns = [];

  return {
    toString: function () {
      return `select ${columns.map(e => `"${e}"`).join(", ")} from ${tableName}`
    },
    select: function(...cols){
      columns = columns.concat(cols)
      return this;
    }
  }

}
