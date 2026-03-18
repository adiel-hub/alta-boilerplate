import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function IndexRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return null;
}
