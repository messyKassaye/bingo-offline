export const backend_url = {
  signUp: '/users/signup',
  signIn: '/auth/login',
  me: '/users/me',

  refreshToken: '/users/refreshToken',
  onlineBingo: {
    createDeposit: '/communication/cashierCreateDeposit',
    cashierDepositList: 'communication/cashierDepositList/',
  },

  bingo: {
    getCashierBingoShop: '/bingo/agent/cashierShop',
    addCartella: '/bingo/game/addCartella',
    updateBetAmount: '/bingo/game/updateBetAmount',
    startGame: '/bingo/game/startGame',
    stopGame: '/bingo/game/stopGame',
    checkWinner: '/bingo/game/checkWinner/',
    endBingoGame: '/bingo/game/endBingoGame',
    refund: '/bingo/game/refund',
    cashierDashboard: '/bingo/agent/cashierDashboard',
    getCashierShopDeposit: '/bingo/agent/getCashierShopDeposit',
    lockCartella: '/bingo/game/lockCartella/',
    gamePatterns: '/bingo/game/gamePatterns',
    changePattern: '/bingo/game/changePattern',
    startNewGame: '/bingo/game/startNewGame',
    updateGameCallerTime: '/bingo/game/updateGameCallerTime',
    mobilePlayers: '/bingo/mobilePlayers/',
  },
};
