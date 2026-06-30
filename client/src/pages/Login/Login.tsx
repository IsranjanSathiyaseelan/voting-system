import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../common/Button/Button";
import styles from "./Login.module.css";

import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // temporary mock user (until backend connection)
    const user = {
      id: 1,
      username,
      email: "user@gmail.com",
      role: "USER" as const,
    };
    login(user);
    navigate("/dashboard");
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Login</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button text="Login" type="submit" />
      </form>
    </div>
  );
};

export default Login;
