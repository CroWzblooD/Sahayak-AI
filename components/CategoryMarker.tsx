import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export const CategoryMarkers = {
  'Document Services': () => (
    <Svg width={36} height={36}>
      <Circle cx={18} cy={18} r={18} fill="#E3F2FD" />
      {/* Document icon (simple file) */}
      <Path d="M12 8h12v20H12z" fill="#2563eb" />
      <Path d="M12 8l6 6h6" fill="none" stroke="#2563eb" strokeWidth={2} />
    </Svg>
  ),
  'Pension Services': () => (
    <Svg width={36} height={36}>
      <Circle cx={18} cy={18} r={18} fill="#FFF8E1" />
      {/* Bank icon */}
      <Path d="M10 24h16M10 20h16M10 16h16M12 12h12v12H12z" fill="none" stroke="#b59f3b" strokeWidth={2} />
    </Svg>
  ),
  'Digital Services': () => (
    <Svg width={36} height={36}>
      <Circle cx={18} cy={18} r={18} fill="#F3E5F5" />
      {/* Laptop icon */}
      <Path d="M10 14h16v10H10z" fill="#7c3aed" />
      <Path d="M8 24h20" stroke="#7c3aed" strokeWidth={2} />
    </Svg>
  ),
  'Agriculture Services': () => (
    <Svg width={36} height={36}>
      <Circle cx={18} cy={18} r={18} fill="#E8F5E9" />
      {/* Leaf icon */}
      <Path d="M18 10c4 4 4 10 0 14-4-4-4-10 0-14z" fill="#22c55e" />
      <Path d="M18 24v-4" stroke="#22c55e" strokeWidth={2} />
    </Svg>
  ),
  'Banking Services': () => (
    <Svg width={36} height={36}>
      <Circle cx={18} cy={18} r={18} fill="#FFEBEE" />
      {/* Bank icon */}
      <Path d="M10 24h16M10 20h16M10 16h16M12 12h12v12H12z" fill="none" stroke="#e11d48" strokeWidth={2} />
    </Svg>
  ),
};
