import type { Metadata } from 'next';
import SuiviClient from '@/components/SuiviClient';

interface SuiviPageProps {
  params: { code: string };
}

export async function generateMetadata({ params }: SuiviPageProps): Promise<Metadata> {
  const code = decodeURIComponent(params.code || '').toUpperCase();
  return {
    title: `Suivi ${code} | Khaled Express`,
    description: `Suivez le colis ${code} en temps réel entre Alger et El Eulma avec Khaled Express.`,
  };
}

export default function SuiviPage({ params }: SuiviPageProps) {
  const code = decodeURIComponent(params.code || '');
  return <SuiviClient code={code} />;
}
