import { AnalyticsEvent } from './community-types';

const STORAGE_KEY = 'ideacheck_analytics_events';

export function trackEvent(
  eventName: string,
  metadata?: Record<string, any>,
  userId?: string,
  projectId?: string
): AnalyticsEvent {
  const event: AnalyticsEvent = {
    id: 'evt_' + Math.random().toString(36).substring(2, 9),
    eventName,
    userId,
    projectId,
    metadata,
    timestamp: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const list: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];
      list.unshift(event);
      // Keep most recent 500 events
      if (list.length > 500) list.pop();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to record analytics event', e);
    }
  }

  return event;
}

export function getStoredAnalyticsEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}
