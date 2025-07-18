import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import {iconSize} from "./@iconSize";

const Trello = forwardRef(({ color = 'currentColor', size = iconSize, ...rest }, ref) => {
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
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <rect x="7" y="7" width="3" height="9" />
      <rect x="14" y="7" width="3" height="5" />
    </svg>
  );
});

Trello.propTypes = {
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Trello.displayName = 'Trello';

export default Trello;
