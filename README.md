# Smart To-Do List Application

A modern, responsive to-do list application built with HTML, CSS, and JavaScript. Features a Kanban-style board with drag-and-drop functionality, task categorization, and an integrated calendar.

## Features

### 🎯 Task Management
- **Three Status Categories:**
  - **Not Yet Started** (Gray) - New tasks
  - **In Progress** (Yellow) - Tasks currently being worked on
  - **Completed** (Green) - Finished tasks

### 🏷️ Task Categorization
- **Personal** (Red badge) - Personal tasks and errands
- **Work** (Blue badge) - Work-related tasks
- **School** (Green badge) - Academic tasks

### 📅 Calendar Integration
- Monthly calendar view
- Visual indicators for days with tasks
- Navigate between months
- Today's date highlighted

### 🎨 Modern UI/UX
- Beautiful gradient background
- Glassmorphism design elements
- Smooth animations and transitions
- Responsive design for all devices
- Drag and drop functionality

### 💾 Data Persistence
- Tasks saved in browser's local storage
- Data persists between sessions

## How to Use

### Adding Tasks
1. Enter task title in the input field
2. Select a category (Personal, Work, or School)
3. Choose a due date (optional)
4. Click "Add Task" or press Enter

### Managing Tasks
- **Drag and Drop:** Move tasks between columns to change their status
- **Edit:** Click the edit icon to modify task title
- **Delete:** Click the trash icon to remove tasks

### Calendar Features
- View current month with task indicators
- Navigate between months using arrow buttons
- Days with tasks show a green dot indicator
- Today's date is highlighted in blue

### Task Details
Each task displays:
- Task title
- Category badge with color coding
- Due date (if set)
- Overdue indicator for past due dates
- Edit and delete buttons

## File Structure

```
to-do-list/
├── index.html      # Main HTML structure
├── styles.css      # CSS styling and responsive design
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## Getting Started

1. **Download/Clone** the project files
2. **Open** `index.html` in your web browser
3. **Start** adding and managing your tasks!

No installation or setup required - it's a pure HTML/CSS/JavaScript application that runs entirely in the browser.

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Features in Detail

### Color Coding System
- **Gray (#718096):** Not Yet Started tasks
- **Yellow (#d69e2e):** In Progress tasks  
- **Green (#38a169):** Completed tasks

### Category Colors
- **Personal:** Red background (#fed7d7) with dark red text (#c53030)
- **Work:** Blue background (#bee3f8) with dark blue text (#2b6cb0)
- **School:** Green background (#c6f6d5) with dark green text (#2f855a)

### Responsive Design
- Desktop: Three-column layout
- Tablet: Responsive grid
- Mobile: Single-column layout with optimized touch interactions

## Sample Data

The application comes with sample tasks to demonstrate functionality:
- "Complete project presentation" (Work, In Progress)
- "Study for math exam" (School, Not Started)
- "Buy groceries" (Personal, Completed)

## Local Storage

All tasks are automatically saved to your browser's local storage, so your data will persist between browser sessions. Clear your browser data to reset the application.

---

**Enjoy organizing your tasks with this beautiful and functional to-do list application!** 🚀 