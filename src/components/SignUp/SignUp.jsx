import React, { useState } from "react";

import { API_ENDPOINTS, apiPostJson } from "../../services/api";

export const SignUp = ({ setVisibleOther, setVisibleSelf }) => {
  const [email, setEmail] = useState("");
  const [occupation, setOccupation] = useState("student");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const clearForm = () => {
    setEmail("");
    setOccupation("student");
    setPassword("");
    setConfirmPassword("");
  };

  const signUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      clearForm();
      return;
    }

    try {
      await apiPostJson(API_ENDPOINTS.auth.register, {
        email,
        occupation,
        password,
      });

      alert("User registered successfully. Please log in.");

      setVisibleSelf(false);
      setVisibleOther(true);
    } catch (error) {
      alert(error.message || "There was an error creating the user");
      clearForm();
    }
  };

  return (
    <>
      <div className="form-container-container">
        <h1 className="tittle-form">Sign up</h1>

        <div className="form-container">
          <form onSubmit={signUp}>
            <input
              className="input-form"
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <select
              className="input-form"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="researcher">Researcher</option>
              <option value="other">Other</option>
            </select>

            <input
              className="input-form"
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              className="input-form"
              type="password"
              placeholder="Confirm password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button className="button-form" type="submit">
              Sign up
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
