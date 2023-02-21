import React, { SVGAttributes } from 'react';
import icons from 'resources/icons';

export type IconName = keyof typeof icons;

export type IconProps = {
  name: IconName;
} & SVGAttributes<SVGElement>;

const Icon = ({ name, ...otherProps }: IconProps) => {
  // using manta.svg as a default
  const Component = icons[name] || icons.manta;
  return <Component {...otherProps} />;
};
export default Icon;
