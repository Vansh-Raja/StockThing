export default function Container({ children, className = '' }) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-full ${className}`}>
      {children}
    </div>
  );
}

