/* TODO:
    -better error communication to the website
    -implement private decomposition function
    -make solve always converge
 */

// Type definitions for different matrix storage types
interface DenseMatrixStorage {
    type: 'dense';
    data: number[][];
}

interface DiagonalMatrixStorage {
    type: 'diagonal';
    data: number[];
}

interface SparseMatrixStorage {
    type: 'sparse';
    data: { [row: number]: { [col: number]: number } };
}

interface BandMatrixStorage {
    type: 'band';
    data: {
        bandWidth: number;
        data: number[][];
    };
}

interface LowerTriangularMatrixStorage {
    type: 'lower-triangular';
    data: number[];
}

interface UpperTriangularMatrixStorage {
    type: 'upper-triangular';
    data: number[];
}

interface PositiveDefiniteSymmetricMatrixStorage {
    type: 'positive-definite-symmetric';
    data: number[][];
}

interface DiagonallyDominantMatrixStorage {
    type: 'diagonally-dominant';
    data: number[][];
}

export type MatrixStorage =
    | DenseMatrixStorage
    | DiagonalMatrixStorage
    | SparseMatrixStorage
    | BandMatrixStorage
    | LowerTriangularMatrixStorage
    | UpperTriangularMatrixStorage
    | PositiveDefiniteSymmetricMatrixStorage
    | DiagonallyDominantMatrixStorage;

export type IterationResult = {
    old: number[];
    new: number[];
    error: number;
};

export class MatrixSolver {
    private matrix: MatrixStorage;
    private vector: number[];
    private archive?: IterationResult[];
    private solved: 'not-yet' | 'solved' | 'did-not-converge';

    constructor(m?: number[][], b?: number[], archiveIterations: boolean = true) {
        if (m && b) {
            if (b.length !== m.length) {
                throw new Error('Incompatible matrix and vector sizes');
            }
            if (m.length === 0 || m[0].length !== m.length) {
                throw new Error('Matrix is not square or empty');
            }
            this.vector = b;
            this.matrix = this.storeMatrix(m);
        } else {
            this.matrix = { type: 'dense', data: [] };
            this.vector = [];
        }
        this.archive = archiveIterations ? [] : undefined;
        this.solved = 'not-yet';
    }

    // Detect and store the matrix in an optimized format
    public storeMatrix(m: number[][]): MatrixStorage {
        const n = m.length;

        const isDiagonal = (matrix: number[][]): boolean => {
            return matrix.every((row, i) =>
                row.every((value, j) => (i === j || value === 0))
            );
        };

        const isTriangular = (matrix: number[][]): 'lower' | 'upper' | null => {
            let isLower = true,
                isUpper = true;
            for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    if (matrix[i][j] !== 0) isLower = false;
                    if (matrix[j][i] !== 0) isUpper = false;
                }
                if (!isLower && !isUpper) break;
            }
            if (isLower) return 'lower';
            if (isUpper) return 'upper';
            return null;
        };

        const getBandWidth = (matrix: number[][]): number | null => {
            let bandWidth = 0;
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    if (matrix[i][j] !== 0) {
                        bandWidth = Math.max(bandWidth, Math.abs(i - j));
                    }
                }
            }
            return bandWidth < n ? bandWidth : null;
        };

        const isPositiveDefiniteSymmetric = (matrix: number[][]): boolean => {
            // Check symmetry
            for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    if (matrix[i][j] !== matrix[j][i]) {
                        return false;
                    }
                }
            }

            // Cholesky decomposition
            const L = Array.from({ length: n }, () => Array(n).fill(0));
            for (let i = 0; i < n; i++) {
                for (let j = 0; j <= i; j++) {
                    let sum = 0;
                    for (let k = 0; k < j; k++) {
                        sum += L[i][k] * L[j][k];
                    }
                    if (i === j) {
                        const val = matrix[i][i] - sum;
                        if (val <= 0) return false;
                        L[i][j] = Math.sqrt(val);
                    } else {
                        L[i][j] = (matrix[i][j] - sum) / L[j][j];
                    }
                }
            }
            return true;
        };

        const isDiagonallyDominant = (matrix: number[][]): boolean => {
            return matrix.every((row, i) => {
                const diag = Math.abs(row[i]);
                const sum = row.reduce(
                    (acc, val, j) => acc + (i !== j ? Math.abs(val) : 0),
                    0
                );
                return diag >= sum;
            });
        };

        const isSparse = (matrix: number[][]): boolean => {
            let zeroCount = 0;
            const totalElements = n * n;
            matrix.forEach((row) =>
                row.forEach((value) => {
                    if (value === 0) zeroCount++;
                })
            );
            return zeroCount / totalElements > 0.5; // Sparse if >50% zeros
        };

        // Check for matrix types in the correct order
        if (isDiagonal(m)) {
            const diagData = m.map((row, i) => row[i]);
            return { type: 'diagonal', data: diagData };
        }

        const triangularType = isTriangular(m);
        if (triangularType) {
            const data: number[] = [];
            if (triangularType === 'lower') {
                for (let i = 0; i < n; i++) {
                    for (let j = 0; j <= i; j++) {
                        data.push(m[i][j]);
                    }
                }
                return { type: 'lower-triangular', data };
            } else {
                for (let i = 0; i < n; i++) {
                    for (let j = i; j < n; j++) {
                        data.push(m[i][j]);
                    }
                }
                return { type: 'upper-triangular', data };
            }
        }

        const bandWidth = getBandWidth(m);
        if (bandWidth !== null && bandWidth < n - 1) {
            const bandData = m.map((row, i) =>
                row.slice(
                    Math.max(0, i - bandWidth),
                    Math.min(n, i + bandWidth + 1)
                )
            );
            return { type: 'band', data: { bandWidth, data: bandData } };
        }

        if (isPositiveDefiniteSymmetric(m)) {
            return { type: 'positive-definite-symmetric', data: m };
        }

        if (isDiagonallyDominant(m)) {
            return { type: 'diagonally-dominant', data: m };
        }

        if (isSparse(m)) {
            const sparseData: { [row: number]: { [col: number]: number } } = {};
            m.forEach((row, i) => {
                row.forEach((value, j) => {
                    if (value !== 0) {
                        if (!sparseData[i]) sparseData[i] = {};
                        sparseData[i][j] = value;
                    }
                });
            });
            return { type: 'sparse', data: sparseData };
        }

        return { type: 'dense', data: m };
    }

    public solve(
        tolerance = 1e-8,
        maxIterations = 1000,
        initialGuess?: number[]
    ): number[] {
        const n = this.vector.length;
        let x: number[] = initialGuess ? [...initialGuess] : Array(n).fill(0);
        let converged = false;

        // Check for zero diagonal elements before starting iterations
        for (let i = 0; i < n; i++) {
            const row = this.getRow(i);
            if (row[i] === 0) {
                throw new Error(
                    `Zero diagonal element at row ${i}. Consider pivoting the matrix.`
                );
            }
        }

        for (let iteration = 0; iteration < maxIterations; iteration++) {
            const xOld = [...x];

            for (let i = 0; i < n; i++) {
                const row = this.getRow(i);
                let sum = 0;

                for (let j = 0; j < n; j++) {
                    if (j !== i && row[j] !== 0) {
                        sum += row[j] * x[j];
                    }
                }

                x[i] = (this.vector[i] - sum) / row[i];
            }

            const error = Math.max(...x.map((xi, i) => Math.abs(xi - xOld[i])));
            const residual = this.computeResidual(x);
            const residualNorm = Math.max(...residual.map(Math.abs));

            if (this.archive) {
                this.archive.push({ old: xOld, new: [...x], error });
            }

            if (error < tolerance && residualNorm < tolerance) {
                converged = true;
                this.solved = 'solved';
                break;
            }
        }

        if (!converged) {
            console.warn(
                `Gauss-Seidel method did not converge within ${maxIterations} iterations. Final error: ${tolerance}`
            );
            this.solved = 'did-not-converge';
        }

        return x;
    }

    private computeResidual(x: number[]): number[] {
        const n = x.length;
        const residual = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            const row = this.getRow(i);
            const ax_i = row.reduce((sum, val, j) => sum + val * x[j], 0);
            residual[i] = ax_i - this.vector[i];
        }
        return residual;
    }

    // Get a row from the matrix regardless of storage type
    private getRow(rowIndex: number): number[] {
        const { type, data } = this.matrix;
        const n = this.vector.length;

        switch (type) {
            case 'dense':
            case 'positive-definite-symmetric':
            case 'diagonally-dominant':
                return (data as number[][])[rowIndex];
            case 'sparse': {
                const row: number[] = Array(n).fill(0);
                const sparseData = data as SparseMatrixStorage['data'];
                const sparseRow = sparseData[rowIndex] || {};
                Object.entries(sparseRow).forEach(([col, value]) => {
                    if (typeof value === 'number') {
                        row[Number(col)] = value;
                    }
                });
                return row;
            }
            case 'diagonal': {
                const row = Array(n).fill(0);
                row[rowIndex] = (data as number[])[rowIndex];
                return row;
            }
            case 'band': {
                const { bandWidth, data: bandData } = data as BandMatrixStorage['data'];
                const row = Array(n).fill(0);
                const startCol = Math.max(0, rowIndex - bandWidth);
                const endCol = Math.min(n - 1, rowIndex + bandWidth);
                for (let j = startCol; j <= endCol; j++) {
                    row[j] = bandData[rowIndex][j - startCol];
                }
                return row;
            }
            case 'lower-triangular': {
                const row = Array(n).fill(0);
                let dataIndex = (rowIndex * (rowIndex + 1)) / 2;
                const lowerData = data as number[];
                for (let j = 0; j <= rowIndex; j++) {
                    row[j] = lowerData[dataIndex++];
                }
                return row;
            }
            case 'upper-triangular': {
                const row = Array(n).fill(0);
                const totalElements = (n * (n + 1)) / 2;
                let dataIndex =
                    totalElements - ((n - rowIndex) * (n - rowIndex + 1)) / 2;
                const upperData = data as number[];
                for (let j = rowIndex; j < n; j++) {
                    row[j] = upperData[dataIndex++];
                }
                return row;
            }
            default:
                throw new Error(`Unsupported or unknown matrix type: ${type}`);
        }
    }

    public getResults(): IterationResult[] | undefined {
        return this.archive;
    }

    public getSolved(): 'not-yet' | 'solved' | 'did-not-converge' {
        return this.solved;
    }

    public get isArchiving(): boolean {
        return typeof this.archive !== 'undefined';
    }

    public static oneMatrix(length: number): DiagonalMatrixStorage {
        return {
            type: 'diagonal',
            data: Array(length).fill(1),
        };
    }

    public static randomMatrix(length: number, max: number = 15): number[][] {
        const matrix = Array.from({ length }, () =>
            Array.from({ length }, () => Math.floor(Math.random() * max))
        );
        for (let i = 0; i < length; i++) {
            const rowSum = matrix[i].reduce(
                (sum, val, j) => sum + (i !== j ? Math.abs(val) : 0),
                0
            );
            matrix[i][i] = rowSum + 1; // Ensure diagonal dominance by adding a small value
        }
        return matrix;
    }

    public static randomVector(length: number, max: number = 15): number[] {
        return Array.from({ length }, () => Math.floor(Math.random() * max));
    }

    // Import a MatrixSolver from JSON data
    public static async fromJSON(
        input: File | string | object,
        archiveIterations: boolean = true
    ): Promise<MatrixSolver> {
        try {
            let jsonData: any;
            if (input instanceof File) {
                const result = await input.text();
                jsonData = JSON.parse(result);
            } else if (typeof input === 'string') {
                jsonData = JSON.parse(input);
            } else {
                jsonData = input;
            }

            if (!jsonData.matrix || !jsonData.vector) {
                throw new Error(
                    'JSON data must contain "matrix" and "vector" properties.'
                );
            }

            if (
                !Array.isArray(jsonData.matrix) ||
                !Array.isArray(jsonData.vector)
            ) {
                throw new Error('"matrix" and "vector" must be arrays.');
            }

            const solver = new MatrixSolver(
                jsonData.matrix,
                jsonData.vector,
                archiveIterations
            );
            return solver;
        } catch (error) {
            throw new Error(
                `Failed to import from JSON: ${(error as Error).message}`
            );
        }
    }

    /**
     * Reconstructs and returns the full matrix in standard 2D array form.
     * @returns The reconstructed matrix as a 2D array.
     */
    public getMatrix(): number[][] {
        const n = this.vector.length;
        const matrix: number[][] = Array.from({ length: n }, () =>
            Array(n).fill(0)
        );
        for (let i = 0; i < n; i++) {
            matrix[i] = this.getRow(i);
        }
        return matrix;
    }
}