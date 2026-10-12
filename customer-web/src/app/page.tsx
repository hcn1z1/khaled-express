import type { Metadata } from 'next';
import LandingContent from '@/components/LandingContent';

export const metadata: Metadata = {
  title: 'Khaled Express | Transport de Colis Alger ↔ El Eulma',
  description:
    "Service express de transfert et livraison de colis entre Alger et El Eulma (Sétif). Suivi en temps réel, navette quotidienne et notifications SMS gratuites.",
};

export default function HomePage() {
  return <LandingContent />;
}
