import { createContext, ReactNode, useState } from "react";

type User = {
  nome: string;
  email: string;
  senha: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, senha: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: User[] = [
  { nome: "Matheus Nogueira", email: "matheus@gmail.com", senha: "123456" },
  { nome: "João da Silva", email: "joao@gmail.com", senha: "012345" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, senha: string): boolean => {
    const buscaUser = mockUsers.find((u) => u.email === email);
    if (buscaUser && buscaUser.senha === senha) {
      setUser(buscaUser);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export { AuthContext };
