/** Server startup for Message.ly. */
const app = require("./app");
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const messagesRoutes = require('./routes/messages');

app.listen(3000, function () {
  console.log("Listening on 3000");
});