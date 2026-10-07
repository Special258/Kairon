/**
 * Utility for real-time timezone, location detection, and dynamic intelligence greetings.
 */

export interface UserLocationTimeInfo {
  timeZone: string;
  city: string;
  region: string;
  countryOrContinent: string;
  utcOffset: string;
  timezoneShort: string;
  timezoneLong: string;
  localTimeString: string;
  period: 'morning' | 'afternoon' | 'evening' | 'night';
  hour: number;
}

const CITY_NAME_OVERRIDES: Record<string, string> = {
  'Asia/Calcutta': 'Kolkata, India',
  'Asia/Kolkata': 'Kolkata, India',
  'Asia/Mumbai': 'Mumbai, India',
  'Asia/Delhi': 'New Delhi, India',
  'America/New_York': 'New York, USA',
  'America/Los_Angeles': 'San Francisco / LA, USA',
  'America/Chicago': 'Chicago, USA',
  'Europe/London': 'London, UK',
  'Europe/Paris': 'Paris, France',
  'Europe/Berlin': 'Berlin, Germany',
  'Asia/Tokyo': 'Tokyo, Japan',
  'Asia/Singapore': 'Singapore',
  'Asia/Dubai': 'Dubai, UAE',
  'Australia/Sydney': 'Sydney, Australia',
  'America/Toronto': 'Toronto, Canada'
};

export function getUserLocationAndTime(): UserLocationTimeInfo {
  const now = new Date();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  // Extract clean city and region
  let city = CITY_NAME_OVERRIDES[timeZone];
  let region = '';
  let countryOrContinent = '';

  if (!city) {
    const parts = timeZone.split('/');
    if (parts.length >= 2) {
      city = parts[1].replace(/_/g, ' ');
      countryOrContinent = parts[0].replace(/_/g, ' ');
    } else {
      city = timeZone;
    }
  } else {
    const parts = timeZone.split('/');
    countryOrContinent = parts[0]?.replace(/_/g, '') || '';
  }

  // Format UTC offset
  const offsetMinutes = -now.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absMinutes = Math.abs(offsetMinutes);
  const hrs = String(Math.floor(absMinutes / 60)).padStart(2, '0');
  const mins = String(absMinutes % 60).padStart(2, '0');
  const utcOffset = `UTC${sign}${hrs}:${mins}`;

  // Timezone names
  const timezoneShort = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'short'
  }).formatToParts(now).find(p => p.type === 'timeZoneName')?.value || `GMT${sign}${hrs}:${mins}`;

  const timezoneLong = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'long'
  }).formatToParts(now).find(p => p.type === 'timeZoneName')?.value || 'Standard Time';

  const localTimeString = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(now);

  const hour = now.getHours();
  let period: 'morning' | 'afternoon' | 'evening' | 'night' = 'morning';

  if (hour >= 5 && hour < 12) {
    period = 'morning';
  } else if (hour >= 12 && hour < 17) {
    period = 'afternoon';
  } else if (hour >= 17 && hour < 22) {
    period = 'evening';
  } else {
    period = 'night';
  }

  return {
    timeZone,
    city,
    region,
    countryOrContinent,
    utcOffset,
    timezoneShort,
    timezoneLong,
    localTimeString,
    period,
    hour
  };
}

/**
 * Returns dynamic, context-aware greeting for Kairon analytics
 */
export function getAppropriateGreeting(userName: string): { greeting: string; periodLabel: string } {
  const { period } = getUserLocationAndTime();
  const name = userName?.trim() || 'Leader';

  switch (period) {
    case 'morning':
      return {
        greeting: `Good morning, ${name}`,
        periodLabel: 'Morning Briefing'
      };
    case 'afternoon':
      return {
        greeting: `Good afternoon, ${name}`,
        periodLabel: 'Midday Pulse'
      };
    case 'evening':
      return {
        greeting: `Good evening, ${name}`,
        periodLabel: 'Evening Review'
      };
    case 'night':
      return {
        greeting: `Late-night review, ${name}`,
        periodLabel: 'Overnight Watch'
      };
  }
}

/**
 * Generates real-time authenticated intelligence tagline based on time of day, location, and workspace
 */
export function getRealtimeAuthTagline(workspaceName: string): string {
  const info = getUserLocationAndTime();

  switch (info.period) {
    case 'morning':
      return `Morning retention pulse for ${workspaceName} • Live renewal risk pipelines and customer health signals synchronized from ${info.city} (${info.timezoneShort} • ${info.localTimeString}).`;
    case 'afternoon':
      return `Midday portfolio telemetry active • Churn propensity scores and high-risk accounts verified from ${info.city} (${info.timezoneShort} • ${info.localTimeString}).`;
    case 'evening':
      return `Evening revenue protection review • Intervention playbooks and renewal forecasts up to date in ${info.city} (${info.timezoneShort} • ${info.localTimeString}).`;
    case 'night':
      return `Overnight relationship sentinel active • Automated early-warning drift tracking running from ${info.city} (${info.timezoneShort} • ${info.localTimeString}).`;
  }
}

/**
 * Message shown on Auth/Sign-in screen based on user's current timezone and time of day
 */
export function getAuthScreenTimeMessage(): { heading: string; sub: string; tag: string } {
  const info = getUserLocationAndTime();

  switch (info.period) {
    case 'morning':
      return {
        heading: 'Good morning. Start your retention day.',
        sub: `Early signal detection and live portfolio telemetry ready in ${info.city} (${info.localTimeString}).`,
        tag: 'Morning Briefing'
      };
    case 'afternoon':
      return {
        heading: 'Good afternoon. Check account momentum.',
        sub: `Midday retention metrics and commercial intervention queues active in ${info.city} (${info.localTimeString}).`,
        tag: 'Midday Telemetry'
      };
    case 'evening':
      return {
        heading: 'Good evening. Review protected revenue.',
        sub: `Wrap up customer decisions with verified model explainability in ${info.city} (${info.localTimeString}).`,
        tag: 'Evening Review'
      };
    case 'night':
      return {
        heading: 'Good evening. Secure workspace online.',
        sub: `Overnight retention watch and 24/7 account monitoring active in ${info.city} (${info.localTimeString}).`,
        tag: 'Overnight Sentinel'
      };
  }
}
