import ReactDom from "react-dom/client";
import App from "./App.jsx";
import { CounterContextProvider } from "./CounterContext.jsx";

ReactDom.createRoot(document.getElementById("root")).render(
  <CounterContextProvider>
    <App />
  </CounterContextProvider>
);
