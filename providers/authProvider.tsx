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
  
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // For development: Only clear auth data on fresh builds, not on app restarts
        if (__DEV__) {
          const buildTimestamp = await AsyncStorage.getItem('buildTimestamp');
          const currentBuildTimestamp = Date.now().toString();
          
          // Only clear auth if this is a fresh build (no buildTimestamp stored)
          if (buildTimestamp === null) {
            console.log('🔄 Fresh build detected - clearing any existing auth data');
            await AsyncStorage.setItem('buildTimestamp', currentBuildTimestamp);
            
            // Clear any existing auth data
            const auth = getAuth(app);
            if (auth.currentUser) {
              await signOut(auth);
              console.log('🔄 Cleared existing user on fresh build');
            }
            
            // Clear AsyncStorage auth data
            try {
              await AsyncStorage.removeItem('firebase:authUser:' + '[DEFAULT]');
              await AsyncStorage.removeItem('firebase:authUser:');
              console.log('🔄 Cleared AsyncStorage auth data on fresh build');
            } catch (error) {
              console.log('🔄 AsyncStorage clear failed (this is normal)');
            }
          } else {
            console.log('🔄 Existing build - preserving auth state');
          }
        }
        
        // Set up the auth state listener - this is the normal flow
        return getAuth(app).onAuthStateChanged(async (user) => {
          console.log('🔄 Auth state changed:', user ? `User: ${user.uid}` : 'No user');
          
          // Keep loading state until we determine where to navigate
          if (!user) {
            console.log('🔄 No user - navigating to promo-code');
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
        console.error('Auth initialization error:', error);
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
      console.log('🔄 Build timestamp reset - will clear auth data on next launch');
    }
  };
  
  return {
    ...context,
    resetBuildTimestamp,
  };
};
