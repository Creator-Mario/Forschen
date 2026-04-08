export default function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Der Fluss des Lebens Logo"
    >
      {/* Circular cream background */}
      <circle cx="100" cy="100" r="98" fill="#fef3e2" />

      {/* Sun rays */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
        <line
          key={i}
          x1="72"
          y1="75"
          x2={72 + 22 * Math.cos((deg * Math.PI) / 180)}
          y2={75 + 22 * Math.sin((deg * Math.PI) / 180)}
          stroke="#f5a623"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}

      {/* Sun circle */}
      <circle cx="72" cy="75" r="14" fill="#f9c72a" />
      <circle cx="72" cy="75" r="10" fill="#fbbf24" />

      {/* River waves - bottom half of circle area */}
      {/* Dark blue base wave */}
      <path
        d="M25 130 Q45 115 65 125 Q85 135 105 120 Q125 105 145 118 Q160 128 175 120 L175 175 Q155 175 130 175 Q100 175 70 175 Q50 175 25 175 Z"
        fill="#1565c0"
      />
      {/* Medium blue wave */}
      <path
        d="M25 138 Q48 122 70 133 Q92 144 115 128 Q135 115 155 130 Q165 137 175 130 L175 175 Q155 175 130 175 Q100 175 70 175 Q50 175 25 175 Z"
        fill="#2196f3"
      />
      {/* Light blue wave */}
      <path
        d="M25 148 Q50 135 75 145 Q100 155 125 140 Q145 128 168 142 L175 175 Q155 175 130 175 Q100 175 70 175 Q50 175 25 175 Z"
        fill="#64b5f6"
      />
      {/* White/pale blue highlight wave */}
      <path
        d="M25 158 Q55 148 80 155 Q105 163 130 150 Q150 140 175 155 L175 175 Q155 175 130 175 Q100 175 70 175 Q50 175 25 175 Z"
        fill="#b3d9f9"
      />

      {/* Clip circle */}
      <circle cx="100" cy="100" r="98" fill="none" stroke="#fef3e2" strokeWidth="2" />
    </svg>
  );
}
