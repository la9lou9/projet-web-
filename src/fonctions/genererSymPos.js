export function genererSymPos(size) {
    let A = [];
    for (let i = 0; i < size; i++) {
        A[i] = [];
        for (let j = 0; j < size; j++) {
            A[i][j] = Math.floor(Math.random() * 2) + 1
        }
    }

    let AT = transpose(A);
    let SPD = multiplyMatrices(A, AT);

    for (let i = 0; i < size; i++) {
        SPD[i][i] += size;
    }

    return SPD;
}

function transpose(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i]));
}

function multiplyMatrices(A, B) {
    let result = [];
    for (let i = 0; i < A.length; i++) {
        result[i] = [];
        for (let j = 0; j < B[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < A[0].length; k++) {
                sum += A[i][k] * B[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}