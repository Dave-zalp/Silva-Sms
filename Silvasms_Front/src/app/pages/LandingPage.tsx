import { useNavigate } from 'react-router-dom';
import LandingPageComponent from '../components/LandingPageClean';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signin');
  };

  return <LandingPageComponent onGetStarted={handleGetStarted} />;
}