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
  resumeAvailable: boolean;
  resumeStepIndex: number;
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
    title: 'Tapping “Too Low” lets you enter your own valuation',
    description: 'If you believe the listed price is too low, you can tap “Too Low” to input what you think the property’s actual value should be and submit your estimate.',
  },
  {
    id: 'step-too-high',
    targetId: 'too-high',
    title: 'Tapping “Too High” lets you enter your own valuation',
    description: 'If you believe the listed price is too high, you can tap “Too High” to input what you think the property’s value should be and submit your estimate.',
  },
  {
    id: 'step-just-right',
    targetId: 'just-right',
    title: '"“Just Right” means your estimate matches the current price',
    description: 'Tap “Just Right” when you believe the property’s listed value is accurate or close to its true market price.',
  },
  {
    id: 'step-enter-amount',
    targetId: 'enter-amount',
    title: 'Enter your valuation',
    description: 'Type in your estimated sales price for this property and tap Submit to record your valuation or hit Cancel to go back without saving.',
  },
  {
    id: 'step-history',
    targetId: 'history',
    title: 'View Rextimate history',
    description: 'Tap this icon to see a graphical chart showing the valuation trends and price history for this property.',
  },
  {
    id: 'step-home',
    targetId: 'home',
    title: 'Home takes you to the Valuation screen',
    description: 'Tap the Home icon to view all your open and closed listing valuations in one place.',
  },
];

const initialState: WalkthroughState = {
  isActive: false,
  currentStepIndex: 0,
  hasCompleted: false,
  steps: walkthroughSteps,
  targets: {},
  resumeAvailable: false,
  resumeStepIndex: 0,
};

const walkthroughSlice = createSlice({
  name: 'walkthrough',
  initialState,
  reducers: {
    startWalkthrough(state, action: PayloadAction<{ stepIndex?: number } | undefined>) {
      const requestedIndex = action?.payload?.stepIndex ?? 0;
      if (state.hasCompleted && requestedIndex === 0) {
        return;
      }
      state.isActive = true;
      state.currentStepIndex = Math.max(0, Math.min(requestedIndex, state.steps.length - 1));
      state.resumeAvailable = false;
      state.resumeStepIndex = state.currentStepIndex;
      console.log('Starting walkthrough at step 1');
    },
    advanceWalkthrough(state) {
      if (!state.isActive) {
        return;
      }
      const nextIndex = state.currentStepIndex + 1;
      // If the next index is beyond the last step, complete the walkthrough.
      if (nextIndex >= state.steps.length) {
        state.isActive = false;
        state.hasCompleted = true;
        state.resumeAvailable = false;
        console.log('Walkthrough completed!');
        return;
      }
      state.currentStepIndex = nextIndex;
      state.resumeStepIndex = nextIndex;
      console.log(`Walkthrough advanced to step ${state.currentStepIndex + 1}`);
    },
    skipWalkthrough(state) {
      state.isActive = false;
      state.hasCompleted = true;
      state.resumeAvailable = false;
    },
    completeWalkthrough(state) {
      state.isActive = false;
      state.hasCompleted = true;
      state.resumeAvailable = false;
    },
    syncWalkthroughCompletion(state, action: PayloadAction<boolean>) {
      state.hasCompleted = action.payload;
      if (action.payload) {
        state.isActive = false;
        state.resumeAvailable = false;
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
      state.resumeAvailable = false;
      state.resumeStepIndex = 0;
    },
    resetWalkthroughForDevelopment(state) {
      state.isActive = false;
      state.currentStepIndex = 0;
      state.hasCompleted = false;
      state.targets = {};
      state.resumeAvailable = false;
      state.resumeStepIndex = 0;
    },
    dismissWalkthrough(state) {
      if (!state.isActive) {
        return;
      }
      state.isActive = false;
      state.resumeAvailable = true;
      state.resumeStepIndex = state.currentStepIndex;
    },
    resumeWalkthrough(state) {
      if (!state.resumeAvailable) {
        return;
      }
      state.isActive = true;
      state.resumeAvailable = false;
      state.currentStepIndex = state.resumeStepIndex;
    },
    ignoreWalkthroughPrompt(state) {
      state.resumeAvailable = false;
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
  dismissWalkthrough,
  resumeWalkthrough,
  ignoreWalkthroughPrompt,
} = walkthroughSlice.actions;

export default walkthroughSlice.reducer;
