import React, { useContext, useState } from "react";

import { context } from "../../context/context";
import { API_ENDPOINTS, apiPostJson } from "../../services/api";

export const Login = ({ setVisibleOther, setVisibleSelf }) => {
  const { setUser } = useContext(context);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const clearForm = () => {
    setEmail("");
    setPassword("");
  };

  const signUp = (e) => {
    e.preventDefault();
    setVisibleSelf(false);
    setVisibleOther(true);
  };

  const login = async (e) => {
    e.preventDefault();

    try {
      const data = await apiPostJson(API_ENDPOINTS.auth.login, {
        email,
        password,
      });

      setUser(data.user);
      setVisibleSelf(false);
    } catch (error) {
      alert(error.message || "Wrong email or password");
      clearForm();
    }
  };

  return (
    <>
      <div className="form-container-container">
        <h1 className="tittle-form">Login</h1>

        <div className="form-container">
          <form onSubmit={login}>
            <input
              className="input-form"
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="input-form"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <a href="#" onClick={(e) => e.preventDefault()}>
              Forgot password?
            </a>

            <button className="button-form" type="submit">
              Login
            </button>

            <p>
              Not a member?{" "}
              <a href="#" onClick={signUp}>
                Signup
              </a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};
