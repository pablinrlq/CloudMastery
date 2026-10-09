import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function DashboardIcon(props: IconProps) {
  return <IconBase {...props}><rect x="3" y="3" width="7.5" height="9" rx="2" /><rect x="13.5" y="3" width="7.5" height="5.5" rx="2" /><rect x="13.5" y="11.5" width="7.5" height="9.5" rx="2" /><rect x="3" y="15" width="7.5" height="6" rx="2" /></IconBase>;
}

export function BookIcon(props: IconProps) {
  return <IconBase {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></IconBase>;
}

export function PracticeIcon(props: IconProps) {
  return <IconBase {...props}><path d="M9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></IconBase>;
}

export function CardsIcon(props: IconProps) {
  return <IconBase {...props}><rect x="3" y="7" width="14" height="14" rx="2" /><path d="m7 7 1-3a2 2 0 0 1 2.5-1.3l8.8 2.7a2 2 0 0 1 1.3 2.5L17 21" /></IconBase>;
}

export function ArrowRightIcon(props: IconProps) {
  return <IconBase {...props}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></IconBase>;
}

export function ArrowLeftIcon(props: IconProps) {
  return <IconBase {...props}><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></IconBase>;
}

export function ArrowUpRightIcon(props: IconProps) {
  return <IconBase {...props}><path d="M7 17 17 7" /><path d="M8 7h9v9" /></IconBase>;
}

export function ChevronRightIcon(props: IconProps) {
  return <IconBase {...props}><path d="m9 6 6 6-6 6" /></IconBase>;
}

export function ChevronDownIcon(props: IconProps) {
  return <IconBase {...props}><path d="m6 9 6 6 6-6" /></IconBase>;
}

export function ClockIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></IconBase>;
}

export function TimerIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="13.5" r="7.5" /><path d="M9.5 2.5h5M12 6V2.5M12 10v3.5l2.5 1.5M19 6l1.5-1.5" /></IconBase>;
}

export function TargetIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></IconBase>;
}

export function TrophyIcon(props: IconProps) {
  return <IconBase {...props}><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v2a4 4 0 0 0 4 4" /><path d="M17 6h3v2a4 4 0 0 1-4 4" /></IconBase>;
}

export function LogoutIcon(props: IconProps) {
  return <IconBase {...props}><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /></IconBase>;
}

export function CheckIcon(props: IconProps) {
  return <IconBase {...props}><path d="m5 12 4 4L19 6" /></IconBase>;
}

export function CheckCircleIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></IconBase>;
}

export function XIcon(props: IconProps) {
  return <IconBase {...props}><path d="M18 6 6 18M6 6l12 12" /></IconBase>;
}

export function XCircleIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="9" /><path d="m15 9-6 6M9 9l6 6" /></IconBase>;
}

export function LockIcon(props: IconProps) {
  return <IconBase {...props}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></IconBase>;
}

export function SparkIcon(props: IconProps) {
  return <IconBase {...props}><path d="m12 3 1.2 4.1a5 5 0 0 0 3.7 3.7L21 12l-4.1 1.2a5 5 0 0 0-3.7 3.7L12 21l-1.2-4.1a5 5 0 0 0-3.7-3.7L3 12l4.1-1.2a5 5 0 0 0 3.7-3.7L12 3Z" /></IconBase>;
}

export function FlameIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 21c-3.9 0-7-2.7-7-6.6 0-2.6 1.4-4.6 3-6.1.4 1.6 1.3 2.7 2.4 3.1C10 7.6 11.8 4.6 14.6 3c-.3 2.8.8 4.6 2.3 6.2 1.3 1.4 2.1 3 2.1 5.2 0 3.9-3.1 6.6-7 6.6Z" /><path d="M12 21c-1.7 0-3-1.2-3-2.9 0-1.6 1.1-2.6 2.2-3.5.2 1 .8 1.6 1.5 1.8.4-1 .9-1.8 1.8-2.5.3 1.2 1.5 2.1 1.5 4.2 0 1.7-1.3 2.9-3 2.9Z" /></IconBase>;
}

export function BoltIcon(props: IconProps) {
  return <IconBase {...props}><path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" /></IconBase>;
}

export function FlagIcon(props: IconProps) {
  return <IconBase {...props}><path d="M5 21V4" /><path d="M5 4h11.5l-2 4 2 4H5" /></IconBase>;
}

export function LightbulbIcon(props: IconProps) {
  return <IconBase {...props}><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3Z" /></IconBase>;
}

export function LayersIcon(props: IconProps) {
  return <IconBase {...props}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></IconBase>;
}

export function ChartIcon(props: IconProps) {
  return <IconBase {...props}><path d="M3 20h18" /><path d="m5 15 4-5 4 3 6-7" /><circle cx="19" cy="6" r="1" fill="currentColor" stroke="none" /></IconBase>;
}

export function CalendarIcon(props: IconProps) {
  return <IconBase {...props}><rect x="3" y="4.5" width="18" height="16.5" rx="3" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></IconBase>;
}

export function AwardIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="9" r="6" /><path d="m8.5 13.8-1.5 7.2 5-2.6 5 2.6-1.5-7.2" /><path d="m10 9 1.5 1.5L14.5 7.5" /></IconBase>;
}

export function GridIcon(props: IconProps) {
  return <IconBase {...props}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></IconBase>;
}

export function RotateIcon(props: IconProps) {
  return <IconBase {...props}><path d="M3 12a9 9 0 0 1 15.4-6.4L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15.4 6.4L3 16" /><path d="M3 21v-5h5" /></IconBase>;
}

export function PlayIcon(props: IconProps) {
  return <IconBase {...props}><path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5Z" /></IconBase>;
}

export function PrinterIcon(props: IconProps) {
  return <IconBase {...props}><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M6 14h12v7H6z" /></IconBase>;
}

export function SunIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></IconBase>;
}

export function MoonIcon(props: IconProps) {
  return <IconBase {...props}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></IconBase>;
}

export function KeyboardIcon(props: IconProps) {
  return <IconBase {...props}><rect x="2.5" y="5.5" width="19" height="13" rx="2.5" /><path d="M6.5 9.5h.01M10 9.5h.01M13.5 9.5h.01M17 9.5h.01M7.5 14.5h9" /></IconBase>;
}

export function CloudIcon(props: IconProps) {
  return <IconBase {...props}><path d="M7 18.5h10.5a4.5 4.5 0 0 0 .6-8.96A6.5 6.5 0 0 0 5.6 11.4 3.6 3.6 0 0 0 7 18.5Z" /></IconBase>;
}

export function ArchitectureIcon(props: IconProps) {
  return <IconBase {...props}><rect x="9" y="3" width="6" height="5" rx="1.2" /><rect x="3" y="16" width="6" height="5" rx="1.2" /><rect x="15" y="16" width="6" height="5" rx="1.2" /><path d="M12 8v4M6 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" /></IconBase>;
}

export function NeuralIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="5" cy="7" r="2" /><circle cx="5" cy="17" r="2" /><circle cx="19" cy="12" r="2" /><circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="19" r="1.6" /><path d="M7 7.6 10.5 5.5M7 16.4l3.6 2M13.5 5.8 17.3 10.8M13.5 18.2l3.8-5M7 7.8l10 3.6M7 16.2l10-3.6" /></IconBase>;
}

export function InfoIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5h.01" /></IconBase>;
}

export function AlertIcon(props: IconProps) {
  return <IconBase {...props}><path d="M10.3 4.2 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" /><path d="M12 9.5v4M12 17h.01" /></IconBase>;
}

export function SettingsIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></IconBase>;
}

export function CopyIcon(props: IconProps) {
  return <IconBase {...props}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></IconBase>;
}

export function LinkIcon(props: IconProps) {
  return <IconBase {...props}><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></IconBase>;
}

export function DownloadIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></IconBase>;
}

export function ShieldCheckIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.4 7.5 9.5 4.4-1.1 7.5-4.9 7.5-9.5V6L12 3Z" /><path d="m8.8 12.2 2.3 2.3 4.3-4.6" /></IconBase>;
}

export function ShareIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" /></IconBase>;
}

export function PencilIcon(props: IconProps) {
  return <IconBase {...props}><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></IconBase>;
}

// LinkedIn mark (Simple Icons, CC0). Filled, so it ignores the stroke props.
export function LinkedInIcon({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

export function GoogleIcon({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.28a12 12 0 0 0 0 10.78l4.01-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.28 6.61l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77Z" />
    </svg>
  );
}
