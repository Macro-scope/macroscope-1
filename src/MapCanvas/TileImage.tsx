'use client'
import React, { useEffect, useState } from "react";

type Props = {
  imageUrl: string;
};

const TileImage = (props: Props) => {
  return (
    <div>
        <img src={props.imageUrl} alt="Logo" className="h-7 w-7 rounded-sm" />
    </div>
  );
};

export default TileImage;

