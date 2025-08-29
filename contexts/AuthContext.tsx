

import React, { createContext, useState, useContext, useEffect } from 'react';
import { type User, type PermissionId } from '../types';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';
import { sql } from '../services/db';

interface AuthContextType {
  currentUser: User | null;
  login: (identifier: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateCurrentUser: (updatedUser: User) => void;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: async () => false,
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

  const { users } = useContext(UserContext); // Still used for fallback or quick access if needed

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const login = async (identifier: string, pass: string): Promise<boolean> => {
    try {
      const result = await sql`
        SELECT * FROM users 
        WHERE (LOWER(email) = LOWER(${identifier}) OR LOWER(username) = LOWER(${identifier}))
          AND password = ${pass}
          AND status = 'Active'
      `;

      if (result.length > 0) {
        const dbUser = result[0] as any;
        // Convert comma-separated strings back to arrays and map to User type
        // FIX: Explicitly construct the User object from the database result to fix the type error.
        const user: User = {
          id: dbUser.id,
          username: dbUser.username,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          status: dbUser.status,
          password: dbUser.password,
          photoUrl: dbUser.photoUrl,
          permissions: dbUser.permissions ? (dbUser.permissions as string).split(',') as PermissionId[] : [],
          plant: dbUser.plant ? (dbUser.plant as string).split(',') : [],
          lastLogin: new Date().toISOString(), // Update last login time
        };
        
        // Asynchronously update last login in DB without waiting
        sql`UPDATE users SET "lastLogin" = ${user.lastLogin} WHERE id = ${user.id}`;

        setCurrentUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login database error:", error);
      // Fallback for initial admin user if DB fails or is empty
      const localUser = users.find(u => 
        (u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase()) && u.password === pass
      );
      if (localUser) {
        setCurrentUser(localUser);
        return true;
      }
      return false;
    }
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
