import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Rsvp from "./rsvp/Rsvp";
import AdminDashboard from "./rsvp/AdminDashboard";
import UserGuide from "./rsvp/UserGuide";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Rsvp />} />
        <Route path="/user-guide" element={<UserGuide />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
