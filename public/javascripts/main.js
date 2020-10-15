//runs on page load
document.addEventListener("DOMContentLoaded",(domcontentloadedevent)=>{
  /**
   * Changes on click behavior letting the user know if a piece is selected.
   */
  let cellSelected = false;
  /**
   * Holding variables for the selected cell.
   */
  let selectedCell;
  /**
   * Cell element.
   */
  let cellElem;
  /**
   * Important king state for both kings.
   */
  let kingState = {
    /**
     * Array of numbers coenciding with id's of cells the black king cannot be in.
     */    
    dangerousCellsForBlackKing: [],
    /**
     * Array of numbers coenciding with id's of cells the white king cannot be in.
     */    
    dangerousCellsForWhiteKing: [],
    /**
     * Flag to determine if the white king can castle.
     */
    canWhiteCastle: true,
    /**
     * Flag to determine if the black king can castle.
     */
    canBlackCastle: false,
  };
  /**
   * While true it is white's turn, while false it is black's turn.
   */
  let turn = true;
  /**
   * Array of valid spaces the selected piece may move
   */
  let validMoves = [];
  /**
   * used for lookup to determine the html char codes needed to fill the square with the correct piece visually
   */
  const pieceCharCodes = {
    pawn: '&#9817;',
    rook: '&#9814;',
    bishop: '&#9815;',
    knight: '&#9816;',
    king: '&#9812;',
    queen: '&#9813;',
  };
  /**
   * 8 16 24 32 40 48 56 64 home pieces //bottom row
   * 7 15 23 31 39 47 55 63 home pawns
   * 2 10 18 26 34 42 50 58 enemy pawns
   * 1 9 17 25 33 41 49 57 enemy pieces //top row
   *
   * used for chess piece location placement at board creation
   */
  const pieceLocationConfig = {
    blackRooks: [8, 64],
    whiteRooks: [1, 57],
    blackKing: 32,
    whiteKing: 25,
    blackQueen: 40,
    whiteQueen: 33,
    blackBishops: [24, 48],
    whiteBishops: [17, 41],
    blackKnights: [16, 56],
    whiteKnights: [9, 49],
    blackPieces: [8, 16, 24, 32, 40, 48, 56, 64],
    blackPawns: [7, 15, 23, 31, 39, 47, 55, 63],
    whitePieces: [1, 9, 17, 25, 33, 41, 49, 57],
    whitePawns: [2, 10, 18, 26, 34, 42, 50, 58],
  };

  /*********************************************************
   * container for the nodes
   ********************************************************/
  let boardArray = [];

  /**
   * Function run every move to fill arrays with id's of squares
   * each king cannot move to.
   */
  const setKingDanger = () => {
    kingState.dangerousCellsForBlackKing = [];
    kingState.dangerousCellsForWhiteKing = [];
    for (let col = 0; col < boardArray.length; col++) {
      for (let cellIndex = 0; cellIndex < 8; cellIndex++) {
        let [_color, piece] = boardArray[col][cellIndex].contains.split('_');
        switch (piece) {
          case 'pawn':
            highlightPawnMoves(boardArray[col][cellIndex], true);
            break;
          case 'knight':
            highlightKnightMoves(boardArray[col][cellIndex], true);
            break;
          case 'rook':
            highlightRookMoves(boardArray[col][cellIndex], true);
            break;
          case 'bishop':
            highlightBishopMoves(boardArray[col][cellIndex], true);
            break;
          case 'queen':
            highlightQueenMoves(boardArray[col][cellIndex], true);
            break;
          case 'king':
            highlightKingMoves(boardArray[col][cellIndex], true);
            break;
        }
      }
    }

    kingState.dangerousCellsForWhiteKing = [...new Set(kingState.dangerousCellsForWhiteKing)];
    kingState.dangerousCellsForBlackKing = [...new Set(kingState.dangerousCellsForBlackKing)];
  }

  /**
   * End goal gatekeeper for the action. Thing runs 64 min times per click.....
   * @param {'w' | 'b'} race 'w' | 'b'
   * @param {boolean} danger While true checking for danger and not valid moves.
   * @param {number} vm ID of valid move or danger move. 
   */
  const dangerHelper = (race, danger, vm) => {
    if (danger) {
      if (race === 'w') {
        kingState.dangerousCellsForBlackKing.push(vm)
      } else {
        kingState.dangerousCellsForWhiteKing.push(vm)
      }
    } else {
      validMoves.push(vm);
    }
  }

  /**
   * Helper function for vertical iteration.
   * @param {number} index Starting index of cell in column.
   * @param {number} column Column index of the cell.
   * @param {string} race Color of the piece to help define walls.
   * @param {boolean} danger While true, don't set valid moves, set danger spaces for kings.
   */
  const vert = (index, column, race, danger = false) => {
    for (let i = index - 1; i > -1; i--) {
      if(boardArray[column][i].contains) {
        if(boardArray[column][i].contains[0] !== race || danger) {
          dangerHelper(race, danger, boardArray[column][i].id);
        }
        if(boardArray[column][i].contains[0] !== race && boardArray[column][i].contains.endsWith('king') && danger) {
          // Skip break to highlight danger squares behind enemy king.
        } else {
          break;
        }
      } else {
        dangerHelper(race, danger, boardArray[column][i].id);
      }
    }

    for (let i = index + 1; i < 8; i++) {
      if(boardArray[column][i].contains) {
        if(boardArray[column][i].contains[0] !== race || danger) {
          dangerHelper(race, danger, boardArray[column][i].id);
        }
        if(boardArray[column][i].contains[0] !== race && boardArray[column][i].contains.endsWith('king') && danger) {
          // Skip break to highlight danger squares behind enemy king.
        } else {
          break;
        }
      } else {
        dangerHelper(race, danger, boardArray[column][i].id);
      }
    }
  }

  /**
   * Helper function for horizontal iteration.
   * @param {number} index Starting column index.
   * @param {number} column Column index of the cell.
   * @param {string} race Color of the piece to help define walls.
   * @param {boolean} danger While true, don't set valid moves, set danger spaces for kings.
   */
  const horiz = (index, column, race, danger = false) => {
    for (let i = column - 1; i > -1; i--) {
      if(boardArray[i][index].contains) {
        if(boardArray[i][index].contains[0] !== race || danger) {
          dangerHelper(race, danger, boardArray[i][index].id)
        };
        if(boardArray[i][index].contains[0] !== race && boardArray[i][index].contains.endsWith('king') && danger) {
          // Skip break to highlight danger squares behind enemy king.
        } else {
          break;
        }
      } else {
        dangerHelper(race, danger, boardArray[i][index].id)
      }
    }

    for (let i = column + 1; i < 8; i++) {
      if(boardArray[i][index].contains) {
        if(boardArray[i][index].contains[0] !== race || danger) {
          dangerHelper(race, danger, boardArray[i][index].id)
        };
        if(boardArray[i][index].contains[0] !== race && boardArray[i][index].contains.endsWith('king') && danger) {
          // Skip break to highlight danger squares behind enemy king.
        } else {
          break;
        }
      } else {
        dangerHelper(race, danger, boardArray[i][index].id)
      }
    }
  }

  /**
   * 4 iterations accumulating valid moves until hits piece or a wall
   * in each diagonal direction.
   * @param {number} index Index of the cell in the column array.
   * @param {number} column Index of the column the cell exists in.
   * @param {string} race White or black.
   * @param {boolean} danger While true, don't set valid moves, set danger spaces for kings.
   */
  const diag = (index, column, race, danger = false) => {
    let holdCol = column + 1;
    for (let i = index + 1; i < 8 && holdCol < 8; i++) { // down right
      if(boardArray[holdCol][i].contains) {
        if(boardArray[holdCol][i].contains[0] !== race || danger) {
          dangerHelper(race, danger, boardArray[holdCol][i].id);
        }
        if(boardArray[holdCol][i].contains[0] !== race && boardArray[holdCol][i].contains.endsWith('king') && danger) {
          // Skip break to highlight danger squares behind enemy king.
        } else {
          break;
        }
      } else {
        dangerHelper(race, danger, boardArray[holdCol][i].id)
      }
      holdCol++
    }
    holdCol = column + 1;

    for (let j = index - 1; j > -1 && holdCol < 8; j--) { // up right
      if(boardArray[holdCol][j].contains) {
        if(boardArray[holdCol][j].contains[0] !== race || danger) {
          dangerHelper(race, danger, boardArray[holdCol][j].id);
        }
        if(boardArray[holdCol][j].contains[0] !== race && boardArray[holdCol][j].contains.endsWith('king') && danger) {
          // Skip break to highlight danger squares behind enemy king.
        } else {
          break;
        }
      } else {
        dangerHelper(race, danger, boardArray[holdCol][j].id)
      }
      holdCol++
    }
    holdCol = column - 1;

    for (let k = index + 1; k < 8 && holdCol > -1 ; k++) { // down left
      if(boardArray[holdCol][k].contains) {
        if(boardArray[holdCol][k].contains[0] !== race || danger) {
          dangerHelper(race, danger, boardArray[holdCol][k].id);
        }
        if(boardArray[holdCol][k].contains[0] !== race && boardArray[holdCol][k].contains.endsWith('king') && danger) {
          // Skip break to highlight danger squares behind enemy king.
        } else {
          break;
        }
      } else {
        dangerHelper(race, danger, boardArray[holdCol][k].id)
      }
      holdCol--
    }
    holdCol = column - 1;

    for (let l = index - 1; l > -1 && holdCol > -1; l--) { // up left
      if(boardArray[holdCol][l].contains) {
        if(boardArray[holdCol][l].contains[0] !== race || danger) {
          dangerHelper(race, danger, boardArray[holdCol][l].id);
        }
        if(boardArray[holdCol][l].contains[0] !== race && boardArray[holdCol][l].contains.endsWith('king') && danger) {
          // Skip break to highlight danger squares behind enemy king.
        } else {
          break;
        }
      } else {
        dangerHelper(race, danger, boardArray[holdCol][l].id)
      }
      holdCol--
    }
  }

  /**
   * Determines possible pawn moves.
   * :::::::::::TODO:::::::: empesant
   * @param {Cell} cell Input cell class.
   * @param {boolean} danger While true, don't set valid moves, set danger spaces for kings.
   */
  const highlightPawnMoves = (cell, danger = false) => {
    const mod = cell.id % 8;
    const pIndeX = mod === 0 ? 7 : mod - 1;
    const isWhitePawn = cell.contains[0] === 'w';
    // while true pawn is on it's home space.
    let f2;

    if (isWhitePawn) {
      f2 = pIndeX === 1;
      if(boardArray[cell.column - 1][pIndeX + 1].contains === '') {
        !danger && validMoves.push(boardArray[cell.column - 1][pIndeX + 1].id);
        if(f2 && boardArray[cell.column - 1][pIndeX + 2].contains === '') {
          !danger && validMoves.push(boardArray[cell.column - 1][pIndeX + 2].id);
        }
      }// forward movement
      if(boardArray[cell.column] && (boardArray[cell.column][pIndeX + 1].contains[0] === 'b' || danger)){
        dangerHelper(cell.contains[0], danger, boardArray[cell.column][pIndeX + 1].id)
      }// diagonal movement
      if(boardArray[cell.column - 2] && (boardArray[cell.column - 2][pIndeX + 1].contains[0] === 'b' || danger)) {
        dangerHelper(cell.contains[0], danger, boardArray[cell.column - 2][pIndeX + 1].id)
      }// diagonal movement
    } else {
      f2 = pIndeX === 6;
      if(boardArray[cell.column - 1][pIndeX - 1].contains === '') {
        !danger && validMoves.push(boardArray[cell.column - 1][pIndeX - 1].id)
        if (f2 && boardArray[cell.column - 1][pIndeX - 2].contains === '') {
          !danger && validMoves.push(boardArray[cell.column - 1][pIndeX - 2].id)
        }
      }// handle forward movement
      if(boardArray[cell.column] && (boardArray[cell.column][pIndeX - 1].contains[0] === 'w' || danger)) {
        dangerHelper(cell.contains[0], danger, boardArray[cell.column][pIndeX - 1].id)
      }// diagonal movement
      if(boardArray[cell.column - 2] && (boardArray[cell.column - 2][pIndeX - 1].contains[0] === 'w' || danger)) {
        dangerHelper(cell.contains[0], danger, boardArray[cell.column - 2][pIndeX - 1].id)
      }// diagonal movement
    }
  }

  /**
   * Gatekeeper for knight movement.
   * @param {Cell} cell Input cell class.
   * @param {boolean} danger While true, don't set valid moves, set danger spaces for kings.
   */
  const highlightKnightMoves = (cell, danger = false) => {
    const mod = cell.id % 8;
    const kIndex = mod === 0 ? 7 : mod - 1;
    const isWhite = cell.contains[0] === 'w';
    [
      boardArray[cell.column] && boardArray[cell.column][kIndex + 2],//bottom mid right
      boardArray[cell.column] && boardArray[cell.column][kIndex - 2],//top mid right
      boardArray[cell.column + 1] && boardArray[cell.column + 1][kIndex + 1],// bottom far right
      boardArray[cell.column + 1] && boardArray[cell.column + 1][kIndex - 1],// top far right
      boardArray[cell.column - 2] && boardArray[cell.column - 2][kIndex + 2],// bottom mid left
      boardArray[cell.column - 2] && boardArray[cell.column - 2][kIndex - 2],// top mid left
      boardArray[cell.column - 3] && boardArray[cell.column - 3][kIndex + 1],// bottom far left
      boardArray[cell.column - 3] && boardArray[cell.column - 3][kIndex - 1],// top far left
    ]
      .filter(e => e && (e.contains[0] !== (isWhite ? 'w' : 'b') || danger))// Remove empty or same color.
      .forEach(tCell => dangerHelper(cell.contains[0], danger, tCell.id));// Send em to the validMoves.
  }

  /**
   * Determines possible rook moves.
   * @param {Cell} cell Input cell class.
   * @param {boolean} danger While true, don't set valid moves, set danger spaces for kings.
   */
  const highlightRookMoves = (cell, danger = false) => {
    const mod = cell.id % 8;
    const rIndex = mod === 0 ? 7 : mod - 1;
    vert(rIndex, cell.column - 1, cell.contains[0], danger);
    horiz(rIndex, cell.column - 1, cell.contains[0], danger);
  }

  /**
   * Determines possible bishop movement.
   * @param {Cell} cell Input cell class.
   * @param {boolean} danger While true, don't set valid moves, set danger spaces for kings.
   */
  const highlightBishopMoves = (cell, danger = false) => {
    const mod = cell.id % 8;
    const bIndex = mod === 0 ? 7 : mod - 1;
    diag(bIndex, cell.column - 1, cell.contains[0], danger);
  }

  /**
   * Determines possible queen movement.
   * @param {Cell} cell Input cell class.
   * @param {boolean} danger While true, don't set valid moves, set danger spaces for kings.
   */
  const highlightQueenMoves = (cell, danger = false) => {
    const mod = cell.id % 8;
    const qIndex = mod === 0 ? 7 : mod - 1;
    vert(qIndex, cell.column - 1, cell.contains[0], danger);
    horiz(qIndex, cell.column - 1, cell.contains[0], danger);
    diag(qIndex, cell.column - 1, cell.contains[0], danger);
  }

  highlightKingCastleMoves = (cell, kIndex, danger = false) => {
    // Still trying to figure this out
  }

  /**
   * Handles King movement.
   * NIGHTMARE NIGHTMARE NIGHTMARE NIGHTMARE NIGHTMARE NIGHTMARE NIGHTMARE
   * NIGHTMARE NIGHTMARE NIGHTMARE NIGHTMARE NIGHTMARE NIGHTMARE NIGHTMARE
   * TODO handle castling.
   */
  const highlightKingMoves = (cell, danger = false) => {
    const mod = cell.id % 8;
    const kIndex = mod === 0 ? 7 : mod - 1;
    const isWhite = cell.contains[0] === 'w';
    [
      boardArray[cell.column] && boardArray[cell.column][kIndex - 1],
      boardArray[cell.column] && boardArray[cell.column][kIndex],
      boardArray[cell.column] && boardArray[cell.column][kIndex + 1],
      boardArray[cell.column - 1] && boardArray[cell.column - 1][kIndex - 1],
      boardArray[cell.column - 1] && boardArray[cell.column - 1][kIndex + 1],
      boardArray[cell.column - 2] && boardArray[cell.column - 2][kIndex - 1],
      boardArray[cell.column - 2] && boardArray[cell.column - 2][kIndex],
      boardArray[cell.column - 2] && boardArray[cell.column - 2][kIndex + 1],
    ]
      .filter(e => e &&
        (
          (
            e.contains[0] !== (isWhite ? 'w' : 'b') &&
            !(isWhite ? kingState.dangerousCellsForWhiteKing : kingState.dangerousCellsForBlackKing).includes(e.id)
          ) ||
          danger
        )
      )
      .forEach(tCell => dangerHelper(cell.contains[0], danger, tCell.id));
  }

  /**
   * Undoes the below highlighting.
   */
  const unhighlightValidMoves = () => {
    validMoves.forEach(id => document.getElementById(id).style.backgroundColor = '');
    validMoves = [];
  }

  /**
   * Takes a cell and highlights all valid spots the piece on that cell can move
   * @param {Square} cell 
   */
  const highlightValidMoves = cell => {
    unhighlightValidMoves();
    let [color, piece] = cell.contains.split('_');
    console.log(color, piece)
    switch (piece) {
      case 'pawn':
        highlightPawnMoves(cell);
        break;
      case 'knight':
        highlightKnightMoves(cell);
        break;
      case 'rook':
        highlightRookMoves(cell);
        break;
      case 'bishop':
        highlightBishopMoves(cell);
        break;
      case 'queen':
        highlightQueenMoves(cell);
        break;
      case 'king':
        highlightKingMoves(cell);
        break;
    }
    validMoves.forEach(id => document.getElementById(id).style.backgroundColor = 'tomato');
  }

  /**
   * Handles clicks to all cells on the chess board
   * @param {MouseEvent} event 
   * @param {Square} cell 
   */
  const cellClickEvent = (event, cell) => {
    const setSelected = () => {
      selectedCell = cell;
      cellSelected = true;
      cell.isActive = true;
      cellElem = document.getElementById(cell.id);
      cellElem.style.backgroundColor = 'red';
      highlightValidMoves(cell);
    };

    const clearPrevSelected = () => {
      selectedCell.isActive = false;
      cellElem.style.backgroundColor = '';
    }    

    const doubleSelect = () => {
      clearPrevSelected();
      unhighlightValidMoves();
      selectedCell = null;
      cellSelected = false;
    }

    if (cellSelected) {
      if (turn && cell.contains[0] === 'w') {
        if (cellSelected && cell.id === selectedCell.id) {
          doubleSelect();
        } else {
          clearPrevSelected();
          setSelected();
        }
      } else if (!turn && cell.contains[0] === 'b') {
        if (cellSelected && cell.id === selectedCell.id) {
          doubleSelect();
        } else {
          clearPrevSelected();
          setSelected();
        } 
      }

      if (validMoves.includes(cell.id)) {
        let [color, piece] = selectedCell.contains.split('_')
        /**
         * I JUST STOPPED WORKING HERE CONTINUE TRYING TO MAKE a castle POSSIBLE
         */
        if (piece === 'king') {
          if (color === 'w') {

          } else {

          }
        }
        cell.setPiece(piece, true, color === 'w');
        selectedCell.setPiece(piece, false, null);
        clearPrevSelected();
        unhighlightValidMoves();
        setKingDanger();
        turn = !turn;
        setScoreboardBorder();
      }

    } else if (cell.contains.length > 0) {
      if (turn && cell.contains[0] === 'w') {
        setSelected();
      } else if (!turn && cell.contains[0] === 'b') {
        setSelected();
      }
    }
    console.log(event, cell);
  }

  /**
   * Informs the players who's turn it is by subtly highlighting the border of the corresponding color on the scoreboard.
   */
  const setScoreboardBorder = () => {
    document.getElementsByClassName('my-turn')[0] && document.getElementsByClassName('my-turn')[0]
      .setAttribute('class', turn ? 'black-score' : 'white-score')
    document
      .getElementsByClassName(turn ? 'white-score' : 'black-score')[0]
      .setAttribute('class', turn ? 'white-score my-turn' : 'black-score my-turn')
  }

  /**
   * Builds a scoreboard a little bit below the chess board.
   */
  const buildScoreboard = () => {
    let scoreboard = document.createElement('div');
    let l = document.createElement('div');
    let r = document.createElement('div');
    scoreboard.setAttribute('class', 'scoreboard');
    l.setAttribute('class', 'white-score');
    r.setAttribute('class', 'black-score');
    scoreboard.appendChild(l);
    scoreboard.appendChild(r);
    document.body.appendChild(scoreboard);
    setScoreboardBorder();
  }

  /**
   * Builds the chess board.
   */
  const buildChessBoard = () => {
    let
      whiteNode,
      blackNode,
      cellCount=1,
      rowCount=1,
      rowArray,
    //generates white node and initiates dom creation
    whitey = () => {
      whiteNode = new Square('white',cellCount,rowCount)
      whiteNode.create(cellCount)
      cellCount++
    },
    //generates black node and initiates dom creation
    blackey = () => {
      blackNode = new Square('black',cellCount,rowCount)
      blackNode.create(cellCount)
      cellCount++
    };
    //loop for columns
    for(let i = 0; i < 8; i++){
      rowArray=[]
      //loop for populating column
      for(let j = 0; j < 4; j++){
        if(i%2===0){
          whitey();
          blackey();
          rowArray.push(whiteNode, blackNode);
        }
        else{
          blackey();
          whitey();
          rowArray.push(blackNode, whiteNode);
        }
      }
      rowCount++;
      boardArray.push(rowArray);
    }

    buildScoreboard();
    setKingDanger();
  };

  class Square {
    //initializes chess board square
    constructor(color=null,id,column){
      if(!color) throw new Error('input required');
      if(color !== 'white' && color !== 'black') throw new Error('incorrect color input');
      if(typeof color !== 'string') throw new Error('incorrect input');
      this.isActive = false;
      this.color = color;
      this.id = id;
      this.column = column;
      this.contains = '';
    }
    //generates dom element with corresponding id as value
    create(id){
      if(this.color === 'black'){
        let blackSquare = document.createElement('div');
        blackSquare.setAttribute('value',`${id}`);
        blackSquare.setAttribute('id', id);
  
        ///////////OUTPUT ON CLICK///////////////////////
        blackSquare.addEventListener('click', e => {
          cellClickEvent(e, this);
        });
        ///////////////////////////////////////////////// end output on click
  
        document.body.appendChild(blackSquare)
      }
      else if(this.color === 'white'){
        let whiteSquare = document.createElement('div');
        whiteSquare.setAttribute('value',`${id}`);
        whiteSquare.setAttribute('id', id);
  
        ///////////OUTPUT ON CLICK///////////////////////
        whiteSquare.addEventListener('click',(e)=>{
          cellClickEvent(e, this);
        })
        ///////////////////////////////////////////////// end output on click
  
        document.body.appendChild(whiteSquare);
      }else{
        throw new Error('how');
      }

      this.setContains();
    }

    generateClass(whitePiece) {
      return `${this.color === 'white' ? 'white' : 'black'} col${this.column} ${whitePiece ? 'w-piece' : whitePiece === false ? 'b-piece' : ''}`;
    }
    //to be called to see if the square is active: contains piece or interaction
    active(){
      return this.isActive;
    }
    //sets activity and returns if the square is active
    setActive(){
      this.isActive = !this.isActive;
      return this.isActive;
    }
    //tells you the color of the square
    getColor(){
      return this.color;
    }
    //adds or removes chess piece to the square
    setContains(){
      switch(true) {
        case pieceLocationConfig.blackPawns.includes(this.id) : 
          this.setPiece('pawn', true, false);
          break;
        case pieceLocationConfig.whitePawns.includes(this.id) : 
          this.setPiece('pawn');
          break;
        case pieceLocationConfig.whiteRooks.includes(this.id) :
          this.setPiece('rook');
          break;
        case pieceLocationConfig.blackRooks.includes(this.id) :
          this.setPiece('rook', true, false);
          break;
        case pieceLocationConfig.whiteKnights.includes(this.id) :
          this.setPiece('knight');
          break;
        case pieceLocationConfig.blackKnights.includes(this.id) :
          this.setPiece('knight', true, false);
          break;
        case pieceLocationConfig.whiteBishops.includes(this.id) :
          this.setPiece('bishop');
          break; 
        case pieceLocationConfig.blackBishops.includes(this.id) :
          this.setPiece('bishop', true, false);
          break; 
        case pieceLocationConfig.whiteKing === this.id :
          this.setPiece('king');
          break; 
        case pieceLocationConfig.blackKing === this.id :
          this.setPiece('king', true, false);
          break; 
        case pieceLocationConfig.whiteQueen === this.id :
          this.setPiece('queen');
          break;
        case pieceLocationConfig.blackQueen === this.id :
          this.setPiece('queen', true, false);
          break;
        default:
          document.getElementById(this.id).setAttribute(
            'class',
            this.generateClass()
          ); 
          break;
      }
    }

    getContains() {
      return this.contains;
    }
    //adds pawn by default removes if passed false
    setPiece(piece = '', add = true, white = true) {
      if (!add) {
        this.clearCell();
      } else {
        document.getElementById(this.id).innerHTML = pieceCharCodes[piece];
        document.getElementById(this.id).setAttribute(
          'class',
          this.generateClass(white)
        );
        this.contains = `${white === null ? '' : white ? 'w' : 'b'}${white === null ? '' : '_'}${piece}`;
      }
    }
   
    //empties the cell
    clearCell() {
      document.getElementById(this.id).innerHTML = '';
      this.contains = '';
    }
  }

  buildChessBoard();
})
