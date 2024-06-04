const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/classManager", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const itemSchema = new mongoose.Schema({
  name: String,
  imageUrl: String,
  x: Number,
  y: Number,
  classroom: String,
});

const classroomSchema = new mongoose.Schema({
  classroom: String,
  items: [itemSchema],
});

const Item = mongoose.model("Item", itemSchema);
const Classroom = mongoose.model("Classroom", classroomSchema);

app.get("/items", async (req, res) => {
  const { classroom } = req.query;
  const items = await Item.find({ classroom });
  res.send(items);
});

app.post("/items", async (req, res) => {
  const item = new Item(req.body);
  await item.save();
  res.send(item);
});

app.put("/items/:id", async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.send(item);
});

app.delete("/items/:id", async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.send({ message: "Item deleted" });
});

app.get("/classrooms", async (req, res) => {
  const classrooms = await Classroom.find();
  res.send(classrooms.map((classroom) => classroom.classroom));
});

app.post("/classrooms", async (req, res) => {
  const classroom = new Classroom(req.body);
  await classroom.save();
  res.send(classroom);
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
