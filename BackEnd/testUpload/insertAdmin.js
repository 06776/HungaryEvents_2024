const mongoose = require("mongoose");
const Admin = require("../models/admin");

async function saveAdmin() {
  try {
    const newAdmin = new Admin({
      name: "Teszt Admin",
      email: "teszt@admin.com",
      password: "tesztjelszo123",
      description: "Ez egy teszt adminisztrátor",
      avatar: {
        public_id: "123456",
        url: "https://example.com/avatar.jpg",
      },
    });
    await newAdmin.save();

    console.log("Az admin sikeresen mentve!");
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

saveAdmin();
