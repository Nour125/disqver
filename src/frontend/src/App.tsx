"use client";

import axios from 'axios';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet';
import {UploadFile} from './components/upload';

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
        <title>DISQOVER</title>
        <link rel="shortcut icon" href="src/frontend/public/logo192.png" /> 
      </Helmet>
      <header>
        <nav className="navbar navbar-expand-md navbar-dark bg-dark">
          <div className="container">
            <a className="navbar-brand" href="/">DISQOVER</a>
          </div>
        </nav>
      </header>
      <main className="container">
        {/*
        <h1>Items List</h1>
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item.name}: {item.description}</li>
          ))}
        </ul>
        */}
        <UploadFile/>
      </main>
    </div>
  );
};

export default App;