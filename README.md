# Lesson Plan Compiler

Automate the generation of formatted lesson plans (Modul Ajar) from JSON into a unified Microsoft Word (`.docx`) document with native math equations (OMML) and stylized terminology.

## Quick Start

### 1. Prerequisites & Installation
Ensure you have **Node.js** (v16+) and **Python** (v3.8+) installed.

```bash
# Install Python dependencies
pip install python-docx lxml

# Node.js dependencies are auto-installed on run, or install manually:
npm install docx-templates
```

### 2. Usage
```bash
node generate.js
```
*Note: If the output file is currently open in Word, the compiler automatically saves to `output(1).docx`, `output(2).docx`, etc., to prevent file-lock conflicts.*

---

## File Overview

*   [data.json](data.json) - Contains the structured lesson plan payload.
*   [template.docx](template.docx) - Word document template with dynamic layout loop wrappers.
*   [generate.js](generate.js) - Node.js compiler engine.
*   [apply_formatting.py](apply_formatting.py) - Python script translating text math and italicizing terminology.

---

## Developer Guides

*   [project_guide_and_templating_rules.md](project_guide_and_templating_rules.md) - Pipeline architecture, layout mapping, and formatting rules.
*   [AI-Agent-READ.md](AI-Agent-READ.md) - Syntactic instructions and schemas for AI assistants.
