import React, { useContext } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";

import { context } from "./../context/context";

import { History } from "../components/History/History";
import { Index as IndexSAM } from "../components/IndexSAM";
import { Footer } from "./../components/Layout/Footer";
import { Navbar as NavbarSAM } from "./../components/Layout/NavbarSAM";
import { Report } from "../components/Report/Report";

export const Router = () => {
  const { user } = useContext(context);

  return (
    <BrowserRouter>
      <NavbarSAM />

      <Routes>
        {user ? (
          <>
            <Route path="/report" element={<Report />} />
            <Route path="/history" element={<History />} />
          </>
        ) : null}

        <Route path="/" element={<IndexSAM />} />
        <Route path="/*" element={<Navigate to="/" />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};
