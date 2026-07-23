import { ImageResponse } from 'next/og';

export const alt = 'Parallel Life AI - 探索你的平行人生';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0e27 0%, #1e1b4b 55%, #2e1065 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: '-1px' }}>
          你的平行人生
        </div>
        <div style={{ fontSize: 32, marginTop: 24, color: '#c4b5fd' }}>
          如果当初做了不同的选择
        </div>
      </div>
    ),
    { ...size },
  );
}
