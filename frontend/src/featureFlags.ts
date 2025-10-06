// Simple feature-flag module so we can toggle features without changing code paths
export const featureFlags = {
  enableWorkloadView: true,
}

export type FeatureFlags = typeof featureFlags


