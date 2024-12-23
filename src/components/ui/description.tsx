import React, { useState } from 'react';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const CategoryDescription = ({ 
  description, 
  maxLines = 2,
  className = ""
}) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  if (!description) return null;

  return (
    <TooltipProvider>
      <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
        <TooltipTrigger asChild>
          <div 
            className={`text-sm text-muted-foreground ${className}`}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: maxLines,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'pointer',
              lineHeight: '1.4',
              maxWidth: '100%'
            }}
            onMouseEnter={() => setIsTooltipOpen(true)}
            onMouseLeave={() => setIsTooltipOpen(false)}
          >
            {description}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-sm p-4 bg-white shadow-lg rounded-lg border"
        >
          <p className="text-sm">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CategoryDescription;