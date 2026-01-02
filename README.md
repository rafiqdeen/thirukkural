# Thirukkural Explorer - திருக்குறள்

A modern web application to explore the 1330 couplets of ancient Tamil wisdom from Thirukkural.

**Live Demo:** [https://rafiqdeen.github.io/thirukkural/](https://rafiqdeen.github.io/thirukkural/)

## Features

- **Search** - Search kurals in Tamil or English
- **Cascading Filters** - Filter by Paal (பால்), Iyal (இயல்), and Adhigaram (அதிகாரம்)
- **Expandable Explanations** - View Tamil explanation (Paapaya) and English meaning/translation
- **Dark Mode** - Toggle between light and dark themes with system preference detection
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Accordion View** - Browse kurals organized by Adhigaram

## Structure of Thirukkural

Thirukkural contains **1330 kurals** organized into:

| Paal (பால்) | Adhigarams | Kurals |
|-------------|------------|--------|
| அறத்துப்பால் (Virtue) | 38 | 380 |
| பொருட்பால் (Wealth) | 70 | 700 |
| இன்பத்துப்பால் (Love) | 25 | 250 |

Each Adhigaram contains 10 kurals.

## Tech Stack

- HTML5, CSS3, JavaScript (Vanilla)
- Bootstrap 5.3
- PapaParse (CSV parsing)
- Inter font family

## Run Locally

```bash
# Clone the repository
git clone https://github.com/rafiqdeen/thirukkural.git
cd thirukkural

# Start a local server
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

## Project Structure

```
thirukkural/
├── index.html      # Main HTML file
├── style.css       # Styles with dark mode support
├── script.js       # Application logic
├── assets/
│   └── kural.csv   # Thirukkural data
└── README.md
```

## Data Source

Kural data sourced from Open Tamil Literature.

## Author

**Mohamed Rafiqdeen S**

---

Made with ❤️ for Tamil
