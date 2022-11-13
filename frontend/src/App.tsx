import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Stats from "./pages/Stats";
import Header from "./componenets/Header";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  return (
    <>
      <Router>
        <GoogleOAuthProvider clientId="982822905231-c6ft5udshsnaklfvstd4m68ie23kvqev.apps.googleusercontent.com">
          <div className="container">
            <Header />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </div>
        </GoogleOAuthProvider>
      </Router>
    </>
  );
}

export default App;
