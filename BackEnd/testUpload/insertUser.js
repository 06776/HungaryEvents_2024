const mongoose = require("mongoose");
const User = require("../models/user");

async function saveUser() {
  try {
    const newUser = new User({
      name: "Teszt Felhasználó",
      email: "teszt@felhasználó.com",
      password: "tesztjelszo123",
      avatar: {
        public_id: "23456",
        url: "https://example.com/avatar.jpg",
      },
    });
    await newUser.save();

    console.log("A felhasználó sikeresen mentve!");
  } catch (error) {
    console.error("Hiba a mentés során:", error.message);
  } finally {
    mongoose.disconnect();
  }
}

mongoose.connect(
  "mongodb+srv://hungaryeventsadmin:UrtiRjYcN4Z5rPr3@database.dhosbcu.mongodb.net/HungaryEvents",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

saveUser();
