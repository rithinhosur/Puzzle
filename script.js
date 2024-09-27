let puzzle = [];
let size = 4; // Default size of 4x4
let intervalId = null;

const puzzleGrid = document.getElementById('puzzleGrid');

// Function to create a puzzle of a specific size
function createPuzzle() {
    size = parseInt(document.getElementById('gridSize').value);
    puzzleGrid.style.gridTemplateColumns = `repeat(${size}, 60px)`; // Adjust the grid layout based on size

    // Generate the ordered puzzle (1 to size^2 - 1 with one blank)
    puzzle = Array.from({ length: size * size - 1 }, (_, i) => i + 1);
    puzzle.push(null); // The last cell is blank (null)

    renderPuzzle();
}

// Function to render the puzzle grid
function renderPuzzle() {
    puzzleGrid.innerHTML = ''; // Clear the existing grid

    puzzle.forEach((number) => {
        const cell = document.createElement('div');
        cell.classList.add('cell');

        if (number) {
            cell.textContent = number;
        } else {
            cell.classList.add('blank'); // Blank cell
        }

        puzzleGrid.appendChild(cell);
    });
}

// Fisher-Yates shuffle algorithm to randomly shuffle the puzzle
function shufflePuzzle() {
    for (let i = puzzle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [puzzle[i], puzzle[j]] = [puzzle[j], puzzle[i]];
    }

    renderPuzzle();
}

// Function to order the puzzle
function orderPuzzle() {
    puzzle = Array.from({ length: size * size - 1 }, (_, i) => i + 1);
    puzzle.push(null); // The last cell is blank
    renderPuzzle();
}

// Function to find the position of the blank cell
function findBlank(puzzle) {
    return puzzle.indexOf(null);
}

// A* Solver algorithm to calculate the moves needed to solve the puzzle
// Function to solve the puzzle and display the number of moves
function solvePuzzle() {
    const initialState = puzzle.slice();
    const goalState = Array.from({ length: size * size - 1 }, (_, i) => i + 1).concat([null]);

    const solution = aStarSolver(initialState, goalState);

    if (solution.length > 0) {
        const numberOfMoves = solution.length - 1; // Exclude the initial state
        alert(`Puzzle solved in ${numberOfMoves} moves.`);
        animateSolution(solution);
    } else {
        alert('No solution found.');
    }
}

// A* algorithm to find the shortest path
function aStarSolver(initialState, goalState) {
    const openSet = [initialState];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(initialState.toString(), 0);
    fScore.set(initialState.toString(), manhattanDistance(initialState, goalState));

    while (openSet.length > 0) {
        const current = openSet.reduce((a, b) => fScore.get(a.toString()) < fScore.get(b.toString()) ? a : b);

        if (arraysEqual(current, goalState)) {
            return reconstructPath(cameFrom, current);
        }

        openSet.splice(openSet.indexOf(current), 1);

        getNeighbors(current).forEach(neighbor => {
            const tentative_gScore = gScore.get(current.toString()) + 1;

            if (!gScore.has(neighbor.toString()) || tentative_gScore < gScore.get(neighbor.toString())) {
                cameFrom.set(neighbor.toString(), current);
                gScore.set(neighbor.toString(), tentative_gScore);
                fScore.set(neighbor.toString(), tentative_gScore + manhattanDistance(neighbor, goalState));

                if (!openSet.some(p => arraysEqual(p, neighbor))) {
                    openSet.push(neighbor);
                }
            }
        });
    }

    return [];
}

// Manhattan distance heuristic
function manhattanDistance(state, goalState) {
    let distance = 0;
    const size = Math.sqrt(state.length);

    state.forEach((value, index) => {
        if (value !== null) {
            const goalIndex = goalState.indexOf(value);
            const x1 = Math.floor(index / size);
            const y1 = index % size;
            const x2 = Math.floor(goalIndex / size);
            const y2 = goalIndex % size;
            distance += Math.abs(x1 - x2) + Math.abs(y1 - y2);
        }
    });

    return distance;
}

// Get neighboring states
function getNeighbors(state) {
    const neighbors = [];
    const blankIndex = findBlank(state);
    const size = Math.sqrt(state.length);
    const row = Math.floor(blankIndex / size);
    const col = blankIndex % size;

    const directions = [
        { r: -1, c: 0 }, // up
        { r: 1, c: 0 },  // down
        { r: 0, c: -1 }, // left
        { r: 0, c: 1 }   // right
    ];

    directions.forEach(({ r, c }) => {
        const newRow = row + r;
        const newCol = col + c;
        if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
            const newIndex = newRow * size + newCol;
            const newState = state.slice();
            [newState[blankIndex], newState[newIndex]] = [newState[newIndex], newState[blankIndex]];
            neighbors.push(newState);
        }
    });

    return neighbors;
}

// Animate the solution
function animateSolution(moves) {
    let index = 0;
    intervalId = setInterval(() => {
        if (index < moves.length) {
            puzzle = moves[index];
            renderPuzzle();
            index++;
        } else {
            clearInterval(intervalId);
        }
    }, 500); // Change this delay to control speed of animation
}

// Reconstruct path from A* algorithm
function reconstructPath(cameFrom, current) {
    const totalPath = [current];
    while (cameFrom.has(current.toString())) {
        current = cameFrom.get(current.toString());
        totalPath.unshift(current);
    }
    return totalPath;
}

// Utility function to compare arrays
function arraysEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

// Initialize the puzzle
createPuzzle();
