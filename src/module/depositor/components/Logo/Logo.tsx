import { useNavigate } from 'react-router-dom';

type Props = {
  size?: 'large' | 'small';
};
const Logo = ({ size }: Props) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/')}
      className="flex items-center justify-center border-none outline-none bg-transparent"
    >
      <span
        className={`text-white ${size === 'large' ? 'text-4xl' : 'text-2xl'} font-bold`}
      >
        Gulo
      </span>
      <span
        className={`font-bold ${size === 'large' ? 'text-4xl' : 'text-2xl'} text-orange-500`}
      >
        Games
      </span>
    </button>
  );
};

export default Logo;
