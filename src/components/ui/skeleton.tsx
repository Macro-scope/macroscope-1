import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const CustomSkeleton = ({ 
  className = "", 
  height = "h-8",
  width = "w-full",
  animation = true,
  rounded = "rounded-md",
  color = "bg-gray-200",
  pulseColor = "bg-gray-300",
  variant = "default"
}) => {
  const [shouldAnimate, setShouldAnimate] = useState(animation);

  // Disable animation after 10 seconds to reduce browser load
  useEffect(() => {
    if (animation) {
      const timer = setTimeout(() => {
        setShouldAnimate(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [animation]);

  // Predefined variants
  const variants = {
    default: "",
    circle: "rounded-full",
    text: "h-4 w-3/4",
    button: "h-10",
    card: "h-32",
    avatar: "w-12 h-12 rounded-full"
  };

  const selectedVariant = variants[variant] || variants.default;

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        height,
        width,
        rounded,
        color,
        selectedVariant,
        shouldAnimate && "after:absolute after:inset-0 after:translate-x-[-100%]",
        shouldAnimate && "after:animate-[shimmer_1.5s_infinite]",
        shouldAnimate && `after:${pulseColor}`,
        shouldAnimate && "after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent",
        className
      )}
    />
  );
};

// Demo component showing different use cases


export default CustomSkeleton;