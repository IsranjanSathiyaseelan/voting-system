import { Link } from "react-router-dom";
import {
  HiOutlineShieldCheck,
  HiOutlineChartBar,
  HiOutlineUserCircle,
} from "react-icons/hi2";
import { FaVoteYea, FaUsers, FaArrowRight } from "react-icons/fa";
import Button from "../../common/Button/Button";
import { useAuth } from "../../hooks/useAuth";
import "./Home.css";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      {/* ================= HERO ================= */}

      <section className="hero">
        <div className="hero-top">
          <div className="hero-users">
            <div className="avatars">
              <img src="https://i.pravatar.cc/100?img=1" alt="" />
              <img src="https://i.pravatar.cc/100?img=2" alt="" />
              <img src="https://i.pravatar.cc/100?img=3" alt="" />
            </div>

            <div className="hero-rating">
              ⭐⭐⭐⭐⭐
              <p>Trusted by 10,000+ voters</p>
            </div>
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-left">
            <span className="hero-badge">🗳 National Election 2026</span>

            <h1>
              Welcome back,
              <br />
              <span>{user?.username ?? "Citizen"} 👋</span>
            </h1>

            <p>
              Cast your vote securely and transparently from anywhere. Every
              vote is encrypted, verified, and counted in real time, ensuring a
              fair and trusted election process.
            </p>

            <div className="hero-buttons">
              <Link to="/vote">
                <Button text="Vote Now" />
              </Link>

              <Link to="/results">
                <Button text="Live Results" />
              </Link>
            </div>
          </div>

          <div className="hero-right">
            <img
              src="/images/voting-illustration.svg"
              alt="Voting Illustration"
            />
          </div>
        </div>
      </section>
      {/* ================= STATS ================= */}

      <section className="stats">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FaVoteYea />
          </div>

          <div>
            <h3>Active Election</h3>
            <p>Presidential Election</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <HiOutlineShieldCheck />
          </div>

          <div>
            <h3>Voting Status</h3>
            <p>Not Voted Yet</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <HiOutlineShieldCheck />
          </div>

          <div>
            <h3>Security</h3>
            <p>AES-256 Encryption</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <HiOutlineChartBar />
          </div>

          <div>
            <h3>Participation</h3>
            <p>72% Turnout</p>
          </div>
        </div>
      </section>

      {/* ================= QUICK ACTIONS ================= */}

      <section className="section">
        <h2 className="section-title">Quick Actions</h2>

        <div className="quick-actions">
          <Link to="/vote" className="action-card">
            <div>
              <FaVoteYea className="action-icon" />
              <h3>Vote Now</h3>
              <p>Cast your vote securely.</p>
            </div>

            <FaArrowRight />
          </Link>

          <Link to="/vote" className="action-card">
            <div>
              <FaUsers className="action-icon" />
              <h3>Candidates</h3>
              <p>Choose from available candidates.</p>
            </div>

            <FaArrowRight />
          </Link>

          <Link to="/results" className="action-card">
            <div>
              <HiOutlineChartBar className="action-icon" />
              <h3>Live Results</h3>
              <p>Track votes in real time.</p>
            </div>

            <FaArrowRight />
          </Link>

          <Link to="/Home" className="action-card">
            <div>
              <HiOutlineUserCircle className="action-icon" />
              <h3>My Dashboard</h3>
              <p>Return to the main dashboard.</p>
            </div>

            <FaArrowRight />
          </Link>
        </div>
      </section>

      {/* ================= PROGRESS ================= */}

      <section className="progress-section">
        <div className="progress-card">
          <div className="progress-header">
            <div>
              <h2>Election Progress</h2>
              <p>Live participation across all registered voters</p>
            </div>
            <h1>72%</h1>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "72%" }}></div>
          </div>

          <div className="progress-stats">
            <div>
              <h3>18,420</h3>
              <span>Total Votes</span>
            </div>

            <div>
              <h3>05h 14m</h3>
              <span>Remaining Time</span>
            </div>

            <div>
              <h3>Live</h3>
              <span>Result Updates</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
