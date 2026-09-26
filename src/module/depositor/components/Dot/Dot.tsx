type Props = {
  type: 'large' | 'medium' | 'small';
  color?: string;
};
const Dot = ({ type, color }: Props) => {
  return (
    <div
      className={`single-dot ${type} mx-1`}
      style={
        {
          '--dot-color': color,
        } as React.CSSProperties
      }
    ></div>
  );
};

export default Dot;
