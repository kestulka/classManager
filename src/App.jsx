import React, { useState, useEffect } from "react";
import "./App.css";
import interact from "interactjs";

function App() {
  const [items, setItems] = useState([
    {
      id: 1,
      name: "Item 1",
      imageUrl:
        "https://us-tuna-sounds-images.voicemod.net/78f23c41-369a-4769-9568-7aae749c4e06-1704762972412.jpg",
    },
    {
      id: 2,
      name: "Item 2",
      imageUrl:
        "https://us-tuna-sounds-images.voicemod.net/78f23c41-369a-4769-9568-7aae749c4e06-1704762972412.jpg",
    },
    {
      id: 3,
      name: "Item 3",
      imageUrl:
        "https://us-tuna-sounds-images.voicemod.net/78f23c41-369a-4769-9568-7aae749c4e06-1704762972412.jpg",
    },
    {
      id: 4,
      name: "Item 4",
      imageUrl:
        "https://us-tuna-sounds-images.voicemod.net/78f23c41-369a-4769-9568-7aae749c4e06-1704762972412.jpg",
    },
    {
      id: 5,
      name: "Item 5",
      imageUrl:
        "https://us-tuna-sounds-images.voicemod.net/78f23c41-369a-4769-9568-7aae749c4e06-1704762972412.jpg",
    },
  ]);

  const [newItemName, setNewItemName] = useState("");
  const [newItemImageUrl, setNewItemImageUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

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

  const handleNameChange = (id, newName) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, name: newName } : item,
      ),
    );
  };

  const addItem = () => {
    const newItem = {
      id: items.length + 1,
      name: newItemName,
      imageUrl: newItemImageUrl,
    };
    setItems([...items, newItem]);
    setNewItemName("");
    setNewItemImageUrl("");
  };

  const deleteItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
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

  const saveChanges = () => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === currentItem.id ? currentItem : item,
      ),
    );
    closeModal();
  };

  return (
    <div className="App">
      <div className="container">
        <div id="outer-dropzone" className="dropzone">
          Classroom
        </div>
        {items.map((item) => (
          <div
            key={item.id}
            className="drag-drop"
            id={`item-${item.id}`}
            style={{
              backgroundImage: `url(${item.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <input
              type="text"
              value={item.name}
              onChange={(e) => handleNameChange(item.id, e.target.value)}
              style={{ width: "72px", textAlign: "center" }}
            />
            <button onClick={() => openEditModal(item)}>Edit</button>
            <button onClick={() => deleteItem(item.id)}>Delete</button>
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
