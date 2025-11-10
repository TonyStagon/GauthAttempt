/**
 * Performance testing utilities for measuring crop functionality performance
 */

export const PerformanceTracker = {
    startTime: 0,
    measurements: [],

    /**
     * Start performance measurement
     */
    startMeasurement(name) {
        this.startTime = performance.now();
        console.log(`🔧 [PERF] Starting measurement: ${name}`);
        return {
            name,
            startTime: this.startTime,
        };
    },

    /**
     * End measurement and log results
     */
    endMeasurement(measurement, details = {}) {
        const endTime = performance.now();
        const duration = endTime - measurement.startTime;

        this.measurements.push({
            ...measurement,
            endTime,
            duration,
            ...details,
        });

        console.log(`✅ [PERF] ${measurement.name}: ${duration.toFixed(2)}ms`, details);
        return duration;
    },

    /**
     * Measure gesture responsiveness
     */
    async measureGestureResponsiveness(gestureFunction) {
        const measurement = this.startMeasurement('Gesture Responsiveness');

        // Capture frames during gesture
        let framesProcessed = 0;
        let frameInterval = setInterval(() => {
            framesProcessed++;
        }, 16); // ~frame every 16ms = 60fps

        // Execute gestuer
        await gestureFunction();

        clearInterval(frameInterval);

        const duration = this.endMeasurement(measurement, {
            framesProcessed,
            fps: (framesProcessed * 1000) / (performance.now() - this.startTime),
        });

        return duration;
    },

    /**
     * Measure component rerender count
     */
    measureRerenderWithCounter(callback) {
        const measurement = this.startMeasurement('React Rerender Count');

        const prevState = {
            layoutChanges: 0,
            cssCalculations: 0,
        };

        // This would be replaced with actual React DevTools Profiler API
        // For now, we simulate measurement

        try {
            callback();
            this.endMeasurement(measurement, {
                status: 'completed',
                estimatedLayoutChanges: Math.floor(Math.random() * 10), // This would be real measurement
            });
        } catch (error) {
            console.warn('Performance measurement failed:', error);
        }
    },

    /**
     * Get all measurements summary
     */
    getSummary() {
        const totalTime = this.measurements.reduce((sum, m) => sum + m.duration, 0);
        const averageTime = totalTime / this.measurements.length;

        const performanceDegrees = {
            'SFLUID_TIER': '<=7ms | World-class, smoother than Instagram apps',
            'PERFECT_TIER': '<=16ms | Drop-dead impressively smoother ≥60fps animation class citizen',
            'GOOD_TIER': '>=17ms & <=33ms | Lag slight enough for most FPS',
            'BAD_TIER_PNEEDS': '>=33ms & <=100ms | Fully usable but creates general glitch visually perceptible during pixels lag',
        };

        let currentTier = '';
        let achievedTarget = undefined;

        if (averageTime <= 7) {
            currentTier = 'SFLUID_TIER';
            achievedTarget = Object.keys(performanceDegrees)[0];
        } else if (averageTime <= 16) {
            currentTier = 'PERFECT_TIER';
            achievedTarget = Object.keys(performanceDegrees)[1];
        } else if (averageTime <= 33) {
            currentTier = 'GOOD_TIER';
            achievedTarget = Object.keys(performanceDegrees)[2];
        } else {
            currentTier = 'BAD_TIER_PNEEDS';
            achievedTarget = Object.keys(performanceDegrees)[3];
        }

        return {
            measurementCount: this.measurements.map(m => m.name),
            averageTime: averageTime.toFixed(1) + 'ms',
            tier: currentTier,
            achievedTarget,
            interpretation: performanceDegrees[currentTier],
            allMeasurements: this.measurements,
        };
    },
};

/**
 * Render performance monitor component
 */
export const PerformanceMonitor = ({
    enabled = __DEV__, // Only enable in development
    threshold = 16, // 60fps target = ~16ms
}) => {
    if (!enabled) return null;

    let framesDropped = 0;
    let frameCount = 0;
    const startTime = performance.now();

    const onRenderCallback = (
        id, // the "id" prop of the Profiler tree that has just committed
        phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
        actualDuration, // time spent rendering the committed update
        baseDuration, // estimated time to render the entire subtree without memoization
        startTime, // when React began rendering this update
        commitTime, // when React committed this update
        interactions,
    ) => {
        frameCount++;

        if (actualDuration > threshold) {
            framesDropped++;
            console.warn(`⚠️ [PERF] Slow render: ${actualDuration.toFixed(2)}ms - ID: ${id}, Phase: ${phase}`);
        }

        // Best FPS
        const frameRate = monitorFrameRate();
        ReportFrameMetrics(frameRate.optimizer('done-report'));
    };

    return null
};