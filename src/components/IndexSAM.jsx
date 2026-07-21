import React from "react";
import { useContext } from "react";
import { context } from "./../context/context";
import { How } from "./How/How";
import { What } from "./What/What";
import image from "../image/microscope_tem.jpg";

export const Index = () => {
  const { setVisibleLogIn, setVisibleSignUp, user } = useContext(context);

  return (
    <>
      <div className="index-container">
        <div className="data-container">
          <div className="text-container">
            <h1>SYSTEM FOR SEGMENTATION AND COUNTING OF NANOPARTICLES</h1>
          </div>
          <div className="half-line"></div>
          <div className="description-container">
            <p>
              System to generate reports of size and quantity of nanoparticles
              in scanning electron microscope (SEM) and Transmission electron
              microscopes (TEM) micrographs.
            </p>
          </div>
          {user ? (
            <p className="menssage">Welcome {user.email}!</p>
          ) : (
            <div className="buttons-container">
              <button
                className="white-button"
                onClick={() => {
                  setVisibleLogIn(true);
                }}
              >
                Log in
              </button>
              <button
                className="black-button"
                onClick={() => {
                  setVisibleSignUp(true);
                }}
              >
                Sign up
              </button>
            </div>
          )}
        </div>
        <div className="image-container">
          <img
            className="main-image"
            src={image}
            alt="Micrograph Analysis System"
          />
        </div>
      </div>
      <div className="spacer layer1"></div>
      <What />
      <div className="spacer layer2"></div>
      <How />
    </>
  );
};
