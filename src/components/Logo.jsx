export default function Logo({ className = 'h-8 w-8', title }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect width="512" height="512" rx="116" fill="#E8590C" />
      <g fill="none" stroke="#fff" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round">
        <path d="M112 177l26 26 46-54" />
        <path d="M236 163h164" />
        <path d="M112 277l26 26 46-54" />
        <path d="M236 263h164" />
        <circle cx="148" cy="363" r="24" />
        <path d="M236 363h112" opacity=".65" />
      </g>
    </svg>
  );
}
