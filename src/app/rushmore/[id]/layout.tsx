import { Metadata } from 'next';

interface Rushmore {
  id: string;
  item1: string;
  item2: string;
  item3: string;
  item4: string;
  user: {
    name: string;
    email: string;
  };
  voteCount: number;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

interface Question {
  id: string;
  prompt: string;
  date: string;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    // Fetch rushmore data
    const rushmoresRes = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/rushmores`);
    const rushmoresData = await rushmoresRes.json();
    const rushmore = rushmoresData.find((r: Rushmore) => r.id === id);

    if (!rushmore) {
      return {
        title: 'Rushmore Not Found',
        description: 'This rushmore could not be found.',
      };
    }

    // Set today's question (manually updated)
    const questionData = {
      id: "today",
      prompt: "best fast food menu items",
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const title = `${rushmore.user.name}'s "${questionData.prompt}" mt. rushmore`;
    const description = `check out this ${questionData.prompt} mt. rushmore: 1. ${rushmore.item1} 2. ${rushmore.item2} 3. ${rushmore.item3} 4. ${rushmore.item4}`;
    const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/rushmore/${rushmore.id}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: 'Rushmore',
        images: [
          {
            url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Rushmore',
      description: 'Share your mt. rushmore',
    };
  }
}

export default function RushmoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 