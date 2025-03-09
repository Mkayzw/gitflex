// Firebase authentication service for GitFlex
import { User, signInWithPopup, signOut, GithubAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Types for user data
export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  githubUsername: string | null;
  lastAnalysis?: {
    timestamp: number;
    score: number;
    metrics: {
      commitFrequency: number;
      codeQuality: number;
      projectDiversity: number;
      contributionImpact: number;
    };
  };
  analysisHistory?: Array<{
    timestamp: number;
    score: number;
    metrics: {
      commitFrequency: number;
      codeQuality: number;
      projectDiversity: number;
      contributionImpact: number;
    };
  }>;
}

// Initialize GitHub auth provider
const githubProvider = new GithubAuthProvider();

// Sign in with GitHub
export const signInWithGithub = async (): Promise<UserData> => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const credential = GithubAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    
    // Get GitHub username from user profile
    const githubUsername = result.user.providerData[0]?.uid;
    
    // Create or update user document in Firestore
    const userData: UserData = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      githubUsername,
    };
    
    await setDoc(doc(db, 'users', result.user.uid), userData, { merge: true });
    return userData;
  } catch (error: any) {
    console.error('Error signing in with GitHub:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Get user data from Firestore
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error: any) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

// Update user's analysis data
export const updateUserAnalysis = async (uid: string, analysisData: UserData['lastAnalysis']) => {
  try {
    const userData = await getUserData(uid);
    if (!userData) throw new Error('User not found');
    
    // Update last analysis
    const updatedData: Partial<UserData> = {
      lastAnalysis: analysisData,
      analysisHistory: [
        ...(userData.analysisHistory?.filter(entry => entry !== undefined) ?? []),
        analysisData
      ].slice(-10) // Keep last 10 analyses
    };
    
    await setDoc(doc(db, 'users', uid), updatedData, { merge: true });
  } catch (error: any) {
    console.error('Error updating user analysis:', error);
    throw error;
  }
};

// Subscribe to auth state changes
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};