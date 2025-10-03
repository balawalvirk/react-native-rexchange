import { createContext, useContext, useEffect, useState } from 'react';
import { RXCUser } from '../lib/models/rxcUser';
import { getAuth, signOut } from 'firebase/auth';
import { getUser } from '../firebase/collections/users';
import { useNavigation } from '@react-navigation/native';
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
  const navigation = useNavigation();
  
  // Clear auth on first launch to prevent auto-login with previous user
  const clearAuthOnFirstLaunch = async () => {
    try {
      const hasLaunchedBefore = await AsyncStorage.getItem('hasLaunchedBefore');
      
      if (hasLaunchedBefore === null) {
        await AsyncStorage.setItem('hasLaunchedBefore', 'true');
        
        // Wait for Firebase Auth to initialize and load any persisted user
        return new Promise((resolve) => {
          const auth = getAuth(app);
          
          // Listen for auth state to initialize
          const unsubscribe = auth.onAuthStateChanged(async (user) => {
            
            if (user) {
              await signOut(auth);
            } else {
            }
            
            unsubscribe(); // Stop listening
            resolve(undefined);
          });
        });
      } else {
        // Return immediately for subsequent launches
        return Promise.resolve();
      }
      } catch (error) {
        // Handle error silently
      }
  };
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Clear auth on first launch BEFORE setting up listener
        await clearAuthOnFirstLaunch();
        
        // Now set up the auth state listener
        return getAuth(app).onAuthStateChanged(async (user) => {
        
        // Keep loading state until we determine where to navigate
        if (!user) {
          setUser(null);
          setIsLoading(false);
          // Reset navigation stack to promo-code
          (navigation as any).reset({
            index: 0,
            routes: [{ name: 'promo-code' }],
          });
          return;
        }
        
        const { uid } = user;
        try {
          const rxcUser = await getUser(uid);
          // Ensure Firebase user email is available
          setUser({ ...rxcUser, email: user.email || rxcUser.emailAddress });
          
          // Navigate directly to the appropriate screen based on user type
          if (rxcUser.isOpenHouse) {
            (navigation as any).reset({
              index: 0,
              routes: [{ name: 'open-house-home' }],
            });
          } else {
            (navigation as any).reset({
              index: 0,
              routes: [{ name: 'game' }],
            });
          }
          setIsLoading(false);
        } catch (error: any) {
          setIsLoading(false);
          // Reset navigation stack to user-data
          (navigation as any).reset({
            index: 0,
            routes: [{ name: 'user-data' }],
          });
        }
      });
      } catch (error) {
        setIsLoading(false);
        setUser(null);
        // Navigate to promo-code on error
        (navigation as any).reset({
          index: 0,
          routes: [{ name: 'promo-code' }],
        });
      }
    };
    
    let unsubscribe: any;
    initializeAuth().then((unsub) => {
      unsubscribe = unsub;
    }).catch(error => {
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
  return useContext(AuthContext);
};
