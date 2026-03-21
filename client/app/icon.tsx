import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to right, #0066FF, rgba(0, 102, 255, 0.5))',
          color: 'white',
          fontSize: 16,
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
        }}
      >
        YK
      </div>
    ),
    { ...size }
  );
}