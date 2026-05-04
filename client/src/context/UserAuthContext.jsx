import React, { createContext, useContext, useState } from 'react';

const UserAuthContext = createContext(null);

export const UserAuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(() => localStorage.getItem('user_token'));
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('user_data');
    return stored ? JSON.parse(stored) : null;
  });

  const userLogin = (token, userData) => {
    localStorage.setItem('user_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUserToken(token);
    setCurrentUser(userData);
  };

  const userLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
    setUserToken(null);
    setCurrentUser(null);
  };

  return (
    <UserAuthContext.Provider value={{ userToken, currentUser, userLogin, userLogout, isUserLoggedIn: !!userToken }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider');
  return ctx;
};

export default UserAuthContext;
