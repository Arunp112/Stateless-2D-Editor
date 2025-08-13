import React from 'react';
import classNames from 'classnames';

export default function Button({ icon: Icon, label, onClick, disabled, variant = 'default', size = 'md' }) {
  const baseClasses = 'flex items-center gap-2 rounded transition-all focus:outline-none';
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-sm' : 'px-3 py-2';
  const variantClasses = {
    default: 'border hover:bg-gray-100 dark:hover:bg-gray-700',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    danger: 'border text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classNames(baseClasses, sizeClasses, variantClasses[variant], { 'opacity-50 cursor-not-allowed': disabled })}
    >
      {Icon && <Icon size={16} />}
      {label && <span>{label}</span>}
    </button>
  );
}
