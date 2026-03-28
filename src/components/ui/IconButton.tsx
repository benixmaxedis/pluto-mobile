import { Pressable, type PressableProps } from 'react-native';
import { colors, spacing, borderRadius } from '@/lib/theme';

interface IconButtonProps extends PressableProps {
  size?: number;
  backgroundColor?: string;
  children: React.ReactNode;
}

export function IconButton({
  size = 40,
  backgroundColor = colors.surface,
  children,
  style,
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      style={(state) => [
        {
          width: size,
          height: size,
          borderRadius: borderRadius.full,
          backgroundColor,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          opacity: state.pressed ? 0.7 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
}
