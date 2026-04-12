interface UserAvatarProps {
  name: string;
  imageSrc?: string | null;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
}

export default function UserAvatar({
  name,
  imageSrc,
  className = '',
  imageClassName = '',
  textClassName = '',
}: UserAvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className={`overflow-hidden rounded-full bg-blue-100 flex items-center justify-center ${className}`.trim()}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={`${name} Profilbild`}
          className={`h-full w-full object-cover ${imageClassName}`.trim()}
        />
      ) : (
        <span className={`text-blue-800 font-semibold ${textClassName}`.trim()}>{initial}</span>
      )}
    </div>
  );
}
