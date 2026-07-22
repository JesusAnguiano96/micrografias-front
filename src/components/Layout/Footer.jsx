import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { context } from "../../context/context";

export const Footer = () => {
  const { setVisibleContact } = useContext(context);
  const navigate = useNavigate();

  const handleContactClick = () => {
    setVisibleContact(true);
  };

  const handleManualClick = () => {
    if (window.location.pathname !== "/") {
      navigate("/");

      setTimeout(() => {
        document.getElementById("how-it-works")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 200);

      return;
    }

    document.getElementById("how-it-works")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleProjectsClick = () => {
    window.open(
      "https://github.com/JesusAnguiano96/micrografias-front",
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <footer className="footer-container">
      <ul>
        <li>
          <button type="button" onClick={handleContactClick}>
            Contact
          </button>
        </li>

        <li>
          <button type="button" onClick={handleManualClick}>
            Manual
          </button>
        </li>

        <li>
          <button type="button" onClick={handleProjectsClick}>
            Project
          </button>
        </li>
      </ul>
    </footer>
  );
};
