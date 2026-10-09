const API_URL = "http://localhost:5000/api/events";

const form = document.getElementById("eventForm");
const container = document.getElementById("eventList");

let editingId = null;

async function loadEvents() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load events");
        }

        const events = await response.json();

        container.innerHTML = "";

        if (events.length === 0) {
            container.innerHTML = "<p>No events available.</p>";
            return;
        }

        events.forEach(event => {
            const card = document.createElement("div");

            card.className = "event-card";

            card.innerHTML = `
                <h3>${event.title}</h3>
                <p><strong>Date:</strong> ${event.date}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Description:</strong> ${event.description}</p>

                <button onclick="editEvent(${event.id})">
                    Edit
                </button>

                <button class="delete-btn" onclick="deleteEvent(${event.id})">
                    Delete
                </button>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Load error:", error);
        container.innerHTML = "<p>Cannot connect to backend.</p>";
    }
}


// ADD / UPDATE
form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const eventData = {
        title: document.getElementById("title").value.trim(),
        date: document.getElementById("date").value,
        location: document.getElementById("location").value.trim(),
        description: document.getElementById("description").value.trim()
    };

    if (
        !eventData.title ||
        !eventData.date ||
        !eventData.location ||
        !eventData.description
    ) {
        alert("Please fill all fields.");
        return;
    }

    try {

        let response;

        if (editingId === null) {

            response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(eventData)
            });

        } else {

            response = await fetch(`${API_URL}/${editingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(eventData)
            });
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Request failed");
        }

        alert(
            editingId === null
                ? "Event added successfully!"
                : "Event updated successfully!"
        );

        form.reset();

        editingId = null;

        form.querySelector("button[type='submit']").textContent =
            "Create Event";

        await loadEvents();

    } catch (error) {
        console.error("Save error:", error);
        alert("Error: " + error.message);
    }
});


// EDIT
async function editEvent(id) {

    try {

        const response = await fetch(`${API_URL}/${id}`);
        const event = await response.json();

        if (!response.ok) {
            throw new Error(event.message || "Event not found");
        }

        document.getElementById("title").value = event.title;
        document.getElementById("date").value = event.date;
        document.getElementById("location").value = event.location;
        document.getElementById("description").value = event.description;

        editingId = id;

        form.querySelector("button[type='submit']").textContent =
            "Update Event";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {
        console.error("Edit error:", error);
        alert("Could not load event: " + error.message);
    }
}


// DELETE
async function deleteEvent(id) {

    try {

        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Delete failed");
        }

        await loadEvents();

    } catch (error) {
        console.error("Delete error:", error);
        alert("Delete failed: " + error.message);
    }
}

loadEvents();