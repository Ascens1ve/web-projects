import { Link } from 'react-router-dom';
import {
  selectIsAuthenticated,
  selectUser,
  useSelector,
  useDispatch,
} from '../store/store';
import styles from './Header.module.css';
import { logout } from '../store/userSlice';

export const Header = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const logoutFunction = () => dispatch(logout());

  return (
    <div className={styles.header}>
      <nav className={styles.links}>
        <div className={styles.links_main}>
          <Link to='/' className={styles.link}>
            Брокеры
          </Link>
          <Link to='/stocks' className={styles.link}>
            Акции
          </Link>
          <Link to='/imitation' className={styles.link}>
            Имитация
          </Link>
        </div>
        {!isAuthenticated && (
          <Link to='/login' className={styles.link}>
            Войти
          </Link>
        )}
        {isAuthenticated && user && (
          <button className={styles.link} onClick={logoutFunction}>
            Выйти
          </button>
        )}
      </nav>
    </div>
  );
};
