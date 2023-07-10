import { Heading } from '@chakra-ui/react';
import Image from 'next/image';
import BaseNav from '../components/Navbars/BaseNav';
import switchSvg from '../public/switch.svg';

const Home = () => {
  return (
    <>
      <BaseNav />
      <Heading>Ciao mondo!</Heading>
      <Image src={switchSvg.src} width={50} height={50} alt="Polyglot Logo" />
    </>
  );
};

export default Home;
