// Use a proxy endpoint hosted on your own backend (Render Web Service)
// Change this to your own Render backend URL if needed
const API_BASE = "/api"; // Relative path so it works on Render's domain

// Load messages from API
async function loadMessages() {
  try {
    const res = await fetch(`${API_BASE}/messages`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const list = document.getElementById("messages");
    list.innerHTML = "";
    data.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.title}: ${item.body}`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
  }
}

// Send a new message
document.getElementById("sendForm").addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const message = document.getElementById("message").value;

  try {
    const res = await fetch(`${API_BASE}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: name, body: message })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log("Sent successfully:", data);
    loadMessages();
  } catch (err) {
    console.error("Error sending message:", err);
  }
});

// Optional WebSocket connection
(function initWebSocket() {
  const ws = new WebSocket("wss://echo.websocket.events");
  ws.onopen = () => ws.send("Hello from Render static site!");
  ws.onmessage = e => {
    if (e.data) console.log("WebSocket received:", e.data);
  };
})();

// Initial data load
loadMessages();
