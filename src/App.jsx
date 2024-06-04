import React, { useState, useEffect } from "react";
import "./App.css";
import interact from "interactjs";
import axios from "axios";

function App() {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemImageUrl, setNewItemImageUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [currentClassroom, setCurrentClassroom] = useState("");

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    const response = await axios.get("http://localhost:5000/classrooms");
    setClassrooms(response.data);
  };

  useEffect(() => {
    if (currentClassroom) {
      fetchItems();
    }
  }, [currentClassroom]);

  const fetchItems = async () => {
    const response = await axios.get(
      `http://localhost:5000/items?classroom=${currentClassroom}`,
    );
    setItems(response.data);
  };

  useEffect(() => {
    interact(".drag-drop").draggable({
      inertia: true,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: "parent",
          endOnly: true,
        }),
      ],
      autoScroll: true,
      listeners: {
        move(event) {
          const target = event.target;
          const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
          const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

          target.style.transform = `translate(${x}px, ${y}px)`;
          target.setAttribute("data-x", x);
          target.setAttribute("data-y", y);

          const id = target.getAttribute("id").split("-")[1];
          updateItemPosition(id, x, y);
        },
      },
    });

    interact(".dropzone").dropzone({
      accept: ".drag-drop",
      overlap: 0.75,
      ondropactivate(event) {
        event.target.classList.add("drop-active");
      },
      ondragenter(event) {
        const dropzoneElement = event.target;
        dropzoneElement.classList.add("drop-target");
        event.relatedTarget.classList.add("can-drop");
      },
      ondragleave(event) {
        event.target.classList.remove("drop-target");
        event.relatedTarget.classList.remove("can-drop");
      },
      ondrop(event) {
        // No text change on drop
      },
      ondropdeactivate(event) {
        event.target.classList.remove("drop-active");
        event.target.classList.remove("drop-target");
      },
    });
  }, []);

  const updateItemPosition = async (id, x, y) => {
    await axios.put(`http://localhost:5000/items/${id}`, { x, y });
  };

  const handleNameChange = async (id, newName) => {
    const updatedItem = await axios.put(`http://localhost:5000/items/${id}`, {
      name: newName,
    });
    setItems((prevItems) =>
      prevItems.map((item) => (item._id === id ? updatedItem.data : item)),
    );
  };

  const addItem = async () => {
    const newItem = {
      name: newItemName,
      imageUrl: newItemImageUrl,
      x: 0,
      y: 0,
      classroom: currentClassroom,
    };
    const response = await axios.post("http://localhost:5000/items", newItem);
    setItems([...items, response.data]);
    setNewItemName("");
    setNewItemImageUrl("");
  };

  const deleteItem = async (id) => {
    await axios.delete(`http://localhost:5000/items/${id}`);
    setItems(items.filter((item) => item._id !== id));
  };

  const openEditModal = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem((prevItem) => ({ ...prevItem, [name]: value }));
  };

  const saveChanges = async () => {
    const updatedItem = await axios.put(
      `http://localhost:5000/items/${currentItem._id}`,
      currentItem,
    );
    setItems((prevItems) =>
      prevItems.map((item) =>
        item._id === currentItem._id ? updatedItem.data : item,
      ),
    );
    closeModal();
  };

  const createClassroom = async () => {
    const classroomName = document.getElementById("new-classroom-name").value;
    const classroomItems = items.map((item) => ({
      ...item,
      classroom: classroomName,
    }));

    await axios.post("http://localhost:5000/classrooms", {
      classroom: classroomName,
      items: classroomItems,
    });

    fetchClassrooms();
    document.getElementById("new-classroom-name").value = "";
  };

  const switchClassroom = async (classroomName) => {
    setCurrentClassroom(classroomName);
  };

  return (
    <div className="App">
      <div className="container">
        <div>
          <input
            type="text"
            id="new-classroom-name"
            placeholder="New Classroom Name"
          />
          <button onClick={createClassroom}>Submit</button>
          <select
            onChange={(e) => switchClassroom(e.target.value)}
            value={currentClassroom}
          >
            <option value="" disabled>
              Select Classroom
            </option>
            {classrooms.map((classroom) => (
              <option key={classroom} value={classroom}>
                {classroom}
              </option>
            ))}
          </select>
        </div>
        <div id="outer-dropzone" className="dropzone">
          Classroom
        </div>
        {items.map((item) => (
          <div
            key={item._id}
            className="drag-drop"
            id={`item-${item._id}`}
            style={{
              backgroundImage: `url(${item.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: `translate(${item.x}px, ${item.y}px)`,
            }}
            data-x={item.x}
            data-y={item.y}
          >
            <input
              type="text"
              value={item.name}
              onChange={(e) => handleNameChange(item._id, e.target.value)}
              style={{ width: "72px", textAlign: "center" }}
            />
            <button onClick={() => openEditModal(item)}>Edit</button>
            <button onClick={() => deleteItem(item._id)}>Delete</button>
          </div>
        ))}
        <div className="new-item-form">
          <input
            type="text"
            placeholder="Item Name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Image URL"
            value={newItemImageUrl}
            onChange={(e) => setNewItemImageUrl(e.target.value)}
          />
          <button onClick={addItem}>Add Item</button>
        </div>
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h2>Edit Item</h2>
              <input
                type="text"
                name="name"
                value={currentItem.name}
                onChange={handleEditChange}
              />
              <input
                type="text"
                name="imageUrl"
                value={currentItem.imageUrl}
                onChange={handleEditChange}
              />
              <button onClick={saveChanges}>Save</button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
