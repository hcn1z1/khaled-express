import type { Metadata } from 'next';
import OfficeInfoCards from '@/components/OfficeInfoCards';

export const metadata: Metadata = {
  title: 'Nos Agences | Khaled Express',
  description:
    'Agence Alger Centre (Rue Didouche Mourad) et Agence El Eulma (Sétif) : adresses, téléphones et horaires de la navette express quotidienne.',
};

export default function AgencesPage() {
  return <OfficeInfoCards />;
}
