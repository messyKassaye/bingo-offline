import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import AxiosService from '../../../common/services/https.service';
import { backend_url } from '../../../../utils/backend_routes';
import { Input } from 'antd';
import AgentCartella from '../components/AgentCartella/AgentCartella';

import { IBingoCard } from '../model/IBingoCard';
import { ISelectedCartella } from '../model/ISelectedCartella';
import TopNavigation from '../components/TopNavigation/TopNavigation';
import { Icon } from '@iconify/react';
import { IPlayInMobileCards } from '../model/IPlayInMobileCards';
import { ONLINE_BINGO_URL } from '../../../../constants/constants';
import './_PlayInMobilePage.scss';
import '../components/AgentCartella/_CartellaCard.scss';
import '../components/AgentCartella/_GridStyle.scss';

const PlayInMobilePage = () => {
  const { id, isCompany } = useParams();
  const [loading, setLoading] = useState(true);
  const [playinMobileCards, setPlayInMobileCards] = useState<
    IPlayInMobileCards[]
  >([]);
  const [searchPlaceHolder, setSearchPlaceholder] = useState<
    IPlayInMobileCards[]
  >([]);
  const [cards, setCards] = useState<IBingoCard[]>([]);
  const [selectedCartella, setSelectedCartella] = useState<ISelectedCartella[]>(
    [],
  );
  const [showCartellas, setShowCartellas] = useState(true);
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const response = await AxiosService().get(
          `${backend_url.bingo.mobilePlayers}${id}/${isCompany}`,
        );
        setLoading(false);
        if (response.data.data) {
          const dataCards: IBingoCard[] = response.data.data;
          if (dataCards) {
            setCards(dataCards);
          } else {
            setCards([]);
          }
        } else {
          setCards([]);
        }
      } catch (error) {
        console.error('Error fetching shop data:', error);
      }
    };

    fetchShopData();
  }, []);

  useEffect(() => {
    const transformedCards = cards.map((card, index) => {
      const trCard: IPlayInMobileCards = {
        cartellaNumber: index + 1,
        card: card,
      };
      return trCard;
    });
    setPlayInMobileCards(transformedCards);
    setSearchPlaceholder(transformedCards);
  }, [cards]);

  const onSelectCartella = (card: IBingoCard, cardNumber: number) => {
    const selectedCard: ISelectedCartella = {
      cardNumber: cardNumber,
      cartella: card,
    };
    setSelectedCartella((prevState) => [...prevState, selectedCard]);
  };

  const onHandleDelete = (card: IBingoCard, cardNumber: number) => {
    const filteredCartella = selectedCartella.filter(
      (cartella) => cartella.cardNumber !== cardNumber,
    );
    setSelectedCartella(filteredCartella);
  };

  const onSearch = (value: string) => {
    const cartellaNumber = Number(value.replace(/\D/g, '')); // Remove non-digit characters
    const filterCartellaByIndex = searchPlaceHolder.filter(
      (card) => card.cartellaNumber === cartellaNumber,
    );
    if (filterCartellaByIndex.length > 0) {
      setPlayInMobileCards(filterCartellaByIndex);
    } else {
      setPlayInMobileCards(searchPlaceHolder);
    }
  };

  if (loading) {
    return <span>Loading....</span>;
  }

  return (
    <div className="flex flex-col items-start justify-start w-full px-1">
      {selectedCartella.length <= 1 && <TopNavigation />}
      {showCartellas ? (
        <div className="flex flex-col items-start justify-start gap-1 w-full">
          <div className="flex items-center justify-between w-full p-1">
            <span className="font-bold text-lg">Select Cartella</span>
            <div className="flex items-center justify-around gap-1">
              <Input
                placeholder="Search cartella"
                name="search"
                onChange={(e) => onSearch(e.target.value)}
                className="w-[120px]"
              />
              <Icon
                icon={
                  showCartellas
                    ? 'ant-design:fullscreen-exit-outlined'
                    : 'ant-design:fullscreen-outlined'
                }
                fontSize={25}
                onClick={() => setShowCartellas(!showCartellas)}
              />
            </div>
          </div>
          <div className="w-full overflow-hidden">
            <div className="cards-container">
              {playinMobileCards?.map((card) => (
                <button
                  key={card.cartellaNumber}
                  onClick={() =>
                    onSelectCartella(card.card, card.cartellaNumber)
                  }
                  className={`outline-none border-none`}
                >
                  <div
                    className={`${
                      selectedCartella.some(
                        (cartella) =>
                          cartella.cardNumber === card.cartellaNumber,
                      )
                        ? 'selected-cards'
                        : 'cards'
                    }`}
                    key={card.cartellaNumber}
                  >
                    {card.cartellaNumber}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-end w-full">
          <Icon
            icon={'ant-design:fullscreen-outlined'}
            fontSize={25}
            onClick={() => setShowCartellas(!showCartellas)}
          />
        </div>
      )}

      <div className="w-full selected-cards-container">
        <div
          className={`selected-cartellas ${
            selectedCartella.length === 1 ? 'single-cartella' : ''
          }`}
        >
          {selectedCartella.map((selectedCart) => (
            <AgentCartella
              key={selectedCart.cardNumber}
              card={selectedCart.cartella}
              cardNumber={selectedCart.cardNumber}
              onHandleDelete={onHandleDelete}
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          // Your play logic here
          window.open(ONLINE_BINGO_URL, '_blank');
        }}
        className="fixed border-none bottom-2 right-2 w-16 h-16 bg-[#0e2238] text-white rounded-full flex flex-col items-center justify-center shadow-lg hover:bg-[#0f2946] transition-all"
      >
        <span className="leading-tight font-bold">Online</span>
        <span className="leading-tight font-bold">Bingo</span>
      </button>
    </div>
  );
};

export default PlayInMobilePage;
