import { useShop } from '../context/ShopContext';
export default function Toast() {
  const { msg } = useShop();
  return <div className={'toast' + (msg ? ' on' : '')} role="status">{msg}</div>;
}
