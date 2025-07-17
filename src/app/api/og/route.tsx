import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Rushmore';
    const description = searchParams.get('description') || 'Share your mt. rushmore';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fef3c7',
            backgroundImage: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fecaca 100%)',
            padding: '40px',
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              R
            </div>
            <span
              style={{
                fontSize: '32px',
                fontWeight: '300',
                color: '#374151',
                letterSpacing: '0.05em',
              }}
            >
              rushmore
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '48px',
              fontWeight: '300',
              color: '#1f2937',
              textAlign: 'center',
              margin: '0 0 20px 0',
              lineHeight: '1.2',
              maxWidth: '1000px',
            }}
          >
            {title}
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: '24px',
              color: '#6b7280',
              textAlign: 'center',
              margin: '0',
              lineHeight: '1.4',
              maxWidth: '900px',
            }}
          >
            {description}
          </p>

          {/* Call to Action */}
          <div
            style={{
              marginTop: '40px',
              padding: '16px 32px',
              backgroundColor: '#3b82f6',
              borderRadius: '12px',
              color: 'white',
              fontSize: '20px',
              fontWeight: '300',
              letterSpacing: '0.05em',
            }}
          >
            play at rushmore.vercel.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.log(`Error generating OG image: ${e instanceof Error ? e.message : 'Unknown error'}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
} 