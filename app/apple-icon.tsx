import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: '#16A34A',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0.375rem',
        }}
      >
        <svg
          fill='none'
          height='180'
          shape-rendering='geometricPrecision'
          stroke='white'
          stroke-linecap='round'
          stroke-linejoin='round'
          stroke-width='1.5'
          viewBox='0 0 24 24'
          width='180'
        >
          <path d='M8 10.854h3.798M8 21c2.578 0 3.798-1.494 3.798-4.19v-5.956m0 0h3.75m-3.75 0V7.476c0-2.906 1.379-4.898 4.202-4.4' />
        </svg>
      </div>
    ),
    { ...size }
  );
}
