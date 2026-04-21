// 🐝💃 Waggle Dance Translator Page
// A route for sharing encoded bee dances!

import WaggleDanceTranslator from '@/components/WaggleDanceTranslator';

export default function DancePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-100 to-amber-50 py-8">
      <WaggleDanceTranslator />
    </main>
  );
}

export const metadata = {
  title: '🐝 Waggle Dance Translator | Urban Bees Network',
  description: 'Encode messages in bee dances! Communication across difference.',
};
