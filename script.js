'use strict';

/////////////////////////////////////////////////
// BANKAPP

// Data
const account1 = {
  owner: 'Ariangel Díaz Espaillat',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Functions

const getHtmlMovString = function (mov, i) {
  const type = mov > 0 ? 'deposit' : 'withdrawal';

  return `
  <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__value">${mov}€</div>
  </div>
  `;
};

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    containerMovements.insertAdjacentHTML(
      'afterbegin',
      getHtmlMovString(mov, i)
    );
  });
};

const calcBalance = function (movements) {
  return movements.reduce((acc, cur) => acc + cur, 0);
};

const calcBalanceAndPrint = function (movements) {
  labelBalance.textContent = `${calcBalance(movements)}€`;
};

const calcExpenses = function (movements) {
  return movements.filter(mov => mov < 0).reduce((acc, cur) => acc + cur, 0);
};

const calcDisplaySummary = function (movements, interestRate) {
  const income = movements
    .filter(mov => mov > 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumIn.textContent = `${income}€`;

  labelSumOut.textContent = `${Math.abs(calcExpenses(movements))}€`;

  let interest = movements
    .filter(mov => mov > 0)
    .map(mov => (mov * interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

const addTransAndRefreshBalance = function (amount, acc) {
  containerMovements.insertAdjacentHTML(
    'afterbegin',
    getHtmlMovString(amount, acc.movements.length - 1)
  );
  labelBalance.textContent = `${calcBalance(acc.movements)}€`;
};

const transferMoney = function (originAcc, destinAcc, amount) {
  if (originAcc.movements.reduce((acc, cur) => acc + cur, 0) >= amount) {
    originAcc.movements.push(-amount);
    destinAcc.movements.push(amount);
    addTransAndRefreshBalance(-amount, originAcc);
    labelSumOut.textContent = `${Math.abs(calcExpenses(originAcc.movements))}€`;
  } else alert('There is not enough balance in the account');
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(nameSplit => nameSplit[0])
      .join('');
  });
};

//const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
createUsernames(accounts);

let currentAccount;
let sortDesc = true;

const logIn = function (username, pin) {
  const account = accounts.find(
    acc => acc.username === username && acc.pin === Number(pin)
  );
  if (!account) {
    containerApp.style.opacity = 0;
    alert('Username or pin incorrect.');
  } else {
    currentAccount = account;
    labelWelcome.textContent = `Welcome, ${account.owner.split(' ')[0]}`;
    displayMovements(account.movements);
    calcBalanceAndPrint(account.movements);
    calcDisplaySummary(account.movements, account.interestRate);
    containerApp.style.opacity = 100;
    inputLoginUsername.value = inputLoginPin.value = '';
    inputCloseUsername.blur();
    inputLoginPin.blur();
  }
};
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  logIn(inputLoginUsername.value, inputLoginPin.value);
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  let destinAcc = accounts.find(acc => acc.username === inputTransferTo.value);
  if (
    destinAcc &&
    destinAcc.username !== currentAccount.username &&
    Number(inputTransferAmount.value) > 0
  )
    transferMoney(currentAccount, destinAcc, Number(inputTransferAmount.value));
  else {
    alert('There is a problem with the transaction');
  }
  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferTo.blur();
  inputTransferAmount.blur();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    accounts.splice(
      accounts.findIndex(acc => acc.username === currentAccount.username),
      1
    );
    alert('The account has been eliminated succesfully');

    containerApp.style.opacity = 0;
  } else alert('Incorrect credentials');
  inputClosePin.value = inputCloseUsername.value = '';
  inputCloseUsername.blur();
  inputClosePin.blur();
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const loanAmount = Number(inputLoanAmount.value);
  if (
    loanAmount > 0 &&
    currentAccount.movements.some(mov => mov >= loanAmount * 0.1)
  ) {
    currentAccount.movements.push(loanAmount);
    addTransAndRefreshBalance(loanAmount, currentAccount);
    calcDisplaySummary(currentAccount.movements, currentAccount.interestRate);
  } else {
    if (loanAmount > 0)
      alert(
        'Your account needs to have a positive movement of at least 10% the loan amount you request.'
      );
    else alert('The loan amount must be greater than 0.');
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, sortDesc);
  sortDesc = !sortDesc;
});
