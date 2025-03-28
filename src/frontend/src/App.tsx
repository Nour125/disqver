"use client";

import axios from "axios";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "bootstrap/dist/css/bootstrap.min.css";
import { Helmet } from "react-helmet";
import { UploadFile } from "./components/upload";
import { QelOverview } from "./components/QelOverview";

interface Item {
  name: string;
  description?: string;
}

const App: React.FC = () => {
  {
  }
  return (
    <div>
      <Helmet>
        <title>DISQVER</title>
        <link rel="shortcut icon" href="src/frontend/public/logo192.png" />
      </Helmet>
      <header>
        <nav className="navbar navbar-expand-md navbar-dark bg-dark">
          <div className="container">
            <a className="navbar-brand" href="/">
              <img src="/disqver-name-200;100.png" style={{ height: "35px" }} />
            </a>
          </div>
        </nav>
      </header>
      <main className="container">
        <UploadFile />
      </main>
    </div>
  );
};

export default App;
