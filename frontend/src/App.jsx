import DocumentUpload from "./components/DocumentUpload";
import ChatInterface from "./components/ChatInterface";
import "./App.css";

const App = () => {
  return (
    <div className="app-container">
      <h1>Document Q&A System</h1>
      <DocumentUpload />
      <ChatInterface />
    </div>
  );
};

export default App;
