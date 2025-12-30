export default class Distributor {
  constructor({ id, userId, name, columnMap = {}, schema = {} }) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.columnMap = columnMap;
    this.schema = schema;
    this.createdAt = new Date();
  }
}
