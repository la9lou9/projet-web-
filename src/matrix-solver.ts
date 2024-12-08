/* TODO:
    - Move SPD and DD to 'property' and change all methods (DONE!!)
    - Implement better error communication to the website. (50%????)
    - Implement a private decomposition function.          (DONE)
    - Make solve() always converge when possible.          (DONE??)
    - Somehow Add makeDD to archive                        --------
    - More Comments and JSDoc                              (JSDoc 90% / COMMENTS 20%)
*/

// Type definitions for different matrix storage types

/**
 * Dense matrix storage format.
 * Stores the entire matrix as a 2D array.
 */
interface DenseMatrixStorage {
    type: 'dense';
    data: number[][];
}

/**
 * Diagonal matrix storage format.
 * Stores only the diagonal elements of the matrix.
 */
interface DiagonalMatrixStorage {
    type: 'diagonal';
    data: number[];
}

/**
 * Sparse matrix storage format.
 * Stores non-zero elements with their row and column indices.
 */
interface SparseMatrixStorage {
    type: 'sparse';
    data: {
        values: number[];       // Non-zero values
        colIndices: number[];   // Column indices of non-zero values
        rowPointers: number[];  // Row pointers (indices in `values` where each row starts)
    };
}

/**
 * Band matrix storage format.
 * Stores the non-zero elements within the bandwidth.
 */
interface BandMatrixStorage {
    type: 'band';
    data: {
        bandWidth: number;
        data: number[][];
    };
}

/**
 * Lower triangular matrix storage format.
 * Stores non-zero elements of a lower triangular matrix.
 */
interface LowerTriangularMatrixStorage {
    type: 'lower-triangular';
    data: number[];
}

/**
 * Upper triangular matrix storage format.
 * Stores non-zero elements of an upper triangular matrix.
 */
interface UpperTriangularMatrixStorage {
    type: 'upper-triangular';
    data: number[];
}

/**
 * Interface representing the mathematical properties of a matrix.
 */
interface MatrixProperties {
    property: 'normal' | 'diagonally-dominant' | 'symmetric-positive-definite' | 'other';
}

interface PolynomialComplexity {
    coefficients: number[]; // Just the coefficients now, highest order first.
}

interface Complexity {
    verification: PolynomialComplexity;
    storing: PolynomialComplexity;
    decomposition: PolynomialComplexity;
    solving: PolynomialComplexity;
}

/**
 * Combined matrix storage type that includes storage optimization and matrix properties.
 */
export type MatrixStorage =
    | (DenseMatrixStorage & MatrixProperties)
    | (DiagonalMatrixStorage & MatrixProperties)
    | (SparseMatrixStorage & MatrixProperties)
    | (BandMatrixStorage & MatrixProperties)
    | (LowerTriangularMatrixStorage & MatrixProperties)
    | (UpperTriangularMatrixStorage & MatrixProperties);

/**
 * Represents the result of an iteration during the solving process.
 */
export type IterationResult = {
    old: number[];
    new: number[];
    error: number;
};

/**
 * A class to solve linear systems of equations using various matrix storage optimizations.
 * Supports solving using the Gauss-Seidel method and can handle different types of matrices.
 * It can also attempt to adjust matrices to ensure convergence when possible.
 */
export class MatrixSolver {
    private matrix: MatrixStorage;
    private vector: number[];
    private archive?: IterationResult[];
    private complexity: Complexity;
    private solved: 'not-yet' | 'solved' | 'did-not-converge';

    /**
     * Constructs a new MatrixSolver instance.
     * @param m - The coefficient matrix as a 2D array.
     * @param b - The right-hand side vector.
     * @param archiveIterations - Whether to archive iteration results.
     * @throws Error if the matrix and vector sizes are incompatible or the matrix is not square.
     */
    constructor(m?: number[][], b?: number[], archiveIterations: boolean = true) {
        if (m && b) {
            // Validate matrix and vector sizes
            if (b.length !== m.length) {
                throw new Error('Incompatible matrix and vector sizes');
            }
            if (m.length === 0 || m[0].length !== m.length) {
                throw new Error('Matrix is not square or empty');
            }
            this.vector = b;
            // Store the matrix in an optimized format
            this.matrix = this.storeMatrix(m);
        } else {
            // Initialize with empty matrix and vector
            this.matrix = {type: 'dense', data: [], property: 'normal'};
            this.vector = [];
        }
        // Initialize archiving if requested
        this.archive = archiveIterations ? [] : undefined;
        this.solved = 'not-yet';
        this.complexity = {
            verification: { coefficients: [] },
            storing: { coefficients: [] },
            decomposition: { coefficients: [] },
            solving: { coefficients: [] },
        };
    }

    /**
     * Detects and stores the matrix in an optimized format and assigns its mathematical properties.
     * @param m - The coefficient matrix as a 2D array.
     * @returns The matrix stored in an optimized format with its properties.
     */
    public storeMatrix(m: number[][]): MatrixStorage {
        const n = m.length;

        /**
         * Functions to detect properties and types that are only used in this method
         * Are declared here for better organization
         */

        /**
         * Checks if the matrix is diagonal.
         * @param matrix - The matrix to check.
         * @returns True if diagonal; otherwise, false.
         */
        const isDiagonal = (matrix: number[][]): boolean => {
            return matrix.every((row, i) => row.every((value, j) => (i === j || value === 0)));
        };

        /**
         * Determines if the matrix is lower or upper triangular.
         * @param matrix - The matrix to check.
         * @returns 'lower', 'upper', or null if neither.
         */
        const isTriangular = (matrix: number[][]): 'lower' | 'upper' | null => {
            let isLower = true,
                isUpper = true;
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    if (i > j && matrix[i][j] !== 0) {
                        isUpper = false;
                    }
                    if (i < j && matrix[i][j] !== 0) {
                        isLower = false;
                    }
                }
            }
            if (isLower) return 'lower';
            if (isUpper) return 'upper';
            return null;
        };

        /**
         * Calculates the bandwidth of the matrix.
         * @param matrix - The matrix to check.
         * @returns The bandwidth if it's less than n; otherwise, null.
         */
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

        /**
         * Checks if the matrix is sparse.
         * @param matrix - The matrix to check.
         * @returns True if sparse; otherwise, false.
         */
        const isSparse = (matrix: number[][]): boolean => {
            let zeroCount = 0;
            const totalElements = n * n;
            matrix.forEach((row) => row.forEach((value) => {
                if (value === 0) zeroCount++;
            }));
            return zeroCount / totalElements > 0.5; // Sparse if >50% zeros
        };

        // Determine properties
        let property: MatrixProperties['property'] = 'normal';
        if (this.isDiagonallyDominant(m)) {
            property = 'diagonally-dominant';
        } else if (this.isSymmetric(m) && this.isPositiveDefinite(m)) {
            property = 'symmetric-positive-definite';
        }

        // Determine storage type
        if (isDiagonal(m)) {
            // Store as diagonal matrix
            const diagData = m.map((row, i) => row[i]);
            return {type: 'diagonal', data: diagData, property};
        }

        const triangularType = isTriangular(m);
        if (triangularType) {
            // Store as lower or upper triangular matrix
            const data: number[] = [];
            if (triangularType === 'lower') {
                // Store lower triangular elements
                for (let i = 0; i < n; i++) {
                    for (let j = 0; j <= i; j++) {
                        data.push(m[i][j]);
                    }
                }
                return {type: 'lower-triangular', data, property};
            } else {
                // Store upper triangular elements
                for (let i = 0; i < n; i++) {
                    for (let j = i; j < n; j++) {
                        data.push(m[i][j]);
                    }
                }
                return {type: 'upper-triangular', data, property};
            }
        }

        const bandWidth = getBandWidth(m);
        if (bandWidth !== null && bandWidth < n - 1) {
            // Store as band matrix
            const bandData = m.map((row, i) =>
                row.slice(Math.max(0, i - bandWidth), Math.min(n, i + bandWidth + 1))
            );
            return {type: 'band', data: {bandWidth, data: bandData}, property};
        }

        if (isSparse(m)) {
            // Store as sparse matrix in CSR format
            const values: number[] = [];
            const colIndices: number[] = [];
            const rowPointers: number[] = [0];
            let nnz = 0; // Number of non-zero elements

            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    const value = m[i][j];
                    if (value !== 0) {
                        values.push(value);
                        colIndices.push(j);
                        nnz++;
                    }
                }
                rowPointers.push(nnz);
            }

            return {
                type: 'sparse',
                data: { values, colIndices, rowPointers },
                property,
            };
        }

        // Default to dense storage
        return {type: 'dense', data: m, property};
    }

    /**
     * Solves the linear system using the Gauss-Seidel method.
     * Optimized to work with non-zero, non-diagonal elements.
     * @param tolerance - The convergence tolerance.
     * @param maxIterations - The maximum number of iterations.
     * @param initialGuess - Optional initial guess for the solution vector.
     * @returns The solution vector.
     * @throws Error if a zero diagonal element is encountered or if the system cannot be solved.
     */
    public solve(
        tolerance = 1e-8,
        maxIterations = 1000,
        initialGuess?: number[]
    ): number[] {
        const n = this.vector.length;
        let x: number[] = initialGuess ? [...initialGuess] : Array(n).fill(0);

        // Check for zero diagonal elements before starting iterations
        const diagElements = Array(n);
        for (let i = 0; i < n; i++) {
            diagElements[i] = this.getDiagonalElement(i);
            if (diagElements[i] === 0) {
                throw new Error(`Zero diagonal element at row ${i}. Cannot proceed.`);
            }
        }

        // Check convergence criteria
        if (!this.checkConvergenceCriteria()) {
            console.warn('Convergence is not guaranteed for this matrix.');
        }

        // Proceed with Gauss-Seidel iterations
        let converged = false;

        for (let iteration = 0; iteration < maxIterations; iteration++) {
            const xOld = [...x];

            for (let i = 0; i < n; i++) {
                const nonDiagElements = this.getNonDiagonalNonZeroRowElements(i);
                let sum = 0;

                // Iterate over non-zero, non-diagonal elements
                for (const { index: j, value } of nonDiagElements) {
                    sum += value * x[j];
                }

                // Update the solution for the current variable
                x[i] = (this.vector[i] - sum) / diagElements[i];
            }

            // Compute the maximum absolute difference between iterations
            const error = Math.max(...x.map((xi, i) => Math.abs(xi - xOld[i])));

            // Archive iteration results if enabled
            if (this.archive) {
                this.archive.push({ old: xOld, new: [...x], error });
            }

            // Check for convergence
            if (error < tolerance) {
                converged = true;
                this.solved = 'solved';
                break;
            }
        }

        if (!converged) {
            console.warn(
                `Gauss-Seidel method did not converge within ${maxIterations} iterations.`
            );
            this.solved = 'did-not-converge';
        }

        return x;
    }

    /**
     * Checks if the matrix satisfies the convergence criteria for the Gauss-Seidel method.
     * @returns True if the method is expected to converge without modification; otherwise, false.
     */
    private checkConvergenceCriteria(): boolean {
        const property = this.matrix.property;
        return ( property=="diagonally-dominant" || property=="symmetric-positive-definite")
    }

    /**
     * Attempts to modify the matrix to make it diagonally dominant by rearranging rows.
     * @returns True if the matrix was modified to be diagonally dominant; otherwise, false.
     */
    private makeDiagonallyDominant(): boolean {
        const n = this.vector.length;
        const m = this.getMatrix();

        // Arrays to keep track of used rows and new arrangement
        const indices = Array.from({length: n}, (_, i) => i);
        const used = new Set<number>();
        const newMatrix: number[][] = [];
        const newVector: number[] = [];

        // Attempt to rearrange rows
        for (let i = 0; i < n; i++) {
            let found = false;
            for (let j of indices) {
                if (used.has(j)) continue;
                const row = m[j];
                const diag = Math.abs(row[i]);
                const sum = row.reduce((acc, val, idx) => acc + (idx !== i ? Math.abs(val) : 0), 0);
                if (diag >= sum) {
                    // Found a suitable row
                    newMatrix.push(row);
                    newVector.push(this.vector[j]);
                    used.add(j);
                    found = true;
                    break;
                }
            }
            if (!found) {
                // Cannot rearrange to make diagonally dominant
                return false;
            }
        }

        // Update the matrix and vector with the new arrangement
        this.matrix = this.storeMatrix(newMatrix);
        this.vector = newVector;
        return true;
    }

    /**
     * Performs Cholesky decomposition on a positive definite symmetric matrix.
     * @param matrix - The matrix to decompose.
     * @returns The lower triangular matrix L such that A = L * L^T.
     * @throws Error if the matrix is not positive definite.
     */
    private choleskyDecomposition(matrix: number[][]): number[][] {
        const n = matrix.length;
        const L = Array.from({length: n}, () => Array(n).fill(0));

        for (let i = 0; i < n; i++) {
            for (let j = 0; j <= i; j++) {
                let sum = 0;
                for (let k = 0; k < j; k++) {
                    sum += L[i][k] * L[j][k];
                }
                if (i === j) {
                    const val = matrix[i][i] - sum;
                    if (val <= 0) {
                        throw new Error('Matrix is not positive definite');
                    }
                    L[i][j] = Math.sqrt(val);
                } else {
                    L[i][j] = (matrix[i][j] - sum) / L[j][j];
                }
            }
        }
        return L;
    }

    /**
     * Reconstructs and returns the full matrix in standard 2D array form.
     * @returns The reconstructed matrix as a 2D array.
     */
    public getMatrix(): number[][] {
        const n = this.vector.length;
        const matrix: number[][] = Array.from({length: n}, () => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            matrix[i] = this.getRow(i);
        }
        return matrix;
    }

    /**
     * Gets the archived iteration results.
     * @returns An array of IterationResult or undefined if archiving is disabled.
     */
    public getResults(): IterationResult[] | undefined {
        return this.archive;
    }

    /**
     * Gets a row from the matrix regardless of storage type.
     * @param rowIndex - The index of the row to retrieve.
     * @returns The specified row as an array.
     * @throws Error if the matrix type is unsupported.
     */
    private getRow(rowIndex: number): number[] {
        const {type, data} = this.matrix;
        const n = this.vector.length;

        switch (type) {
            case 'dense':
                // For dense storage, return the row directly
                return (data as number[][])[rowIndex];
            case 'diagonal': {
                // For diagonal matrix, only the diagonal element is non-zero
                const row = Array(n).fill(0);
                row[rowIndex] = (data as number[])[rowIndex];
                return row;
            }
            case 'sparse': {
                // For sparse matrix in CSR format
                const row: number[] = Array(n).fill(0);
                const { values, colIndices, rowPointers } = data as SparseMatrixStorage['data'];
                const rowStart = rowPointers[rowIndex];
                const rowEnd = rowPointers[rowIndex + 1];

                for (let idx = rowStart; idx < rowEnd; idx++) {
                    const j = colIndices[idx];
                    row[j] = values[idx];
                }
                return row;
            }
            case 'band': {
                // For band matrix, reconstruct the row within the bandwidth
                const {bandWidth, data: bandData} = data as BandMatrixStorage['data'];
                const row = Array(n).fill(0);
                const startCol = Math.max(0, rowIndex - bandWidth);
                const endCol = Math.min(n - 1, rowIndex + bandWidth);
                for (let j = startCol; j <= endCol; j++) {
                    row[j] = bandData[rowIndex][j - startCol];
                }
                return row;
            }
            case 'lower-triangular': {
                // For lower triangular matrix, reconstruct the row
                const row = Array(n).fill(0);
                let dataIndex = (rowIndex * (rowIndex + 1)) / 2;
                const lowerData = data as number[];
                for (let j = 0; j <= rowIndex; j++) {
                    row[j] = lowerData[dataIndex++];
                }
                return row;
            }
            case 'upper-triangular': {
                // For upper triangular matrix, reconstruct the row
                const row = Array(n).fill(0);
                const totalElements = (n * (n + 1)) / 2;
                let dataIndex = totalElements - ((n - rowIndex) * (n - rowIndex + 1)) / 2;
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

    private addComplexity(target: PolynomialComplexity, added: number[]): void {
        const tLen = target.coefficients.length;
        const aLen = added.length;
        const maxLen = Math.max(tLen, aLen);
        const newCoeffs = new Array(maxLen).fill(0);

        // Align from the right (lowest terms align)
        for (let i = 0; i < maxLen; i++) {
            const tVal = (i < tLen) ? target.coefficients[tLen - i - 1] : 0;
            const aVal = (i < aLen) ? added[aLen - i - 1] : 0;
            newCoeffs[maxLen - i - 1] = tVal + aVal;
        }

        target.coefficients = newCoeffs;
    }

    /**
     * Retrieves the non-zero, non-diagonal elements of a row.
     * Optimized to avoid unnecessary computations and storage.
     * @param rowIndex - The index of the row.
     * @returns An array of objects containing the index and value of non-zero, non-diagonal elements.
     */
    private getNonDiagonalNonZeroRowElements(rowIndex: number): Array<{ index: number; value: number }> {
        const { type, data } = this.matrix;
        const n = this.vector.length;
        const elements: Array<{ index: number; value: number }> = [];

        switch (type) {
            case 'dense': {
                // For dense storage, iterate over the row
                const row = (data as number[][])[rowIndex];
                for (let j = 0; j < n; j++) {
                    if (j !== rowIndex && row[j] !== 0) {
                        elements.push({ index: j, value: row[j] });
                    }
                }
                break;
            }
            case 'diagonal':
                // For diagonal matrix, there are no non-diagonal, non-zero elements
                break;
            case 'sparse': {
                // For sparse matrix in CSR format
                const { values, colIndices, rowPointers } = data as SparseMatrixStorage['data'];
                const rowStart = rowPointers[rowIndex];
                const rowEnd = rowPointers[rowIndex + 1];

                for (let idx = rowStart; idx < rowEnd; idx++) {
                    const j = colIndices[idx];
                    if (j !== rowIndex) {
                        elements.push({ index: j, value: values[idx] });
                    }
                }
                break;
            }
            case 'band': {
                // For band matrix, iterate over the bandwidth
                const { bandWidth, data: bandData } = data as BandMatrixStorage['data'];
                const bandRow = bandData[rowIndex];
                const startCol = Math.max(0, rowIndex - bandWidth);
                for (let offset = 0; offset < bandRow.length; offset++) {
                    const j = startCol + offset;
                    const value = bandRow[offset];
                    if (j !== rowIndex && value !== 0) {
                        elements.push({ index: j, value });
                    }
                }
                break;
            }
            case 'lower-triangular': {
                // For lower triangular matrix, iterate from column 0 to rowIndex - 1
                let dataIndex = (rowIndex * (rowIndex + 1)) / 2;
                const lowerData = data as number[];
                for (let j = 0; j < rowIndex; j++) {
                    const value = lowerData[dataIndex++];
                    if (value !== 0) {
                        elements.push({ index: j, value });
                    }
                }
                // Skip the diagonal element
                dataIndex++; // Move past the diagonal element
                break;
            }
            case 'upper-triangular': {
                // For upper triangular matrix, iterate from rowIndex + 1 to n - 1
                const totalElements = (n * (n + 1)) / 2;
                let dataIndex = totalElements - ((n - rowIndex) * (n - rowIndex + 1)) / 2 + 1; // +1 to skip diagonal
                const upperData = data as number[];
                for (let j = rowIndex + 1; j < n; j++) {
                    const value = upperData[dataIndex++];
                    if (value !== 0) {
                        elements.push({ index: j, value });
                    }
                }
                break;
            }
            default:
                throw new Error(`Unsupported or unknown matrix type: ${type}`);
        }

        return elements;
    }

    /**
     * Retrieves the diagonal element of the matrix at the specified row index.
     * @param rowIndex - The index of the row.
     * @returns The diagonal element at the specified row.
     */
    private getDiagonalElement(rowIndex: number): number {
        const { type, data } = this.matrix;
        const n = this.vector.length;

        switch (type) {
            case 'dense':
                // For dense storage, return the diagonal element directly
                return (data as number[][])[rowIndex][rowIndex];
            case 'diagonal':
                // For diagonal matrix, retrieve from the stored diagonal elements
                return (data as number[])[rowIndex];
            case 'sparse': {
                // For sparse matrix in CSR format, search for the diagonal element in the row
                const { values, colIndices, rowPointers } = data as SparseMatrixStorage['data'];
                const rowStart = rowPointers[rowIndex];
                const rowEnd = rowPointers[rowIndex + 1];

                for (let idx = rowStart; idx < rowEnd; idx++) {
                    if (colIndices[idx] === rowIndex) {
                        return values[idx];
                    }
                }
                // If diagonal element is not present, it's zero
                return 0;
            }
            case 'band':
                // For band matrix, calculate the index of the diagonal element
                const { bandWidth, data: bandData } = data as BandMatrixStorage['data'];
                const bandRow = bandData[rowIndex];
                const diagIndex = rowIndex - Math.max(0, rowIndex - bandWidth);
                return bandRow[diagIndex];
            case 'lower-triangular': {
                // For lower triangular matrix, compute the index of the diagonal element
                let dataIndex = (rowIndex * (rowIndex + 1)) / 2 + rowIndex;
                return (data as number[])[dataIndex];
            }
            case 'upper-triangular': {
                // For upper triangular matrix, the diagonal element is the first in the row
                const totalElements = (n * (n + 1)) / 2;
                let dataIndex = totalElements - ((n - rowIndex) * (n - rowIndex + 1)) / 2;
                return (data as number[])[dataIndex];
            }
            default:
                throw new Error(`Unsupported or unknown matrix type: ${type}`);
        }
    }

    /**
     * Gets the status of the solver.
     * @returns A string indicating whether the solver has solved the system, not yet solved, or did not converge.
     */
    public getSolved(): 'not-yet' | 'solved' | 'did-not-converge' {
        return this.solved;
    }

    /**
     * Checks if the given matrix is symmetric.
     * @param matrix - The matrix to check.
     * @returns True if symmetric; otherwise, false.
     */
    private isSymmetric(matrix: number[][]): boolean {
        const n = matrix.length;
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                if (matrix[i][j] !== matrix[j][i]) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Checks if the given matrix is positive definite.
     * @param matrix - The matrix to check.
     * @returns True if positive definite; otherwise, false.
     */
    private isPositiveDefinite(matrix: number[][]): boolean {
        try {
            this.choleskyDecomposition(matrix);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Checks if the matrix is diagonally dominant.
     * @param matrix - The matrix to check.
     * @returns True if diagonally dominant; otherwise, false.
     */
    private isDiagonallyDominant(matrix: number[][]): boolean {
        return matrix.every((row, i) => {
            const diag = Math.abs(row[i]);
            const sum: number = row.reduce((acc, val, j) => acc + (i !== j ? Math.abs(val) : 0), 0);
            return diag >= sum;
        });
    }

    /**
     * Indicates whether the solver is archiving iteration results.
     * @returns True if archiving is enabled; otherwise, false.
     */
    public get isArchiving(): boolean {
        return typeof this.archive !== 'undefined';
    }

    /**
     * Generates a random matrix with specified properties.
     * @param length - The size of the matrix (number of rows and columns).
     * @param max - The maximum absolute value for the random elements.
     * @param property - The desired property of the matrix ('diagonally-dominant' or 'symmetric-positive-definite').
     * @returns A randomly generated matrix as a 2D array.
     */
    public static randomMatrix(
        length: number,
        max: number = 15,
        property: MatrixProperties['property'] = 'diagonally-dominant'
    ): number[][] {
        const matrix = Array.from({length}, () =>
            Array.from({length}, () => Math.floor(Math.random() * max))
        );
        if (property === 'diagonally-dominant') {
            // Adjust the matrix to be diagonally dominant
            for (let i = 0; i < length; i++) {
                const rowSum = matrix[i].reduce(
                    (sum, val, j) => sum + (i !== j ? Math.abs(val) : 0),
                    0
                );
                matrix[i][i] = rowSum + Math.floor(Math.random() * max) + 1; // Ensure diagonal dominance
            }
        } else if (property === 'symmetric-positive-definite') {
            // Generate a symmetric positive definite matrix
            // Create a random matrix A and compute A * A^T
            const A = Array.from({length}, () =>
                Array.from({length}, () => Math.random() * max)
            );
            for (let i = 0; i < length; i++) {
                for (let j = i; j < length; j++) {
                    let sum = 0;
                    for (let k = 0; k < length; k++) {
                        sum += A[i][k] * A[j][k];
                    }
                    matrix[i][j] = sum;
                    matrix[j][i] = sum; // Ensure symmetry
                }
            }
            // Optionally, make diagonal entries larger to ensure positive definiteness
            for (let i = 0; i < length; i++) {
                matrix[i][i] += length * max;
            }
        }
        return matrix;
    }

    /**
     * Generates a random vector.
     * @param length - The size of the vector.
     * @param max - The maximum absolute value for the random elements.
     * @returns A randomly generated vector as an array.
     */
    public static randomVector(length: number, max: number = 15): number[] {
        return Array.from({length}, () => Math.floor(Math.random() * max));
    }

    /**
     * Creates a MatrixSolver instance from JSON data.
     * @param input - The input data, which can be a File, JSON string, or an object.
     * @param archiveIterations - Whether to archive iteration results.
     * @returns A Promise that resolves to a MatrixSolver instance.
     * @throws Error if the JSON data is invalid or missing required properties.
     */
    public static async fromJSON(
        input: File | string | object,
        archiveIterations: boolean = true
    ): Promise<MatrixSolver> {
        try {
            let jsonData: any;
            if (input instanceof File) {
                // Read and parse JSON data from a File object
                const result = await input.text();
                jsonData = JSON.parse(result);
            } else if (typeof input === 'string') {
                // Parse JSON data from a string
                jsonData = JSON.parse(input);
            } else {
                // Use the object directly
                jsonData = input;
            }

            // Validate the JSON data
            if (!jsonData.matrix || !jsonData.vector) {
                throw new Error('JSON data must contain "matrix" and "vector" properties.');
            }

            if (!Array.isArray(jsonData.matrix) || !Array.isArray(jsonData.vector)) {
                throw new Error('"matrix" and "vector" must be arrays.');
            }

            // Create a new MatrixSolver instance
            const solver = new MatrixSolver(jsonData.matrix, jsonData.vector, archiveIterations);
            return solver;
        } catch (error) {
            throw new Error(`Failed to import from JSON: ${(error as Error).message}`);
        }
    }
}
