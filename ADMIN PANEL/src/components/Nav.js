import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import home from '../images/home.png';
import create from '../images/new.png';
import update from '../images/update.png';
import trash from '../images/trash.png';
import logout from '../images/logout.png';
import '../App.css';
import "./css/nav.css"

const Nav = () => {
  const { pathname } = useLocation();
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const inactiveLink = 'd-flex p-3 my-3 text-white';
  const activeLink = inactiveLink + ' bg-primary text-white rounded';

  return (

    <>
      <div className="menu-icon" onClick={toggleMenu}>
        <div className={`hamburger ${isMenuOpen ? 'open' : 'close'}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <aside className={`min-vh-100 ${isMenuOpen ? 'menu-open' : 'menu-close'}`} id='navContainer'>

        <div className="menu-links">
          <Link to="/" className={pathname === '/' ? activeLink : inactiveLink} onClick={closeMenu}>
            <img src={home} alt='home' className='mx-2'></img>
            <p className='nav-title mx-2'>ELearning</p>
          </Link>
          <Link to="/new" className={pathname === '/new' ? activeLink : inactiveLink} onClick={closeMenu}>
            <img src={create} alt='create' className='mx-2'></img>
            <p className='nav-title mx-2'>New Course</p>
          </Link>
          <Link to="/update" className={pathname.includes('/update') ? activeLink : inactiveLink} onClick={closeMenu}>
            <img src={update} alt='update' className='mx-2'></img>
            <p className='nav-title mx-2'>Update</p>
          </Link>
          <Link to="/delete" className={pathname === '/delete' ? activeLink : inactiveLink} onClick={closeMenu}>
            <img src={trash} alt='delete' className='mx-2'></img>
            <p className='nav-title mx-2'>Delete</p>
          </Link>
          <Link to="/logout" className={pathname === '/logout' ? activeLink : inactiveLink} onClick={closeMenu}>
            <img src={logout} alt='logout' className='mx-2'></img>
            <p className='nav-title mx-2'>Logout</p>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Nav;