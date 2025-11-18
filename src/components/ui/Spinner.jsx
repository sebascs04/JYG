import { cn } from '../../utils/cn';

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

function Spinner({ size = 'md', className }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          'animate-spin rounded-full border-4 border-stone-200 border-t-luxury-olive',
          sizes[size],
          className
        )}
      />
    </div>
  );
}

export default Spinner;
