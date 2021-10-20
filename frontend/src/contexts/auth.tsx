import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

interface IAuthResponse {
  token: string;
  user: {
    id: string;
    avatar_url: string;
    name: string;
    login: string;
  };
}

interface User {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}

interface IAuthContextData {
  user: User | null;
  signInUrl: string;
  signOut: () => void;
}

interface IAuthProvider {
  children: ReactNode;
}

export const AuthContext = createContext({} as IAuthContextData);

export function AuthProvider({ children }: IAuthProvider) {
  const [user, setUser] = useState<User | null>(null);
  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=b4e00c9ca65f8f9836c5`;

  async function signIn(gitHubCode: string) {
    const response = await api.post<IAuthResponse>("authenticate", {
      code: gitHubCode,
    });

    const { token, user } = response.data;

    localStorage.setItem("@nlw-heat:token", token);

    setUser(user);
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem("@nlw-heat:token");
  }

  useEffect(() => {
    const token = localStorage.getItem("@nlw-heat:token");

    if (token) {
      api.defaults.headers.common.authorization = `Bearer ${token}`;
      async function getProfile() {
        try {
          const response = await api.get<User>("profile");
          setUser(response.data);
        } catch (error) {
          console.log(error);
        }
      }
      getProfile();
    }
  }, []);

  useEffect(() => {
    const url = window.location.href;
    const hasGithubCode = url.includes("?code=");

    if (hasGithubCode) {
      const [urlWithoutCode, githubCode] = url.split("?code=");
      window.history.pushState({}, "", urlWithoutCode);
      signIn(githubCode);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ signInUrl, user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
