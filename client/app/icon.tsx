import Image from 'next/image';

export default function Icon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor: '#0066FF', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#0066FF', stopOpacity: 0.5}} />
        </linearGradient>
      </defs>
      <text 
        x="50%" 
        y="50%" 
        textAnchor="middle" 
        dominantBaseline="middle" 
        fontFamily="system-ui, -apple-system" 
        fontWeight="bold" 
        fontSize="16" 
        fill="url(#gradient)"
      >
        YK
      </text>
    </svg>
  );
}
