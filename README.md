# DISQVER

[![Python](https://img.shields.io/badge/python%203.10-3670A0?logo=python&logoColor=ffdd54)](https://www.python.org/downloads/release/python-3100/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Pandas](https://img.shields.io/badge/pandas-%23150458.svg?logo=pandas&logoColor=white)]()
[![PM4Py](https://img.shields.io/badge/PM4Py-white.svg)](https://processintelligence.solutions/pm4py)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

[![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![React Bootstrap](https://img.shields.io/badge/React%20Bootstrap-712cf9)](https://react-bootstrap.netlify.app/)

![DISQVER Usage GIF](demo-gif.gif)

In the above demo video, a QEL is imported and its metrics analyzed.

## Description

Welcome to **DISQVER** (discovering mertircs), a web app for inventory mangament analysis of [qunatity event logs \(QELs\)](https://github.com/ninagraves/qel_simulation).

DISQVER's main features are

- Displaying the demand
- Displaying the item-level development
- Calculating lead time
- Calculating the $\alpha$ and $\beta$ service levels

The project consists of

- A backend running on Python, mostly using FastAPI, pandas, pm4py and pydantic
- A frontend based on React, using React Bootstrap elements.

## Installation

**Backend**:
The `/src/backend` uses poetry to manage dependencies. If you don't have poetry installed, you can install it by running the following command:
`pip install poetry`
We are using PyGraphviz so this need to be installed sepertly. to do so you must follow the instructions on https://pygraphviz.github.io/documentation/stable/install.html
For Windows:
`` poetry run pip install --config-settings="--global-option=build_ext" `
              --config-settings="--global-option=-IC:\Program Files\Graphviz\include" `
              --config-settings="--global-option=-LC:\Program Files\Graphviz\lib" `
              pygraphviz ``
After running this, you need to run
`poetry install`

**Frontend**:
using `npm`, when inside `/src/frontend`, dependencies can be installed with

```
npm install
```

## Usage

Backend and frontend are started using the following two commands in separate terminals:

```console
python main.py
npm start
```

After starting, the app can be accessed at http://localhost:3000.

## Repository structure

- `src/backend`:
  - `src`: has `index.py` which has FastAPI config, API models and `analysis.py` which handls the data.
  - `files`: Stores the imported data
- `src/frontend`:
  - `components`: React components
  - `public`: Images
  - `src`: reusable TypeScript functions & type definitions
- `thesis`: The thesis project, including the PDF, and the complete LaTeX project.
- `data`:
  - `event_logs`: Example QELs

## Authors and acknowledgment

Author: Nour Mannoun

I developed this project for my Bachelor's thesis at the[Chair of Process and Data Science \(PADS\)](https://www.pads.rwth-aachen.de) at RWTH Aachen University. My supervisor was Nina Graves and Prof. Wil van der Aalst.
