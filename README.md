# CodeCraft – Real-Time Collaborative Code Editor

CodeCraft is a **high-performance, real-time collaborative code editor** designed for developers to write, share, and execute code together. Built with **React, Node.js, Socket.io, and the Monaco Editor**, it provides a **VS Code-like experience directly in the browser** with live cursor tracking and multi-language support.

---

## 🚀 Features

### Real-Time Collaboration
Simultaneous editing with **low-latency synchronization** powered by WebSockets.

### Live Cursor Tracking
See exactly where your teammates are typing with **named remote cursors and visual labels**.

### Multi-Language Support
Write and run code in:

- JavaScript
- Python
- C++
- Java
- C#
- PHP

### Code Execution
Integrated with **Piston API** and **Judge0** to compile and run code directly in the browser.

### Google Authentication
Secure user login via **Supabase Auth** and **Google OAuth** to automatically sync profiles.

### Customizable Themes
Toggle between:

- VS Dark  
- Light  
- High Contrast  
- Custom **Greyish-Black** theme

### Room-Based Sync
Generate unique **Room IDs using UUID** to invite colleagues for private coding sessions.

---

## 🛠️ Tech Stack

### Frontend

- **React.js** – Core framework for UI components and state management  
- **Monaco Editor** – The powerful engine behind VS Code for syntax highlighting and IntelliSense  
- **Socket.io-client** – Real-time bidirectional communication  
- **Supabase** – Authentication and user session management  
- **React Hot Toast** – Notifications for joins, leaves, and errors  

### Backend

- **Node.js & Express** – Server-side logic and static file hosting  
- **Socket.io** – Managing room events such as `JOIN`, `CODE_CHANGE`, and `CURSOR_CHANGE`  
- **Judge0 / Piston API** – Remote code execution environments  

---

## 🔧 Installation & Setup

### 1. Prerequisites

Make sure you have:

- **Node.js (v16+ recommended)**
- **A Supabase Project** (for Google Auth)

---

### 2. Clone the Repository

```bash
git clone https://github.com/yourusername/codecraft.git
cd codecraft
```

---
#### 3. Install Dependencies
```npm install```

---

### 4. Environment Variables
- **REACT_APP_SUPABASE_URL=your_supabase_url**
- **REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key**
- **PORT=5000**

---

### 5. Run the Application
```npm start```

---

### 🌐 Live Demo
**You can try the application here:**

```[https://rtce-spl0.onrender.com/](https://rtce-spl0.onrender.com/)```


- PS: Please wait 30–40 seconds for the application to fully load. 
