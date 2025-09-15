import { Link } from 'react-router-dom';
import { selectIsAuthenticated, selectUser, useSelector, useDispatch } from '../store/store';
import './Header.css';
import { logout } from '../store/userSlice';

export const Header = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const logoutFunction = () => dispatch(logout());

    return (
        <div className="header">
            <nav className="links">
                <div className="links_main">
                    <Link to="/" className="link">Брокеры</Link>
                    <Link to="/stocks" className="link">Акции</Link>
                    <Link to="/imitation" className="link">Имитация</Link>
                </div>
                {!isAuthenticated && (
                    <Link to="/login" className="link">Войти</Link>
                )}
                {isAuthenticated && user && (
                    <button className="link logout" onClick={logoutFunction}>Выйти</button>
                )}
            </nav>
        </div>
    );
};