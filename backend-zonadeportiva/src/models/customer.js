class Customer {
  constructor({ id, user_id, rut, first_name, last_name, phone }) {
    this.id = id;
    this.user_id = user_id;
    this.rut = rut;
    this.first_name = first_name;
    this.last_name = last_name;
    this.phone = phone;
  }
}

export default Customer;