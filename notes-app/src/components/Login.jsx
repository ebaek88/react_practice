import { useState } from "react";

const Login = ({ handleLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const tryLogin = (evt) => {
    evt.preventDefault();
    const loginObject = { username, password };
    handleLogin(loginObject);
  };

  return (
    <>
      <h2>Login</h2>
      <form onSubmit={tryLogin}>
        <div>
          <label>
            username
            <input
              type="text"
              value={username}
              onChange={(evt) => setUsername(evt.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            password
            <input
              type="password"
              value={password}
              onChange={(evt) => setPassword(evt.target.value)}
            />
          </label>
        </div>
        <button type="submit">login</button>
      </form>
    </>
  );
};

export default Login;
