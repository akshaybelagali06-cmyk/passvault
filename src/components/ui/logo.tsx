import Svg, { Path } from 'react-native-svg';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 72 }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" accessibilityLabel="PassVault logo">
      <Path
        d="M36 5 59 14v18c0 15-9.6 27.1-23 34C22.6 59.1 13 47 13 32V14l23-9Z"
        fill="#164C50"
        stroke="#2DD4BF"
        strokeWidth="2"
      />
      <Path
        d="M40.5 34.2a8 8 0 1 0-9 0v12.3a4.5 4.5 0 0 0 9 0V34.2Zm-4.5-2.7a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"
        fill="#F7F8FC"
      />
    </Svg>
  );
}
