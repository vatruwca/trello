export default class CardWidget {
  constructor(container) {
    this.container = container;
    this.btnOpen = document.querySelectorAll('.btn_open-form');
    this.forms = document.forms;
    this.todoBox = this.container.querySelector('.todo_box');
    this.progressBox = this.container.querySelector('.progress_box');
    this.doneBox = this.container.querySelector('.done_box');
    this.btnsAdd = this.container.querySelectorAll('.btn_add');
    this.btnsCansel = this.container.querySelectorAll('.cansel');
    this.enterText = this.container.querySelectorAll('.enter-text');

    this.activeForm = null;
    this.hidenCreate = null;
    this.draggedEl = null;
    this.lastPosition = null;
    this.ghostEl = null;
    this.shadow = null;

    this.openForm = this.openForm.bind(this);
    this.addCard = this.addCard.bind(this);
    this.cansel = this.cansel.bind(this);
    this.drag = this.drag.bind(this);
    this.isMove = this.isMove.bind(this);
    this.moveEnd = this.moveEnd.bind(this);
    this.isShadow = this.isShadow.bind(this);
  }

  activation() {
    this.btnOpen.forEach((btn) => {
      btn.addEventListener('click', this.openForm);
    });

    this.btnsAdd.forEach((btn) => {
      btn.addEventListener('click', this.addCard);
    });

    this.btnsCansel.forEach((btn) => {
      btn.addEventListener('click', this.cansel);
    });

    this.enterText.forEach((t) => {
      t.addEventListener('input', () => {
        const toolTip = document.querySelector('.toolTip');
        if (toolTip) toolTip.remove();
      });
    });

    this.container.addEventListener('mousemove', this.isMove);
    this.container.addEventListener('mouseup', this.moveEnd);
    this.container.addEventListener('mousemove', this.isShadow);
  }

  openForm(e) {
    e.preventDefault();

    if (this.activeForm !== null) {
      this.toggleHiden();

      this.activeForm = null;
      this.hidenCreate = null;
    }

    this.hidenCreate = e.target.parentElement;
    this.activeForm = this.forms[e.target.dataset.nameForm];

    this.toggleHiden();
  }

  addCard(e) {
    e.preventDefault();
    const enterText = this.activeForm.querySelector('.enter-text');
    const text = enterText.value;
    if (text.length > 0) {
      const card = this.createCard(text);

      e.target.closest('.box').querySelector('.card_box').append(card);

      this.activeForm.reset();
      this.toggleHiden();

      this.activeForm = null;
      this.hidenCreate = null;

      CardWidget.saveInMemory();
    } else {
      CardWidget.showtoolTip(enterText);
    }
  }

  createCard(text) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.textContent = text;

    const buttton = document.createElement('button');
    buttton.classList.add('btn_del', 'hiden');
    buttton.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      card.remove();
      CardWidget.saveInMemory();
    });
    card.append(buttton);

    card.addEventListener('mouseover', () => {
      buttton.classList.remove('hiden');
    });
    card.addEventListener('mouseout', () => {
      buttton.classList.add('hiden');
    });
    card.addEventListener('mousedown', this.drag);

    return card;
  }

  cansel(e) {
    e.preventDefault();
    const toolTip = document.querySelector('.toolTip');
    if (toolTip) toolTip.remove();
    this.activeForm.reset();
    this.toggleHiden();

    this.activeForm = null;
    this.hidenCreate = null;
  }

  static saveInMemory() {
    const history = {};
    history.todo = CardWidget.dataCollector(document.querySelector('.todo_box'));
    history.progress = CardWidget.dataCollector(document.querySelector('.progress_box'));
    history.done = CardWidget.dataCollector(document.querySelector('.done_box'));

    localStorage.removeItem('cards');
    localStorage.setItem('cards', JSON.stringify(history));
  }

  static dataCollector(container) {
    const result = [];
    const cards = container.querySelectorAll('.card');
    if (cards) {
      cards.forEach((card) => {
        result.push(card.textContent);
      });
    }
    return result;
  }

  renderingCards(storage) {
    if (storage.todo.length !== 0) {
      for (let i = 0; i < storage.todo.length; i += 1) {
        const text = storage.todo[i];
        const card = this.createCard(text);

        this.todoBox.querySelector('.card_box').append(card);
      }
    }

    if (storage.progress.length !== 0) {
      for (let i = 0; i < storage.progress.length; i += 1) {
        const text = storage.progress[i];
        const card = this.createCard(text);

        this.progressBox.querySelector('.card_box').append(card);
      }
    }

    if (storage.done.length !== 0) {
      for (let i = 0; i < storage.done.length; i += 1) {
        const text = storage.done[i];
        const card = this.createCard(text);

        this.doneBox.querySelector('.card_box').append(card);
      }
    }
  }

  toggleHiden() {
    this.activeForm.classList.toggle('hiden');
    this.hidenCreate.classList.toggle('hiden');
  }

  drag(e) {
    e.preventDefault();

    if (!e.target.classList.contains('btn_del')) {
      this.container.style.cursor = 'grabbing';

      this.draggedEl = e.currentTarget;

      this.lastPosition = {};
      this.lastPosition.parent = this.draggedEl.parentElement;
      this.lastPosition.pos = [...this.lastPosition.parent.querySelectorAll('.card')].findIndex((el) => el === this.draggedEl);

      this.ghostEl = this.draggedEl.cloneNode(true);
      this.ghostEl.classList.add('dragged');

      this.shadow = document.createElement('div');
      this.shadow.classList.add('card', 'shadow');
      this.shadow.style.height = `${this.draggedEl.offsetHeight}px`;
      this.shadow.style.backgroundColor = 'gray';

      const { top, left } = this.draggedEl.getBoundingClientRect();
      this.offsetY = top + window.scrollY - e.pageY;
      this.offsetX = left + window.scrollX - e.pageX;
      this.ghostEl.style.top = `${top}px`;
      this.ghostEl.style.left = `${left}px`;
      this.ghostEl.style.minWidth = `${this.draggedEl.offsetWidth}px`;
    }
  }

  isMove(e) {
    e.preventDefault();

    if (this.draggedEl) {
      this.ghostEl.style.top = `${e.pageY + this.offsetY}px`;
      this.ghostEl.style.left = `${e.pageX + this.offsetX}px`;

      this.draggedEl.querySelector('.btn_del').classList.add('hiden');

      this.draggedEl.replaceWith(this.shadow);

      document.body.append(this.ghostEl);
      this.ghostEl.children[0].classList.add('hiden');
    }
  }

  isShadow(e) {
    if (this.draggedEl) {
      const y = e.clientY;
      const x = e.clientX;
      const target = document.elementFromPoint(x, y);
      const targetBox = target.closest('.box');

      if (targetBox) {
        const cardsBox = targetBox.querySelector('.card_box');
        if (!cardsBox.querySelector('.card')) {
          cardsBox.append(this.shadow);
        } else if (!target.classList.contains('card')) {
          let near = null;

          const stack = cardsBox.querySelectorAll('.card');
          stack.forEach((el) => {
            const { top } = el.getBoundingClientRect();

            if (y + window.scrollY - top < 0 && near === null) {
              near = el;
            }
          });

          if (near === null) {
            cardsBox.append(this.shadow);
          } else {
            near.before(this.shadow);
          }
        } else if (target.classList.contains('card')) {
          const { top, bottom } = target.getBoundingClientRect();

          if (y - top > bottom - y) {
            target.after(this.shadow);
          } else {
            target.before(this.shadow);
          }
        }
      } else {
        this.shadow.remove();
      }
    }
  }

  moveEnd() {
    if (this.draggedEl) {
      this.container.style.cursor = 'auto';

      if (!document.querySelector('.shadow')) {
        if (this.lastPosition.pos === 0) {
          this.lastPosition.parent.prepend(this.shadow);
        } else {
          const box = this.lastPosition.parent.querySelectorAll('.card');
          if (box.length === this.lastPosition.pos) {
            this.lastPosition.parent.append(this.shadow);
          } else {
            box[this.lastPosition.pos].before(this.shadow);
          }
        }
      }

      this.lastPosition = null;

      this.shadow.replaceWith(this.draggedEl);
      this.shadow = null;
      this.draggedEl = null;

      this.ghostEl.remove();
      this.ghostEl = null;

      CardWidget.saveInMemory();
    }
  }

  static showtoolTip(element) {
    const toolTip = document.createElement('div');
    toolTip.classList.add('toolTip');
    toolTip.textContent = 'Пустая задача... Зачем?';

    document.body.append(toolTip);

    const { bottom, left } = element.getBoundingClientRect();
    const offsetHorizont = (toolTip.offsetWidth - element.offsetWidth) / 2;

    toolTip.style.left = `${left - offsetHorizont}px`;
    toolTip.style.top = `${bottom + 5}px`;
  }
}
