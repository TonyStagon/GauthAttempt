import { useRef, useCallback } from 'react';

/**
 * Hook for optimized gesture handling that minimizes re-renders
 * and prevents gesture interruption due to React state updates
 */
export const useOptimizedGesture = (initialValue = null) => {
    const gestureRef = useRef(initialValue);

    const updateGesture = useCallback((getter) => {
        if (typeof getter === 'function') {
            gestureRef.current = getter(gestureRef.current);
        } else {
            gestureRef.current = getter;
        }
    }, []);

    const clearGesture = useCallback(() => {
        gestureRef.current = initialValue;
    }, [initialValue]);

    return {
        gestureRef,
        updateGesture,
        clearGesture,
    };
};

/**
 * Hook for throttled timeouts specifically designed for gesture events
 */
export const useThrottledTimeout = (delay = 16) => {
    const timeoutRef = useRef(null);
    const lastExecutionRef = useRef(0);

    const setThrottledTimeout = useCallback((callback, customDelay = delay) => {
        const now = Date.now();
        const timeSinceLastExecution = now - lastExecutionRef.current;

        if (timeSinceLastExecution < customDelay) {
            // Too soon, clear and reset
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            lastExecutionRef.current = Date.now();
            callback();
        }, Math.max(0, customDelay - timeSinceLastExecution));

    }, [delay]);

    const clearTimeout = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    return {
        setThrottledTimeout,
        clearTimeout,
    };
};