import { backendUrl } from '@/api';
import { terminateCrispSession } from '@/services/Crisp';

import { LOGIN_URL, LOGOUT_URL } from './conf';

export const gotoLogin = (returnTo = '/') => {
  const authenticateUrl = LOGIN_URL + `?returnTo=${backendUrl() + returnTo}`;
  window.location.replace(authenticateUrl);
};

export const gotoLogout = () => {
  terminateCrispSession();
  window.location.replace(LOGOUT_URL);
};
