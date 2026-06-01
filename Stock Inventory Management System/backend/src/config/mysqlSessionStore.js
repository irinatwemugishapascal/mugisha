const session = require("express-session");
const { execute, query } = require("./db");

class MySQLSessionStore extends session.Store {
  async get(sid, callback) {
    try {
      const rows = await query("SELECT data, expires FROM sessions WHERE session_id = ? LIMIT 1", [sid]);
      const row = rows[0];
      if (!row || Number(row.expires) <= Date.now()) {
        if (row) await this.destroy(sid, () => {});
        return callback(null, null);
      }
      return callback(null, JSON.parse(row.data));
    } catch (error) {
      return callback(error);
    }
  }

  async set(sid, sess, callback) {
    try {
      const expires = sess.cookie?.expires ? new Date(sess.cookie.expires).getTime() : Date.now() + 86400000;
      await execute(
        `
          INSERT INTO sessions (session_id, expires, data)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE expires = VALUES(expires), data = VALUES(data)
        `,
        [sid, expires, JSON.stringify(sess)]
      );
      return callback(null);
    } catch (error) {
      return callback(error);
    }
  }

  async destroy(sid, callback) {
    try {
      await execute("DELETE FROM sessions WHERE session_id = ?", [sid]);
      return callback(null);
    } catch (error) {
      return callback(error);
    }
  }

  async touch(sid, sess, callback) {
    try {
      const expires = sess.cookie?.expires ? new Date(sess.cookie.expires).getTime() : Date.now() + 86400000;
      await execute("UPDATE sessions SET expires = ? WHERE session_id = ?", [expires, sid]);
      return callback(null);
    } catch (error) {
      return callback(error);
    }
  }
}

module.exports = MySQLSessionStore;
