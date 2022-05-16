import "./App.css";
import EditorComponent from "./components/editor";

function App() {
  return (
    <div
      className="App"
      style={{ width: "100vw", height: "100vh", background: "gray" }}
    >
      <EditorComponent />
    </div>
  );
}

export default App;
