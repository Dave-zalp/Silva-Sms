import { useNavigate } from 'react-router-dom';
import ResetPassword from '../components/ResetPassword';

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/signin');
  };

  return <ResetPassword onSignIn={handleSignIn} />;
}
