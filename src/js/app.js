import CardWidget from './cardWidget';

const container = document.querySelector('.container');

const trello = new CardWidget(container);
trello.activation();
const storage = localStorage.getItem('cards');

if (storage) {
  trello.renderingCards(JSON.parse(storage));
}
