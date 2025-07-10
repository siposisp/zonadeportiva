class User {
  constructor({ id, email, password_hash, role }) {
    this.id = id;
    this.email = email;
    this.password_hash = password_hash;
    this.role = role;
  }
}

export default User;