//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import App from './App.jsx'
import UseApi from './components/useApi.jsx'
import ErrorPage from "./error-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: "root",
    element: <div>Hello world!</div>
  },
  {
    path: "useApi",
    element: <UseApi />
  },
]);


createRoot(document.getElementById('root')).render(
  //<StrictMode>
  <RouterProvider router={router} />
  //</StrictMode>,
)
