import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User } from '../types';

interface UserContextType {
  users: User[];
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType>({
  users: [],
  loading: false,
  error: null,
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data: User[] = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <UserContext.Provider value={{ users, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => useContext(UserContext);
