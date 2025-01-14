import Image from 'next/image';

import SC1 from '../assets/SC1.png';
import SC1Responsive from '../assets/SC1-responsive.png';

import { HomeSection } from './HomeSection';

export const HomeWriteSection = () => {
  return (
    <HomeSection
      isColumn={true}
      illustration={<Image src={illustration} alt="DocLogo" />}
      title="Une expérience d'écriture sans compromis."
      tag="Écrire"
      description="Docs propose une expérience d'écriture intuitive. Son interface minimaliste privilégie le contenu sur la mise en page, tout en offrant l'essentiel : import de médias, mode hors-ligne et raccourcis clavier pour plus d'efficacité."
    />
  );
};
