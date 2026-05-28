import { NavLink } from 'react-router-dom';
import Logo from './Logo.jsx';

const links = [
  ['Products', '/products'],
  ['Docs', '/docs'],
  ['Notes', '/notes'],
  ['Careers', '/careers'],
  ['Directory', '/directory'],
  ['Environments', '/environments'],
];

export default function Header() {
  return (
    <header>
      <Logo />
      <nav aria-label="Primary navigation">
        {links.map(([label, to]) => (
          <NavLink key={to} to={to}>{label}</NavLink>
        ))}
      </nav>
    </header>
  );
}
