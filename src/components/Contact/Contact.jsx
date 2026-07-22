import React from "react";

export const Contact = () => {
  return (
    <>
      <div className="form-container-container">
        <h1 className="tittle-form">Contact</h1>
        <section className="contact-container">
          <div className="contact-info">
            <div className="contact-person">
              <h3>Diego Alejandro Morales Bravo</h3>
              <p>
                Email:{" "}
                <a href="mailto:diegoMorales1359@gmail.com">
                  diegoMorales1359@gmail.com
                </a>
              </p>
            </div>
            <div className="contact-person">
              <h3>Iker Ismak Toscano Santos</h3>
              <p>
                Email:{" "}
                <a href="mailto:ikerismak@gmail.com">ikerismak@gmail.com</a>
              </p>
            </div>
            <div className="contact-person">
              <h3>Jesús Manuel Anguiano Pantaleón</h3>
              <p>
                Email:{" "}
                <a href="janguianopantaleon@gmail.com">ikerismak@gmail.com</a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
