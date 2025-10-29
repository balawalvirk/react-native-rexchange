import React, { useCallback, useEffect, useRef } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  unregisterTarget,
  updateTargetLayout,
} from '../../store/walkthroughSlice';

type WalkthroughTargetProps = {
  id: string;
  children: React.ReactNode;
};

const WalkthroughTarget: React.FC<WalkthroughTargetProps> = ({
  id,
  children,
}) => {
  const dispatch = useAppDispatch();
  const isActiveTarget = useAppSelector((state: any) => {
    const step = state.walkthrough.steps[state.walkthrough.currentStepIndex];
    return (
      state.walkthrough.isActive && step && step.targetId === id
    );
  });

  const ref = useRef<View>(null);

  const measureTarget = useCallback(() => {
    if (!ref.current) {
      return;
    }
    ref.current.measureInWindow((x, y, width, height) => {
      if (width && height) {
        console.log(`Registering target: ${id} at (${x}, ${y}) size ${width}x${height}`);
        dispatch(updateTargetLayout({ id, layout: { x, y, width, height } }));
      }
    });
  }, [dispatch, id]);

  const handleLayout = useCallback(
    (_event: LayoutChangeEvent) => {
      measureTarget();
    },
    [measureTarget]
  );

  useEffect(() => {
    measureTarget();
  }, [measureTarget, isActiveTarget]);

  useEffect(() => {
    return () => {
      dispatch(unregisterTarget(id));
    };
  }, [dispatch, id]);

  return (
    <View
      ref={ref}
      collapsable={false}
      onLayout={handleLayout}
      pointerEvents={isActiveTarget ? 'none' : 'auto'}
      style={isActiveTarget ? { opacity: 0 } : undefined}
    >
      {children}
    </View>
  );
};

export default WalkthroughTarget;
