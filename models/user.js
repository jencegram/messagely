/** User class for message.ly */
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR, DB_URI } = require("../config");



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING username, password, first_name, last_name, phone, join_at`,
      [username, hashedPassword, first_name, last_name, phone]
    );

    return result.rows[0];
  }


  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password FROM users WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
      return true;
    }
    return false;
  }


  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users SET last_login_at = current_timestamp WHERE username = $1 RETURNING last_login_at`,
      [username]
    );

    if (!result.rows.length) {
      throw new ExpressError(`User not found: ${username}`, 404);
    }

    return result.rows[0];
  }


  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone FROM users`
    );

    return result.rows;
  }


  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (!user) {
      throw new ExpressError(`User not found: ${username}`, 404);
    }

    return user;
  }


  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT id, to_username AS "toUser", body, sent_at AS "sentAt", read_at AS "readAt"
       FROM messages WHERE from_username = $1`,
      [username]
    );

    return result.rows;
  }


  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT id, from_username AS "fromUser", body, sent_at AS "sentAt", read_at AS "readAt"
       FROM messages WHERE to_username = $1`,
      [username]
    );

    return result.rows;
  }
}

module.exports = User;