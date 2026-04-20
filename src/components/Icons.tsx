export function Chicken({ size = 52, color = '#F97316' }: { size?: number, color?: string }) {
  return (
    <svg viewBox="0 0 52 52" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="26" cy="28" rx="14" ry="12" fill={color}/>
      <circle cx="26" cy="16" r="9" fill={color}/>
      <polygon points="26,7 30,12 22,12" fill="#E85D4A"/>
      <path d="M28 11 Q34 9 33 14" fill="#E85D4A" stroke="none"/>
      <circle cx="23" cy="14" r="1.5" fill="#171717"/>
      <circle cx="22.5" cy="13.5" r="0.5" fill="white"/>
      <line x1="19" y1="40" x2="16" y2="50" stroke={color} strokeWidth="2.5" strokeLinecap="square"/>
      <line x1="25" y1="40" x2="22" y2="50" stroke={color} strokeWidth="2.5" strokeLinecap="square"/>
      <path d="M14 49 Q16 47 18 49" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="square"/>
      <path d="M20 49 Q22 47 24 49" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="square"/>
      <path d="M20 30 Q22 27 20 24 Q24 26 26 23" stroke={color} strokeWidth="2" fill="none" strokeLinecap="square"/>
    </svg>
  );
}

export function Rabbit({ size = 52, color = '#15803D' }: { size?: number, color?: string }) {
  return (
    <svg viewBox="0 0 52 52" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="26" cy="30" rx="13" ry="12" fill={color}/>
      <circle cx="26" cy="18" r="9" fill={color}/>
      <ellipse cx="20" cy="8" rx="4" ry="9" fill={color}/>
      <ellipse cx="32" cy="8" rx="4" ry="9" fill={color}/>
      <ellipse cx="20" cy="8" rx="2.5" ry="7" fill="#FFB3C6"/>
      <ellipse cx="32" cy="8" rx="2.5" ry="7" fill="#FFB3C6"/>
      <circle cx="23" cy="17" r="1.5" fill="#171717"/>
      <circle cx="22.5" cy="16.5" r="0.5" fill="white"/>
      <circle cx="29" cy="17" r="1.5" fill="#171717"/>
      <circle cx="28.5" cy="16.5" r="0.5" fill="white"/>
      <ellipse cx="26" cy="21" rx="2.5" ry="1.5" fill="#FFB3C6"/>
      <line x1="19" y1="42" x2="16" y2="50" stroke={color} strokeWidth="2.5" strokeLinecap="square"/>
      <line x1="24" y1="42" x2="21" y2="50" stroke={color} strokeWidth="2.5" strokeLinecap="square"/>
      <line x1="28" y1="42" x2="31" y2="50" stroke={color} strokeWidth="2.5" strokeLinecap="square"/>
      <line x1="33" y1="42" x2="36" y2="50" stroke={color} strokeWidth="2.5" strokeLinecap="square"/>
      <ellipse cx="38" cy="31" rx="4" ry="3" fill={color}/>
    </svg>
  );
}
