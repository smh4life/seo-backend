export default class Template {
  constructor({ id, userId, name, type, rules }) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.type = type; // blog | product
    this.rules = rules || {};
    this.createdAt = new Date();
  }
}
