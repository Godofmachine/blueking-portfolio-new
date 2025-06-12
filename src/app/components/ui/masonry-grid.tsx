
import * as React from "react";
import { cn } from "@/lib/utils";

type ResponsiveValue<T> = T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T; '2xl'?: T };

interface MasonryGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: ResponsiveValue<number>;
  gap?: number;
  children: React.ReactNode;
}

const MasonryGrid = React.forwardRef<HTMLDivElement, MasonryGridProps>(
  ({ className, columns = 3, gap = 3, children, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    
    // Get the actual column count based on responsive config or direct value
    const getColumnCount = (): number => {
      if (typeof columns === 'number') {
        return columns;
      }
      
      // Default to the base value or 3 if not specified
      return columns.base || 3;
    };
    
    const columnCount = getColumnCount();
    const columnWrappers = Array.from({ length: columnCount }, () => [] as React.ReactNode[]);

    childrenArray.forEach((child, index) => {
      const columnIndex = index % columnCount;
      columnWrappers[columnIndex].push(child);
    });
    
    // Construct className based on responsive columns
    const getResponsiveClasses = () => {
      if (typeof columns === 'number') {
        return `grid-cols-${columns}`;
      }
      
      // Correctly map Tailwind breakpoints to our responsive values
      const classes = [];
      if (columns.base) classes.push(`grid-cols-${columns.base}`);
      if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
      if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
      if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
      if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
      if (columns['2xl']) classes.push(`2xl:grid-cols-${columns['2xl']}`);
      
      return classes.join(' ');
    };

    return (
      <div
        ref={ref}
        className={cn("grid", getResponsiveClasses(), className)}
        style={{
          gap: `${gap * 0.25}rem`,
        }}
        {...props}
      >
        {columnWrappers.map((column, index) => (
          <div key={index} className="flex flex-col gap-3">
            {column}
          </div>
        ))}
      </div>
    );
  }
);

MasonryGrid.displayName = "MasonryGrid";

export { MasonryGrid };
