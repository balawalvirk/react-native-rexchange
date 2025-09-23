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
      console.log('hasLaunchedBefore:', hasLaunchedBefore);
      
      if (hasLaunchedBefore === null) {
        console.log('🚨 FIRST LAUNCH DETECTED - Clearing auth session');
        await AsyncStorage.setItem('hasLaunchedBefore', 'true');
        
        // Wait for Firebase Auth to initialize and load any persisted user
        return new Promise((resolve) => {
          const auth = getAuth(app);
          
          // Listen for auth state to initialize
          const unsubscribe = auth.onAuthStateChanged(async (user) => {
            console.log('Auth initialized with user:', user?.email || 'no user');
            
            if (user) {
              console.log('🧹 Signing out existing user:', user.email);
              await signOut(auth);
              console.log('✅ Auth cleared successfully');
            } else {
              console.log('ℹ️ No existing user to clear');
            }
            
            unsubscribe(); // Stop listening
            resolve(undefined);
          });
        });
      } else {
        console.log('ℹ️ Not first launch, keeping existing auth');
      }
    } catch (error) {
      console.log('❌ Error clearing auth on first launch:', error);
    }
  };
  
  useEffect(() => {
    const initializeAuth = async () => {
      // Clear auth on first launch BEFORE setting up listener
      await clearAuthOnFirstLaunch();
      
      // Now set up the auth state listener
      return getAuth(app).onAuthStateChanged(async (user) => {
        console.log({ user });
        
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
    };
    
    let unsubscribe: any;
    initializeAuth().then((unsub) => {
      unsubscribe = unsub;
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
