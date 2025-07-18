# Patterns Project

<div align="center">
<img src="assets/images/icon.png" alt="logo" style="width:400px; height:auto; margin-left: auto; margin-right: auto;">

# Prompt Library

![Static Badge](https://img.shields.io/badge/mission-Effortlessly%20browse%2C%20store%2C%20and%20manage%20your%20AI%20prompts-blue)
<br />
![GitHub top language](https://img.shields.io/github/languages/top/danielmiessler/Telos)
![GitHub last commit](https://img.shields.io/github/last-commit/danielmiessler/Telos)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

<p class="align center">
<h4><code>Prompt Library</code> An open-sourced modern web application for storing and viewing AI prompts.</h4>
</p>
</div>
</div>


## 🚀 Features

- Interactive UI components
- Responsive design
- Clean and modern patterns
- Easy to customize

## 📸 Screenshots

### List View
![List View](screen-shoots/mockup_list_view.png)

### Grid View
![Grid View](screen-shoots/mockup_grid_view.png)

### Tag Filtering
![Tag Filtering](screen-shoots/mockup_tag_filtering.png)

## 🛠️ Technologies Used

- HTML
- CSS
- JavaScript

## 🏃‍♂️ Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- (Recommended) A local web server (like Live Server in VS Code or Python's built-in server)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TomceGraphics/Prompt-Library.git
   cd Prompt-Library
   ```

2. Run a local server (choose one method):

   **Option 1: Using VS Code (Recommended)**
   - Install the "Live Server" extension
   - Right-click on `index.html` and select "Open with Live Server"

   **Option 2: Using Python**
   ```bash
   # Python 3.x
   python -m http.server 8000
   # or
   python3 -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser

   **Option 3: Direct file access**
   - Simply open `index.html` in your browser (note: some features might be limited due to CORS restrictions)

## 📁 Project Structure

```
Prompt-Library/
├── index.html      # Main HTML file
├── style.css      # Main stylesheet
└── main.js        # JavaScript functionality
```

## 🎨 Customization

- Modify `style.css` to change the appearance
- Update `main.js` to add or modify functionality
- Edit `index.html` to change the structure

## Adding New Patterns

Currently, patterns are added via a manual process (a UI for this is planned):

1. **Create a folder** with the pattern name in the patterns directory
2. Add a `system.md` file inside containing the pattern's content
3. Create a `description.json` file with:
   ```json
   {
     "description": "Your pattern description",
     "tags": ["tag1", "tag2"]
   }
   ```
4. Run the Python script to generate the final JSON structure

Use the `create_pattern` custom pattern to automate some of these steps.

## Planned Features

### High Priority
- [ ] Database migration (replace JSON files)
- [ ] Side panel with categories and favorites
- [ ] UI for pattern creation/editing  
- [ ] In-app pattern management (edit descriptions, tags, etc.)

### Future Considerations  
- [ ] User accounts system
- [ ] Version history for patterns
- [ ] Advanced sorting and filtering

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Made with ❤️ by Thomas Graphics
