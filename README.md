# Avatar Animation Prototype  

### Natural Language → 3D Avatar Interaction
<p align="center">
  <img src="https://img.shields.io/badge/Python-3.12-blue?logo=python"/>
  <img src="https://img.shields.io/badge/Flask-Backend-black?logo=flask"/>
  <img src="https://img.shields.io/badge/Three.js-3D-black?logo=three.js"/>
  <img src="https://img.shields.io/badge/JavaScript-Frontend-yellow?logo=javascript"/>
  <img src="https://img.shields.io/badge/Status-Working-brightgreen"/>
  <img src="https://img.shields.io/badge/License-MIT-green"/>
</p>

---

## Overview

This project demonstrates a **multimodal AI pipeline** that converts natural language commands into real-time 3D avatar animations.

Users can type simple instructions such as:

- “wave hello”  
- “walk forward”  
- “clap”  

The system interprets intent and triggers a corresponding animation on a 3D avatar rendered in the browser.

---

## How It Works

This project is built around a simple but powerful pipeline:
```
User Input → AI Interpretation → Intent Mapping → Animation Selection → 3D Rendering
```

**1. Natural Language Processing**
- User enters a command
- Backend (Flask) interprets intent using rule-based logic

**2. Intent → Animation Mapping**
- Commands are mapped to animation categories
- Flexible matching allows partial/semantic understanding

**3. 3D Avatar Rendering**
- Built using Three.js
- Avatar loaded from .glb format
- Scene includes lighting, controls, and environment

**4. Animation Playback**
- Uses THREE.AnimationMixer
- Dynamically selects and plays animations
- Smooth transitions between actions

---

## Features

- Natural language command input
- Real-time AI interpretation
- 3D avatar rendering in browser
- Animation playback with intelligent matching
- Interactive camera controls (OrbitControls)
- Clean UI for training/demo scenarios

---

## Tech Stack

| **Layer** | **Technology** |
|-----------|----------------|
| Frontend | HTML, CSS, JavaScript |
| 3D Engine | Three.js |
| Backend | Python (Flask) |
| 3D Format | GLB (glTF) |
| Animation System | Three.js AnimationMixer |

---

## Project Structure

```
Avatar-Animation-Prototype/
│
├── static/
│   ├── models/
│   │   └── avatar.glb
│   ├── js/
│   │   └── app.js
│   ├── css/
│   │   └── style.css
│
├── templates/
│   └── index.html
│
├── app.py
├── requirements.txt
└── README.md
```

---

## How to Run

**1. Clone the repository**

```
git clone https://github.com/Nomusa990822/avatar-animation-prototype.git
cd avatar-animation-prototype
```

**2. Install dependencies**

```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**3. Run the app**

```python app.py```

**4. Open in browser**

```http://localhost:5000```

---

## Example Commands

Try typing:
```
wave
walk forward
clap
point left
```

---

## AI Design Thinking

This project simulates a real-world AI training system, where:
- Users interact using natural language
- AI translates intent into actions
- A visual agent (avatar) responds dynamically

This mirrors applications in:
- Industrial training simulations
- AI learning assistants
- Virtual instructors
- Interactive environments

---

## Key Engineering Insights
- Decoupled backend (AI logic) from frontend (3D rendering)
- Built a scalable intent → behavior mapping system
- Used GLB format for efficient web-based 3D rendering
- Designed for extensibility (LLMs, voice input, animation pipelines)

---

## Future Improvements
- Integrate GPT for advanced natural language understanding
- Add voice command input
- Support animation blending and transitions
- Add multiple avatars and environments
- Use embeddings for smarter intent detection

### Why This Project Matters
This prototype demonstrates the foundation of:
AI-powered interactive training systems
It shows how AI, 3D graphics, and user interaction can be combined to create engaging, intelligent experiences.

---

## Author

**Nomusa Shongwe**
- Passionate about AI, engineering, and interactive systems
- Building projects that combine data, simulation, and real-world impact
