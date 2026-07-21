import React, { useContext } from "react";
import { NavLink } from "react-router-dom";

import logo from "../../image/microscope.svg";
import { context } from "../../context/context";

export const Navbar = () => {
  const { user, setUser, setVisibleLogIn, setVisibleContact } =
    useContext(context);

  const logout = () => {
    setUser(null);
  };

  return (
    <>
      <div className="navbar-container">
        <div className="logo-container">
          <NavLink to="/">
            <img src={logo} alt="Micrograph Analysis System logo" />
            <p>
              <strong>MAS</strong>
            </p>
            <p>Micrograph Analysis System</p>
          </NavLink>
        </div>

        <div className="links-container">
          <ul>
            {user ? (
              <>
                <NavLink to="/">
                  <li>{user.email}</li>
                </NavLink>

                <NavLink to="/report">
                  <li>Report</li>
                </NavLink>

                <NavLink to="/history">
                  <li>History</li>
                </NavLink>

                <NavLink onClick={logout} to="#">
                  <li>Log out</li>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink onClick={() => setVisibleLogIn(true)} to="#">
                  <li>Log in</li>
                </NavLink>

                <NavLink to="#">
                  <li>Docs</li>
                </NavLink>

                <NavLink onClick={() => setVisibleContact(true)} to="#">
                  <li>Contact</li>
                </NavLink>
              </>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};
