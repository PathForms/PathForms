"use client";
import React from "react";

import Interface from "../_components/Interface";

const Dual = () => {
  return (
    <div className="cayley">
      <Interface defaultShape="rect" showDualTransforms />
    </div>
  );
};

export default Dual;
