import {
  FaSignInAlt,
  FaSignOutAlt,
  FaHandshake,
  FaChartBar,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">SamudaiXFrontend</Link>
      </div>
      <ul>
        <li>
          <Link to="/">
            <FaHandshake />
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/stats">
            <FaChartBar />
            Stats
          </Link>
        </li>
        <li>
          <Link to="/login">
            <FaSignInAlt />
            Login
          </Link>
        </li>
      </ul>
    </header>
  );
};

export default Header;
