import React from 'react';
import { Pressable } from 'react-native';

export const HapticTab = ({ children, ...props }) => {
  return <Pressable {...props}>{children}</Pressable>;
};

export default HapticTab;
