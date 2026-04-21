import { memo } from 'react';

const Button = memo(({ 
  label, 
  onPress, 
  variant = "primary", 
  loading = false, 
  disabled = false 
}) => {
  const baseClasses = "px-8 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-snap-yellow text-white hover:brightness-110",
    secondary: "bg-snap-darkMid border border-white/30 text-white hover:bg-white/10",
    ghost: "text-white hover:bg-white/10",
  };

  return (
    <button
      onClick={onPress}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {loading && (
        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
      )}
      {label}
    </button>
  );
});

export default Button;