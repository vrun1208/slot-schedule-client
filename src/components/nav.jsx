import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/navBar.css';

const NavBar = () => {
    return (
        <nav className='navbar'>
          <ul className='nav-list'>
            <li className='nav-items'>
              <Link to='/' className='nav-link'>Physio view</Link>
            </li>
            <li className='nav-items'>
              <Link to='/sales' className='nav-link'>Sales/Ops's view</Link>
            </li>
            <li className='nav-items'>
              <Link to='/user' className='nav-link'>Patient's view</Link>
            </li>
          </ul>
        </nav>
    )
}

export default NavBar;