import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import {iconSize} from "./@iconSize";

const MinusCircle = forwardRef(({ color = 'currentColor', size = iconSize, ...rest }, ref) => {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
});

MinusCircle.propTypes = {
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

MinusCircle.displayName = 'MinusCircle';

export default MinusCircle;
