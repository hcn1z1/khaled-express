import type { Metadata } from 'next';
import MyParcelsGate from '@/components/MyParcelsGate';

export const metadata: Metadata = {
  title: 'Mes Expéditions | Khaled Express',
  description: 'Espace client Khaled Express : suivez vos colis et demandes de transfert entre Alger et El Eulma.',
  robots: { index: false },
};

export default function MesExpeditionsPage() {
  return <MyParcelsGate />;
}
