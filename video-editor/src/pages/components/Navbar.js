import React from 'react';
import '../../App.css'; // Ensure you import the CSS file

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo  mx-2">Video Clipper</div>
      <div className="nav-links  mx-2">
        <a className="nav-link text-white  mx-2" href="../ ">Make Clips</a>
        <a className="nav-link text-white  mx-2" href="/clips">Watch your clips</a>
      </div>
    </nav>
  );
};

export default Navbar;
