interface WaveDividerProps {
  /** fill color for the wave shape (tailwind class or hex) */
  fill?: string;
  /** background color above the wave */
  fromColor?: string;
  flip?: boolean;
  className?: string;
}

export default function WaveDivider({
  fill = "#1565c0",
  flip = false,
  className = "",
}: WaveDividerProps) {
  return (
    <div
      className={`w-full overflow-hidden leading-none ${flip ? "rotate-180" : ""} ${className}`}
      style={{ lineHeight: 0 }}
    >
      <svg
        viewBox="0 0 1440 80"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-16 md:h-20"
      >
        <path
          d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1380,20 1440,40 L1440,80 L0,80 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
