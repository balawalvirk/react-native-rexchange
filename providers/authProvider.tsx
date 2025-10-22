import { createContext, useContext, useEffect, useState } from 'react';
import { RXCUser } from '../lib/models/rxcUser';
import { getAuth, signOut } from 'firebase/auth';
import { getUser } from '../firebase/collections/users';
import AsyncStorage from '@react-native-async-storage/async-storage';
import app from '../firebase/config';

const AuthContext = createContext<{
  user: RXCUser | null;
  setUser: (args?: any) => any;
  isLoading: boolean;
}>({
  user: null,
  setUser: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<RXCUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Always clear Firebase auth on first build only
        const firstBuildFlag = await AsyncStorage.getItem('firstBuildCompleted');
        
        if (!firstBuildFlag) {
          await AsyncStorage.setItem('firstBuildCompleted', 'true');
          
          // Clear Firebase auth data
          const auth = getAuth(app);
          if (auth.currentUser) {
            await signOut(auth);
          }
          
          // Clear Firebase AsyncStorage auth data
          try {
            await AsyncStorage.removeItem('firebase:authUser:' + '[DEFAULT]');
            await AsyncStorage.removeItem('firebase:authUser:');
          } catch (error) {
            // AsyncStorage clear failed (this is normal)
          }
        }
        
        // Set up the auth state listener - this is the normal flow
        return getAuth(app).onAuthStateChanged(async (user) => {
          // If no user, just set loading to false
          if (!user) {
            setUser(null);
            setIsLoading(false);
            return;
          }
          
          const { uid } = user;
          try {
            const rxcUser = await getUser(uid);
            // Ensure Firebase user email is available
            setUser({ ...rxcUser, email: user.email || rxcUser.emailAddress });
            setIsLoading(false);
          } catch (error: any) {
            console.error('Error getting user:', error);
            setUser(null);
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsLoading(false);
        setUser(null);
      }
    };
    
    let unsubscribe: any;
    initializeAuth().then((unsub) => {
      unsubscribe = unsub;
    }).catch(error => {
      console.error('Auth initialization failed:', error);
      setIsLoading(false);
      setUser(null);
    });
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // force refresh the token every 10 minutes
  useEffect(() => {
    const handle = setInterval(async () => {
      const user = getAuth().currentUser;
      if (user) await user.getIdToken(true);
    }, 10 * 60 * 1000);

    // clean up setInterval
    return () => clearInterval(handle);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Add helper function for development to reset build timestamp
  const resetBuildTimestamp = async () => {
    if (__DEV__) {
      await AsyncStorage.removeItem('buildTimestamp');
    }
  };
  
  return {
    ...context,
    resetBuildTimestamp,
  };
};