!(function(root = window) {
  class Life {
    constructor(width = 50, height = 50, density = 5) {
      this.initialiseLife(width, height, density);
    }
    initialiseLife(width = 50, height = 50, density = 5) {
      // density is a weighting from 0 to 10
      // 0 = no life
      // 5 = 50/50 chance of life
      // 10 = life everywhere
      this.rows = [];
      this.height = height;
      this.width = width;
      for (let row = 0; row < width; row++) {
        let columns = [];
        for (let col = 0; col < height; col++) {
          columns[col] = !!Math.floor(Math.random() + 0.1 * density);
        }
        this.rows[row] = columns;
      }
    }
    nextGeneration() {
      // Each generation (turn), the following rules are applied:
      // 1. Any live cell with fewer than two or more than three
      //    live neighbours dies.
      // 2. Any live cell with two or three live neighbours
      //    lives on to the next generation.
      // 3. Any dead cell with exactly three live neighbours
      //    becomes a live cell.
      let nextGen = [];
      for (let row = 0; row < this.width; row++) {
        let columns = [];
        for (let col = 0; col < this.height; col++) {
          let value = this.rows[row][col];
          columns[col] = value;
          let neighbours = this.numberOfNeighbours(row, col);
          if (value) {
            // cell is alive
            if (neighbours < 2 || neighbours > 3) {
              // cell dies
              columns[col] = 0;
            }
          } else {
            // cell is dead
            if (neighbours === 3) {
              // cell lives
              columns[col] = 1;
            }
          }
        }
        nextGen[row] = columns;
      }
      this.rows = nextGen;
    }
    numberOfNeighbours(row, col) {
      let count = 0;
      for (let x = row - 1; x <= row + 1; x++) {
        for (let y = col - 1; y <= col + 1; y++) {
          if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            count += this.rows[x][y] ? 1 : 0;
          }
        }
      }
      count -= this.rows[row][col] ? 1 : 0;
      return count;
    }
    toggleLife(row, col) {
      this.rows[row][col] = !this.rows[row][col];
    }
  }

  // iterate over Life using a generator
  Life.prototype[Symbol.iterator] = function*() {
    for (let row = 0; row < this.width; row++) {
      for (let col = 0; col < this.height; col++) {
        yield {
          row,
          col,
          value: this.rows[row][col],
          numberOfNeighbours: this.numberOfNeighbours.bind(this, row, col)
        };
      }
    }
  };

  let gridElement = document.getElementById('grid');
  let nextGenButton = document.getElementById('next');
  let autoPilotButton = document.getElementById('auto');
  let createLifeButton = document.getElementById('life');
  let autoPilot = false;
  let autoPilotID = 0;
  let life;

  const renderLife = (resetGrid = false) => {
    if (resetGrid) {
      // grid is empty so populate with base elements
      // use html table as basis for grid
      let currentRow = -1;
      let divCell;
      let table = document.createElement('table');
      let tableRow;
      let tableCell;
      if (gridElement.firstChild) {
        gridElement.removeChild(gridElement.firstChild);
      }
      for (let cell of life) {
        if (currentRow !== cell.row) {
          tableRow = document.createElement('tr');
          table.appendChild(tableRow);
          currentRow = cell.row;
        }
        tableCell = document.createElement('td');
        tableCell.dataset.row = cell.row;
        tableCell.dataset.col = cell.col;
        tableCell.addEventListener('click', e => {
          let target;
          let data;
          if (e.target.tagName == 'DIV') {
            target = e.target;
            data = e.target.parentNode;
          } else {
            target = e.target.firstChild;
            data = e.target;
          }
          life.toggleLife(cell.row, cell.col);
          if (life.rows[data.dataset.row][data.dataset.col]) {
            target.className = 'cell alive';
          } else {
            target.className = 'cell dead';
          }
        });
        divCell = document.createElement('div');
        divCell.className = 'cell';
        tableCell.appendChild(divCell);
        tableRow.appendChild(tableCell);
      }
      gridElement.appendChild(table);
    }
    // iterate through life and update content
    for (let cell of life) {
      // article[data-col='3']
      let divCell = document.querySelector(
        `td[data-row='${cell.row}'][data-col='${cell.col}']`
      );
      let targetClass = cell.value ? 'cell alive' : 'cell dead';
      if (divCell.firstChild.className !== targetClass) {
        divCell.firstChild.className = targetClass;
      }
    }
    if (autoPilot && autoPilotID === 0) {
      autoPilotID = setInterval(() => {
        life.nextGeneration();
        renderLife();
      }, 3000);
    } else if (!autoPilot && autoPilotID !== 0) {
      clearInterval(autoPilotID);
      autoPilotID = 0;
    }
  };

  const initialiseLife = (width, height, density = 5) => {
    life = new Life(width, height, density);
    renderLife(true);
  };

  const createLife = () => {
    let width =
      root.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    let height =
      root.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;
    let columns = Math.floor(width / 25);
    let rows = Math.floor(height / 25);
    document.getElementById('columns').value = columns;
    document.getElementById('rows').value = rows;
    initialiseLife(rows, columns, 3);
  };

  autoPilotButton.addEventListener('click', () => {
    autoPilot = !autoPilot;
    autoPilotButton.textContent = `Switch autopilot ${
      autoPilot ? 'off' : 'on'
    }`;
    life.nextGeneration();
    renderLife();
  });

  createLifeButton.addEventListener('click', () => {
    createLife();
  });

  nextGenButton.addEventListener('click', () => {
    life.nextGeneration();
    renderLife();
  });

  createLife();
})(this);
