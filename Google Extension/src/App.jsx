import { useEffect, useState } from "react";
import AuthNotion from "./pages/AuthNotion";
import Main from "./pages/Main";

function App() {
  const [currentView, setCurrentView] = useState("authNotion");

  const renderView = () => {
    switch (currentView) {
      case "authNotion":
        return <AuthNotion setCurrentView={setCurrentView} />;
      case "main":
        return <Main setCurrentView={setCurrentView} />;
      default:
        return <AuthNotion setCurrentView={setCurrentView} />;
    }
  };

  useEffect(() => {
    //prevent the links opening in the same window, open in browser instead
    const handleClickAnchor = (event) => {
      const target = event.target.closest("a");
      if (target && target.href) {
        event.preventDefault();
        chrome.tabs.create({ url: target.href });
      }
    };

    document.addEventListener("click", handleClickAnchor);

    return () => {
      document.removeEventListener("click", handleClickAnchor);
    };
  }, []);

  return <div className="flex justify-center">{renderView()};</div>;
}

export default App;
