import { ImageResponse } from 'next/og'

// Resim boyutu ve tipi
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Varsayılan fonksiyon mutlaka bir çıktı döndürmeli
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '20%'
        }}
      >
        Y
      </div>
    ),
    {
      ...size,
    }
  )
}