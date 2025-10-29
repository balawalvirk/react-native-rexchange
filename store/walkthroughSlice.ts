import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { LayoutRectangle } from 'react-native';

type WalkthroughStep = {
  id: string;
  targetId: string;
  title: string;
  description: string;
};

type WalkthroughState = {
  isActive: boolean;
  currentStepIndex: number;
  hasCompleted: boolean;
  steps: WalkthroughStep[];
  targets: Record<string, LayoutRectangle | null>;
};

const walkthroughSteps: WalkthroughStep[] = [
  {
    id: 'step-more-info',
    targetId: 'more-info',
    title: '"More info" shows complete property insights',
    description: 'View full details including list price, price per square foot, property condition, lot size, and other key facts about the listing.',
  },
  {
    id: 'step-too-low',
    targetId: 'too-low',
    title: 'Tap "Too Low" to enter your own valuation',
    description: 'If you believe the listed price is too low, tap "Too Low" to input what you think the property\'s actual value should be and submit your estimate.',
  },
  {
    id: 'step-too-high',
    targetId: 'too-high',
    title: 'Tap "Too High" to raise the valuation',
    description: 'Use "Too High" when you think the listing price overshoots the real market value. Enter your number and submit your valuation.',
  },
  {
    id: 'step-just-right',
    targetId: 'just-right',
    title: '"Just Right" means your estimate matches the current price',
    description: 'If the current Rextimate looks accurate, tap "Just Right" to lock it in without entering a custom amount.',
  },
  {
    id: 'step-enter-amount',
    targetId: 'enter-amount',
    title: 'Enter your valuation',
    description: 'When you select "Too Low" or "Too High", you can enter a custom amount. This input field appears after selecting your position.',
  },
  {
    id: 'step-history',
    targetId: 'history',
    title: 'View Rextimate history',
    description: 'Tap this icon to see trend charts showing the valuation history and price movement for the property.',
  },
  {
    id: 'step-home',
    targetId: 'home',
    title: 'Home takes you to the Valuation screen',
    description: 'Tap the Home icon to view all of your open and closed listing valuations in one place.',
  },
];

const initialState: WalkthroughState = {
  isActive: false,
  currentStepIndex: 0,
  hasCompleted: false,
  steps: walkthroughSteps,
  targets: {},
};

const walkthroughSlice = createSlice({
  name: 'walkthrough',
  initialState,
  reducers: {
    startWalkthrough(state) {
      if (state.hasCompleted) {
        return;
      }
      state.isActive = true;
      state.currentStepIndex = 0;
      console.log('Starting walkthrough at step 1');
    },
    advanceWalkthrough(state) {
      if (!state.isActive) {
        return;
      }
      state.currentStepIndex += 1;
      console.log(`Walkthrough advanced to step ${state.currentStepIndex + 1}`);
      
      if (state.currentStepIndex >= state.steps.length - 1) {
        state.isActive = false;
        state.hasCompleted = true;
        console.log('Walkthrough completed!');
      }
    },
    skipWalkthrough(state) {
      state.isActive = false;
      state.hasCompleted = true;
    },
    completeWalkthrough(state) {
      state.isActive = false;
      state.hasCompleted = true;
    },
    syncWalkthroughCompletion(state, action: PayloadAction<boolean>) {
      state.hasCompleted = action.payload;
      if (action.payload) {
        state.isActive = false;
      }
    },
    updateTargetLayout(
      state,
      action: PayloadAction<{ id: string; layout: LayoutRectangle }>
    ) {
      state.targets[action.payload.id] = action.payload.layout;
    },
    unregisterTarget(state, action: PayloadAction<string>) {
      delete state.targets[action.payload];
    },
    resetWalkthroughState(state) {
      state.isActive = false;
      state.currentStepIndex = 0;
      state.targets = {};
    },
    resetWalkthroughForDevelopment(state) {
      state.isActive = false;
      state.currentStepIndex = 0;
      state.hasCompleted = false;
      state.targets = {};
    },
  },
});

export const {
  startWalkthrough,
  advanceWalkthrough,
  skipWalkthrough,
  completeWalkthrough,
  syncWalkthroughCompletion,
  updateTargetLayout,
  unregisterTarget,
  resetWalkthroughState,
  resetWalkthroughForDevelopment,
} = walkthroughSlice.actions;

export default walkthroughSlice.reducer;
