



import React, { createContext, useState, useContext, useEffect } from 'react';
import { type User, type PermissionId } from '../types';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  currentUser: User | null;
  login: (identifier: string, pass: string) => boolean;
  logout: () => void;
  updateCurrentUser: (updatedUser: User) => void;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: () => false,
  logout: () => {},
  updateCurrentUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const { users, setUsers } = useContext(UserContext);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const login = (identifier: string, pass: string): boolean => {
    const user = users.find(u => 
      (u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase()) 
      && u.password === pass
      && u.status === 'Active'
    );

    if (user) {
      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      
      // Update the master user list in context/localStorage
      setUsers(currentUsers => 
        currentUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
      );

      setCurrentUser(updatedUser);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };
  
  const updateCurrentUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};