// ─────────────────────────────────────────────────────────────
// Floating Input — src/features/auth/components/FloatingInput.jsx
// A minimal floating label input using Tailwind CSS peer utilities
// ─────────────────────────────────────────────────────────────
export default function FloatingInput({ label, id, type = "text", value, onChange, icon: Icon, required = false, ...props }) {
  return (
    <div className="relative mb-5 w-full z-20 group">
      <input
        type={type}
        id={id}
        required={required}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-xl px-4 pt-6 pb-2 text-white outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all duration-300 shadow-inner"
        {...props}
      />
      {/* 
        The label uses peer-placeholder-shown to detect if the input is empty.
        If empty -> label is centered. 
        If focused or has text -> label shrinks and moves to the top edge. 
      */}
      <label
        htmlFor={id}
        className="absolute left-4 top-2 text-xs text-gray-500 transition-all duration-300 pointer-events-none
                   peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                   peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400"
      >
        {label}
      </label>

      {/* Optional decorative icon on the right */}
      {Icon && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 peer-focus:text-blue-400 transition-colors duration-300 pointer-events-none">
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
