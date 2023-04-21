import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import BrowsePage from './pages/Browse';
import WatchPage from './pages/Watch';
import ErrorPage from './pages/Error';
import store from './store/store';

import './main.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate replace to="/browse" />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/browse',
    element: <BrowsePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: 'watch/:id',
    element: <WatchPage />,
    errorElement: <ErrorPage />,
  },
]);

const root = document.getElementById('root') as HTMLElement;

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
