import { RED } from "../../lib/constants";

export function Avatar({
  name,
  photo,
  size = "md",
}: {
  name: string;
  photo?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-sm",
    xl: "w-16 h-16 text-xl",
  };
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover bg-gray-100 flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ backgroundColor: RED }}
    >
      {initials}
    </div>
  );
}
