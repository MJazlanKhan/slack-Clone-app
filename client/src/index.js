import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import ChatProvider from './MyComponents/ChatProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
<ChatProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ChatProvider>
);

