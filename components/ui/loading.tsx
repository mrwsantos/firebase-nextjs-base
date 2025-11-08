import React from "react";

interface LoadingProps {
  text?: string;
  type?: 'col' | 'icon' | 'inline';
  size?: number;
  className?: string;
  white?: boolean;
  noText?: boolean;
  variant?: 'spinner' | 'dots' | 'pulse';
}

const Loading = ({ 
  text, 
  type = 'inline', 
  size = 10, 
  className = '', 
  white = false, 
  noText = false,
  variant = 'spinner'
}: LoadingProps) => {

  const getSpinner = () => {
    const baseClasses = `border-2 ${white ? 'border-white' : 'border-primary'} border-t-transparent rounded-full animate-spin`;
    
    if (size <= 12) {
      return <div className={`w-${size} h-${size} ${baseClasses}`} style={{ width: size, height: size }} />;
    }
    
    return <div className={`${baseClasses}`} style={{ width: size, height: size }} />;
  };

  const getDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${white ? 'bg-white' : 'bg-primary'} animate-pulse`}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );

  const getPulse = () => (
    <div 
      className={`rounded-full ${white ? 'bg-white' : 'bg-primary'} animate-pulse`}
      style={{ width: size, height: size }}
    />
  );

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return getDots();
      case 'pulse':
        return getPulse();
      default:
        return getSpinner();
    }
  };

  const getContainerClasses = () => {
    const baseClasses = "flex w-fit";
    
    switch (type) {
      case 'col':
        return `${baseClasses} flex-col items-center justify-center gap-2`;
      case 'icon':
        return `${baseClasses} justify-center items-center`;
      default:
        return `${baseClasses} justify-start items-center gap-2`;
    }
  };

  const getTextClasses = () => {
    return `text-sm ${white ? 'text-white' : 'text-primary'}`;
  };

  const shouldShowText = type !== 'icon' && !noText;
  const displayText = text || "Loading...";

  return (
    <div className={`${getContainerClasses()} ${className}`}>
      <div className="loading">
        {renderSpinner()}
      </div>
      
      {shouldShowText && (
        <span className={getTextClasses()}>
          {displayText}
        </span>
      )}
    </div>
  );
};

export default Loading;