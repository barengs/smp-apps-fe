import React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButtonProps extends ButtonProps {
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'default',
    isLoading = false,
    icon,
    iconPosition = 'left',
    className,
    disabled,
    ...props
  }, ref) => {
    const IconComponent = isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon;

    return (
      <Button
        variant={variant}
        size={size}
        disabled={disabled || isLoading}
        className={cn("flex items-center gap-2", className)}
        ref={ref}
        {...props}
      >
        {IconComponent && iconPosition === 'left' && IconComponent}
        <span>{children}</span>
        {IconComponent && iconPosition === 'right' && IconComponent}
      </Button>
    );
  }
);

ActionButton.displayName = 'ActionButton';

export default ActionButton;