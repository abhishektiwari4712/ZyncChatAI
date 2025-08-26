import { LoaderIcon } from "lucide-react";
import React from "react";
import "./PageLoader.css"; // Import the CSS

const PageLoader = () => {
  return (
    <div className="page-loader">
      <LoaderIcon className="loader-icon" />
    </div>
  );
};

export default PageLoader;
