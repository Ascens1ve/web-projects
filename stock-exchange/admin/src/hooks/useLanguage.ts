import { useSelector } from '../store/store';
export const useLanguage = () => useSelector((state) => state.user.language);
