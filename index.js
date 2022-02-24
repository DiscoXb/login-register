const express = require("express");
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require("cors");
const PORT = 6969;

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

const db = require('./db');

const userService = require('./service.user');
app.get("/", async (req, res) => {
  let users = await userService.getAll()
  return res.send(users);
});

//get info by username
app.post("/user", async (req, res) => {
  let username = req.body.username
  let user = await db.User.findOne({ where: { username: username } })
  let response = {
    result: true,
    data: {
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      image: user.image,
    },
    message: null,
  }
  return res.send(response);
});

//register api, check duplicate username and send json to create data
app.post("/register", async (req, res) => {
  // console.log(req.body)
  let firstname = req.body.firstname
  let lastname = req.body.lastname
  let username = req.body.username
  let password = req.body.password
  // console.log(firstname, lastname, username, password)
  if (await db.User.findOne({ where: { username: username } })) {
    let response = {
      result: false,
      message: "username is taken",
    }
    return res.send(response);
  }
  let data = {
    firstname: firstname,
    lastname: lastname,
    username: username,
    password: await bcrypt.hash(password, 10),
  }

  await db.User.create(data);

  let response = {
    result: true,
    data: {
      firstname: firstname,
      lastname: lastname,
      username: username,
    },
    message: null,
  }
  return res.send(response);
});

//login api, check username n password
app.post('/login', async (req, res) => {
  let username = req.body.username
  let password = req.body.password
  if (!username || !password) {
    let response = {
      result: false,
      message: "username or password is null",
    }
    return res.send(response);
  }
  let user = await db.User.findOne({ where: { username: username } })
  if (!user) {
    let response = {
      result: false,
      message: "username not found or invalid password",
    }
    return res.send(response);
  }
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    let response = {
      result: false,
      message: "username not found or invalid password",
    }
    return res.send(response);
  }
  let response = {
    result: true,
    data: {
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
    },
    message: null,
  }
  return res.send(response);
});

//edit or update api, get info from username, update and send it to a server
app.post('/update', async (req, res) => {
  let firstname = req.body.firstname
  let lastname = req.body.lastname
  let username = req.body.username
  let password = req.body.password
  let image = req.body.image
  let user = await db.User.findOne({ where: { username: username } })
  user.firstname = firstname
  user.lastname = lastname
  user.image = image
  user.password = await bcrypt.hash(password, 10)
  await user.save();
  let response = {
    result: true,
    data: {
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      image: user.image,
    },
    message: null,
  }
  return res.send(response);
});


app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});